import { and, asc, eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { kbArticles, notifications, prospects, tenants } from "../db/schema";
import { isOptOut } from "./intent";
import { OPT_OUT_REPLY } from "./prompt";
import type { LlmClient } from "./llm";
import type { AgentResult, HistoryMessage } from "./runner";
import type { Attachment } from "./tools";

export const ADMISSIONS_PROMPT_VERSION = "cum-admisiones-2026-10-09.1";
const TWO_DAYS = 48 * 60 * 60 * 1000;

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function admissionInterest(message: string) {
  const text = normalize(message);
  return /\b(prepa|preparatoria|bachillerato)\b/.test(text)
    ? "preparatoria" as const
    : /\b(secundaria|secunda)\b/.test(text)
      ? "secundaria" as const
      : null;
}

export function needsAdmissionsTeam(message: string) {
  const text = normalize(message);
  return /\b(visitar|visita|recorrido|conocer (el|la) (colegio|campus|escuela)|hablar con (una? |el |la )?(persona|asesor|asesora)|inscribir|inscripcion|costo|colegiatura|precio|examen|fecha)\b/.test(text);
}

/** Solo se ofrecen piezas conceptuales de la demo cuando la familia pide material. */
export function admissionsMaterial(message: string): Attachment[] {
  const text = normalize(message);
  const attachments: Attachment[] = [];
  if (/\b(pdf|folleto|brochure|documento|guia de admisiones)\b/.test(text)) attachments.push({
    kind: "document", mediaId: "cum-guia-pdf-demo", mime: "application/pdf",
    caption: "Guía inicial de admisiones · material de demostración; el CUM confirmará los datos vigentes.",
    filename: "Guia-admisiones-CUM-demo.pdf",
  });
  if (/\b(foto|fotos|imagen|imagenes|flyer|cartel|material visual)\b/.test(text)) attachments.push({
    kind: "image", mediaId: "cum-guia-visual-demo", mime: "image/png",
    caption: "Guía visual de admisiones · ilustración conceptual y material de demostración.",
  });
  return attachments;
}

/** Respuesta de admisiones: contexto aprobado, registro mínimo y traspaso a una persona. */
export async function runAdmissionsAgent(input: {
  db: Db;
  llm: LlmClient;
  tenant: typeof tenants.$inferSelect;
  prospect: typeof prospects.$inferSelect;
  incoming: { type: string; body: string | null }[];
  history: HistoryMessage[];
}): Promise<AgentResult> {
  const started = Date.now();
  const message = input.incoming.map((item) => item.body?.trim()).filter(Boolean).join("\n");
  const base: AgentResult = { reply: "", draft: null, toolTrace: [], blocked: [], attachments: [], modelsUsed: [], neurons: 0, latencyMs: 0, escalation: null, fallback: false, deterministic: false };
  if (isOptOut(message)) {
    await input.db.update(prospects).set({ optedOutAt: Date.now() }).where(eq(prospects.id, input.prospect.id));
    return { ...base, reply: OPT_OUT_REPLY, deterministic: true, latencyMs: Date.now() - started };
  }
  if (input.incoming.some((item) => item.type !== "text")) {
    return { ...base, reply: "Gracias por compartir el archivo. El equipo de admisiones lo revisará y te responderá por este medio.", deterministic: true, latencyMs: Date.now() - started };
  }

  const level = admissionInterest(message);
  const attachments = admissionsMaterial(message);
  const now = Date.now();
  await input.db.update(prospects).set({
    ...(level ? { educationLevel: level } : {}),
    leadChannel: "whatsapp",
    nextFollowupAt: now + TWO_DAYS,
    score: level ? Math.max(input.prospect.score, 40) : input.prospect.score,
    updatedAt: now,
  }).where(eq(prospects.id, input.prospect.id));

  const escalation = needsAdmissionsTeam(message) ? "otro" as const : null;
  if (escalation && !input.prospect.handoffAt) {
    await input.db.batch([
      input.db.update(prospects).set({ handoffAt: now, handoffReason: "admisiones" }).where(eq(prospects.id, input.prospect.id)),
      input.db.insert(notifications).values({
        tenantId: input.tenant.id,
        prospectId: input.prospect.id,
        kind: "handoff",
        title: "Familia requiere atención de admisiones",
        body: `Consultar conversación de ${input.prospect.name ?? input.prospect.profileName ?? "nuevo contacto"}.`,
      }),
    ]);
  }

  const articles = await input.db.select({ title: kbArticles.title, body: kbArticles.body })
    .from(kbArticles)
    .where(and(eq(kbArticles.tenantId, input.tenant.id), eq(kbArticles.status, "approved")))
    .orderBy(asc(kbArticles.title))
    .limit(12);
  const verified = articles.map((article) => `${article.title}: ${article.body}`).join("\n\n");
  const safe = "Con gusto te ayudo con información de secundaria y preparatoria del CUM. ¿Qué nivel y grado te interesa? Si buscas fechas, costos o una visita, el equipo de admisiones te lo confirmará por este medio.";
  let reply = safe;
  let draft: string | null = null;
  let neurons = 0;
  let model = "ninguno";
  let blocked: string[] = [];
  let fallback = false;
  const deterministic = input.llm.model === "fake";
  if (deterministic) {
    if (/\b(visita|visitar|recorrido|conocer)\b/.test(normalize(message))) reply = "¡Qué gusto que quieran conocer el CUM! Compárteme si les interesa secundaria o preparatoria y el equipo de admisiones les ayudará a coordinar una visita al campus.";
    else if (/\b(fecha|examen|costo|colegiatura|precio)\b/.test(normalize(message))) reply = "El equipo de admisiones te confirmará la información vigente sobre fechas y costos. ¿Buscas secundaria o preparatoria? También podemos ayudarte a conocer el campus.";
  } else if (!attachments.length) {
    try {
      const completion = await input.llm.complete({ tools: [], messages: [
        { role: "system", content: `Eres ${input.tenant.assistantName}, asistente de admisiones del Centro Universitario Montejo (CUM) en Mérida. Atiendes a madres, padres y tutores con calidez y brevedad por WhatsApp. El colegio ofrece secundaria y preparatoria. Su objetivo es que la familia conozca el campus y que el equipo dé seguimiento personal.\n\nNivel de interés ya detectado: ${level ?? input.prospect.educationLevel ?? "por confirmar"}. No vuelvas a preguntar por el nivel si ya está detectado; pregunta por el grado si hace falta.\n\nSolo puedes afirmar datos que aparezcan en INFORMACIÓN APROBADA. Si preguntan por fechas de examen, requisitos vigentes, cupos, colegiaturas, descuentos o pagos y esa información no está aprobada, di que admisiones la confirmará. No inventes ni prometas inscripción, aceptación, citas, fechas, costos o disponibilidad. No pidas ni proceses documentos del menor. No presiones para compartir datos. Pregunta una cosa a la vez: nivel o grado de interés, y ofrece conocer el campus. Si piden hablar con alguien, confirma que el equipo dará seguimiento. Nunca menciones herramientas ni el sistema.\n\nINFORMACIÓN APROBADA:\n${verified || "Solo está confirmado que el CUM ofrece secundaria y preparatoria en Mérida. No hay fechas ni costos aprobados."}` },
        ...input.history.slice(-12).map((item) => ({ role: item.direction === "in" ? "user" as const : "assistant" as const, content: item.body ?? `[${item.type}]` })),
        { role: "user", content: message },
      ] });
      neurons = completion.neurons;
      model = completion.model ?? input.llm.model;
      draft = completion.content?.trim() ?? null;
      if (completion.truncated || !draft) blocked.push("respuesta incompleta");
      if (draft && /\$\s*\d|\b\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i.test(draft) && !verified.includes(draft.match(/\$\s*\d[\d,.]*|\b\d{1,2}\s+de\s+\w+/i)?.[0] ?? "\u0000")) blocked.push("monto o fecha sin verificar");
      if (draft && /\b(ya (quedo|esta|fue) (inscrit|aceptad|agendad)|tu (inscripcion|visita) (esta|quedo) confirmad)/i.test(normalize(draft))) blocked.push("confirmación no realizada");
      if (blocked.length === 0 && draft) reply = draft;
      else fallback = true;
    } catch {
      blocked = ["modelo no disponible"];
      fallback = true;
    }
  }

  if (attachments.length) {
    const image = attachments.some((item) => item.kind === "image");
    const document = attachments.some((item) => item.kind === "document");
    reply = `Claro, te comparto ${image && document ? "la guía visual y el PDF" : image ? "la guía visual" : "el PDF"} de admisiones. Son materiales de demostración; el equipo del CUM confirmará fechas, requisitos y costos vigentes.`;
  }
  if (!input.prospect.privacyNoticeAt && input.tenant.privacyNoticeUrl) {
    reply += `\n\nAviso de privacidad: ${input.tenant.privacyNoticeUrl}`;
    await input.db.update(prospects).set({ privacyNoticeAt: now }).where(eq(prospects.id, input.prospect.id));
  }
  if (!level && !input.prospect.educationLevel) attachments.push({
    kind: "buttons", body: "¿Qué nivel les interesa?", buttons: [
      { title: "Secundaria", reply: "Me interesa secundaria" },
      { title: "Preparatoria", reply: "Me interesa preparatoria" },
      { title: "Hablar con asesor", reply: "Quiero hablar con un asesor" },
    ],
  });
  return { reply, draft, toolTrace: [], blocked, attachments, modelsUsed: deterministic || attachments.length ? [] : [model], neurons, latencyMs: Date.now() - started, escalation, fallback, deterministic: deterministic || attachments.length > 0 };
}
