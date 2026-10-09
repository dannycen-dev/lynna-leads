import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowRight, BarChart3, Bot, CalendarClock, CheckCheck, CheckCircle2, ContactRound, GraduationCap, LayoutGrid, List, MessageCircle, MoreVertical, Plus, Search, Send, Users } from "lucide-react";
import { Empty, ErrorAlert, PageHeader, Spinner } from "../components/ui";
import { MessageContent } from "../components/MessageContent";
import { useAddNote, useChangeStage, useProspect, useProspects, useSimulatorHistory, useSimulatorReset, useSimulatorSend } from "../lib/api";
import { apiFetch } from "../lib/api-client";
import { useSession } from "../lib/session";
import type { Prospect, ProspectStage } from "../lib/types";
import "../styles/admisiones.css";
import "../styles/admissions-wa.css";
import { AdmissionsBI, type AdmissionsReportData } from "./AdmissionsBI";

const STAGES: { value: ProspectStage; label: string }[] = [
  { value: "new", label: "Nuevo" },
  { value: "qualified", label: "Interés identificado" },
  { value: "appointment", label: "Visita por coordinar" },
  { value: "visited", label: "Conoció el campus" },
  { value: "won", label: "Inscripción confirmada" },
  { value: "lost", label: "Sin continuidad" },
];
const CHANNEL: Record<string, string> = { whatsapp: "WhatsApp", correo: "Correo", web: "Sitio web", telefono: "Teléfono", presencial: "Presencial" };
const date = (ms: number) => new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Merida" }).format(new Date(ms));
const stageName = (value: string) => STAGES.find((item) => item.value === value)?.label ?? "En seguimiento";
const nameOf = (lead: Prospect) => lead.name ?? lead.profileName ?? "Familia sin nombre";
const phoneOf = (phone: string) => /^\d{10,15}$/.test(phone) ? `+${phone}` : "Sin teléfono";

type Report = AdmissionsReportData;

function useAdmissionsReport() {
  const { tenant } = useSession();
  return useQuery({ queryKey: [tenant, "admissions-report"], queryFn: () => apiFetch<Report>(`/api/admin/tenants/${encodeURIComponent(tenant)}/admissions/report`), enabled: Boolean(tenant), refetchInterval: 30_000 });
}

export function AdmissionsDashboard() {
  const report = useAdmissionsReport();
  const leads = useProspects({}, 200);
  const due = useMemo(() => (leads.data?.items ?? []).filter((lead) => lead.nextFollowupAt && lead.nextFollowupAt <= Date.now() && lead.stage !== "won" && lead.stage !== "lost").slice(0, 5), [leads.data]);
  return <div className="page admissions-page">
    <section className="admissions-hero">
      <img src="/cum-logo.png" alt="Centro Universitario Montejo" />
      <div><span className="admissions-eyebrow">LYNNA LEADS · CUM</span><h1>Admisiones con seguimiento claro</h1><p>Una vista del interés de las familias, sus conversaciones y los próximos contactos.</p><Link className="admissions-hero__link" to="/admisiones"><ContactRound size={16} /> Abrir CRM de admisiones <ArrowRight size={16} /></Link></div>
    </section>
    <ErrorAlert error={report.error} />
    {report.isPending ? <Spinner /> : report.data && <>
      <div className="admissions-kpis">
        <div className="card admissions-kpi"><Users size={19} /><span>Familias en el CRM</span><strong>{report.data.total}</strong></div>
        <div className="card admissions-kpi"><MessageCircle size={19} /><span>Nuevas en 48 horas</span><strong>{report.data.newLast48h}</strong></div>
        <div className="card admissions-kpi"><CalendarClock size={19} /><span>Seguimientos pendientes</span><strong>{report.data.followupsDue}</strong></div>
        <div className="card admissions-kpi"><GraduationCap size={19} /><span>Interés en secundaria</span><strong>{report.data.byLevel.secundaria ?? 0}</strong></div>
      </div>
      <div className="admissions-grid">
        <section className="card admissions-panel"><div className="admissions-panel__head"><h2>Embudo de admisiones</h2><Link to="/admisiones">Ver contactos <ArrowRight size={15} /></Link></div><div className="admissions-funnel">{STAGES.map((stage) => <div key={stage.value}><span>{stage.label}</span><div className="admissions-bar"><i style={{ width: `${report.data!.total ? Math.max(5, (report.data!.byStage[stage.value] ?? 0) / report.data!.total * 100) : 0}%` }} /></div><strong>{report.data!.byStage[stage.value] ?? 0}</strong></div>)}</div></section>
        <section className="card admissions-panel"><div className="admissions-panel__head"><h2>Contactar hoy</h2><Link to="/admisiones">Abrir lista <ArrowRight size={15} /></Link></div>{due.length ? <div className="admissions-due">{due.map((lead) => <Link key={lead.id} to={`/admisiones/${lead.id}`}><span><strong>{nameOf(lead)}</strong><small>{lead.educationLevel ?? "Nivel por confirmar"} · {CHANNEL[lead.leadChannel ?? ""] ?? "Canal por confirmar"}</small></span><ArrowRight size={16} /></Link>)}</div> : <p className="muted">No hay seguimientos vencidos.</p>}</section>
      </div>
      <div className="admissions-actions"><Link className="btn btn--primary" to="/admisiones"><Users size={16} /> Abrir CRM</Link><Link className="btn" to="/reportes"><BarChart3 size={16} /> Ver reportes</Link><Link className="btn" to="/agente"><Bot size={16} /> Probar asistente</Link></div>
    </>}
  </div>;
}

export function AdmissionsReports() {
  const report = useAdmissionsReport();
  return <AdmissionsBI data={report.data} pending={report.isPending} error={report.error} refreshing={report.isFetching} onRefresh={() => void report.refetch()} />;
}

const LEVEL_LABEL: Record<string, string> = { secundaria: "Secundaria", preparatoria: "Preparatoria" };

type LeadForm = { name: string; phone: string; email: string; studentName: string; educationLevel: "" | "secundaria" | "preparatoria"; targetGrade: string; leadChannel: "whatsapp" | "correo" | "web" | "telefono" | "presencial" };
const blank: LeadForm = { name: "", phone: "", email: "", studentName: "", educationLevel: "", targetGrade: "", leadChannel: "correo" };

export function AdmissionsLeads() {
  const { tenant } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<ProspectStage | "all">("all");
  const [levelFilter, setLevelFilter] = useState<"all" | "secundaria" | "preparatoria">("all");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [limit, setLimit] = useState(200);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeadForm>(blank);
  const report = useAdmissionsReport();
  useEffect(() => { const timer = setTimeout(() => setQuery(search.trim()), 250); return () => clearTimeout(timer); }, [search]);
  const leads = useProspects({
    ...(query ? { q: query } : {}),
    ...(stageFilter !== "all" ? { stage: stageFilter } : {}),
    ...(levelFilter !== "all" ? { educationLevel: levelFilter } : {}),
  }, limit);
  const changeStage = useChangeStage();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<ProspectStage | null>(null);
  const create = useMutation({ mutationFn: () => apiFetch<Prospect>(`/api/admin/tenants/${encodeURIComponent(tenant)}/prospects`, { method: "POST", body: JSON.stringify({ ...form, educationLevel: form.educationLevel || undefined }) }), onSuccess: (lead) => { void qc.invalidateQueries({ queryKey: [tenant] }); setOpen(false); setForm(blank); navigate(`/admisiones/${lead.id}`); } });
  const allLeads = leads.data?.items ?? [];
  const shown = allLeads;
  const total = report.data?.total ?? leads.data?.total ?? allLeads.length;
  const stageCount = (stage: ProspectStage) => report.data?.byStage[stage] ?? allLeads.filter((lead) => lead.stage === stage).length;
  const move = (lead: Prospect, next: ProspectStage) => {
    if (lead.stage === next || changeStage.isPending) return;
    changeStage.mutate({ id: lead.id, stage: next, ...(next === "lost" ? { reason: "Sin continuidad en la demo" } : {}) }, { onSuccess: () => void qc.invalidateQueries({ queryKey: [tenant, "admissions-report"] }) });
  };
  return <div className="page admissions-page">
    <PageHeader title="CRM de admisiones" subtitle="Cada familia, conversación y siguiente paso en un solo lugar." actions={<button className="btn btn--primary" onClick={() => setOpen((value) => !value)}><Plus size={16} /> Nueva familia</button>} />
    <div className="admissions-crm-intro"><div className="admissions-crm-intro__icon"><ContactRound size={27} /></div><div><strong>De la primera consulta a la inscripción</strong><span>Registra el interés, cambia la etapa y programa el próximo contacto desde la ficha de cada familia.</span></div></div>
    <div className="admissions-crm-summary" aria-label="Resumen del CRM">
      <div className="card"><Users size={18} /><span>Familias registradas</span><strong>{total}</strong></div>
      <div className="card"><MessageCircle size={18} /><span>Etapa: Nuevo</span><strong>{stageCount("new")}</strong></div>
      <div className="card"><CalendarClock size={18} /><span>Visitas por coordinar</span><strong>{stageCount("appointment")}</strong></div>
      <div className="card"><CheckCircle2 size={18} /><span>Inscripciones</span><strong>{stageCount("won")}</strong></div>
    </div>
    {open && <form className="card admissions-form" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
      <h2>Registrar familia</h2><p className="muted">Usa datos ficticios en esta prueba de concepto.</p>
      <div className="admissions-form__grid">
        <label>Nombre de madre, padre o tutor<input className="input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Canal<select className="select" value={form.leadChannel} onChange={(event) => setForm({ ...form, leadChannel: event.target.value as LeadForm["leadChannel"] })}>{Object.entries(CHANNEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Teléfono<input className="input" inputMode="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="9991234567" /></label>
        <label>Correo<input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="familia@ejemplo.com" /></label>
        <label>Nivel de interés<select className="select" value={form.educationLevel} onChange={(event) => setForm({ ...form, educationLevel: event.target.value as LeadForm["educationLevel"] })}><option value="">Por confirmar</option><option value="secundaria">Secundaria</option><option value="preparatoria">Preparatoria</option></select></label>
        <label>Grado de interés<input className="input" value={form.targetGrade} onChange={(event) => setForm({ ...form, targetGrade: event.target.value })} placeholder="Ej. primero" /></label>
      </div><ErrorAlert error={create.error} /><div className="row"><button className="btn btn--primary" disabled={create.isPending || (!form.phone && !form.email)} type="submit">{create.isPending ? "Guardando…" : "Guardar contacto"}</button><button className="btn" type="button" onClick={() => setOpen(false)}>Cancelar</button></div>
    </form>}
    <div className="admissions-crm-filters" aria-label="Filtrar por etapa">
      <button className={stageFilter === "all" ? "is-active" : ""} onClick={() => setStageFilter("all")}>Todas <span>{total}</span></button>
      {STAGES.map((stage) => <button key={stage.value} className={stageFilter === stage.value ? "is-active" : ""} onClick={() => setStageFilter(stage.value)}>{stage.label} <span>{stageCount(stage.value)}</span></button>)}
    </div>
    <div className="admissions-toolbar"><Search size={17} /><input className="input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar familia, estudiante o contacto" aria-label="Buscar en el CRM" /><select className="select" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as typeof levelFilter)} aria-label="Filtrar por nivel"><option value="all">Todos los niveles</option><option value="secundaria">Secundaria</option><option value="preparatoria">Preparatoria</option></select><span>{leads.data?.total ?? shown.length} {leads.data?.total === 1 ? "resultado" : "resultados"} · {total} familias</span><div className="admissions-view-switch" role="group" aria-label="Vista del CRM"><button type="button" className={view === "kanban" ? "is-active" : ""} aria-pressed={view === "kanban"} onClick={() => setView("kanban")}><LayoutGrid size={15} /> Kanban</button><button type="button" className={view === "list" ? "is-active" : ""} aria-pressed={view === "list"} onClick={() => setView("list")}><List size={15} /> Lista</button></div></div>
    <ErrorAlert error={leads.error} /><ErrorAlert error={changeStage.error} />{leads.isPending ? <Spinner /> : shown.length ? view === "kanban" ? <div className="admissions-kanban" aria-label="Tablero de admisiones">{STAGES.map((stage) => { const items = shown.filter((lead) => lead.stage === stage.value); return <section key={stage.value} className={`admissions-kanban__column admissions-kanban__column--${stage.value}${over === stage.value ? " is-over" : ""}`} aria-label={stage.label} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOver(stage.value); }} onDragLeave={() => setOver((current) => current === stage.value ? null : current)} onDrop={(event) => { event.preventDefault(); setOver(null); const lead = shown.find((item) => item.id === event.dataTransfer.getData("text/plain")); if (lead) move(lead, stage.value); }}><header><span>{stage.label}</span><strong>{items.length}</strong></header><div className="admissions-kanban__cards">{items.map((lead) => <article key={lead.id} className={`admissions-kanban__card${dragging === lead.id ? " is-dragging" : ""}`} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", lead.id); event.dataTransfer.effectAllowed = "move"; setDragging(lead.id); }} onDragEnd={() => { setDragging(null); setOver(null); }}><Link to={`/admisiones/${lead.id}`} className="admissions-kanban__name">{nameOf(lead)}<ArrowRight size={14} /></Link><span className="admissions-kanban__level">{lead.educationLevel ? LEVEL_LABEL[lead.educationLevel] : "Nivel por confirmar"}{lead.targetGrade ? ` · ${lead.targetGrade}` : ""}</span><div className="admissions-kanban__meta"><span>{CHANNEL[lead.leadChannel ?? ""] ?? "Simulador"}</span><span>{lead.messageCount} mensajes</span></div>{lead.nextFollowupAt && <div className={`admissions-kanban__followup${lead.nextFollowupAt < Date.now() ? " is-due" : ""}`}><CalendarClock size={13} /> {date(lead.nextFollowupAt)}</div>}<label className="admissions-kanban__move">Mover a<select className="select" aria-label={`Mover a ${nameOf(lead)}`} value={lead.stage} disabled={changeStage.isPending} onChange={(event) => move(lead, event.target.value as ProspectStage)}>{STAGES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></article>)}{items.length === 0 && <p className="admissions-kanban__empty">Arrastra aquí una familia</p>}</div></section>; })}</div> : <div className="card admissions-table"><table><thead><tr><th>Familia</th><th>Interés</th><th>Etapa</th><th>Canal</th><th>Próximo contacto</th></tr></thead><tbody>{shown.map((lead) => <tr key={lead.id} onClick={() => navigate(`/admisiones/${lead.id}`)}><td><Link to={`/admisiones/${lead.id}`}><strong>{nameOf(lead)}</strong><small>{lead.email ?? phoneOf(lead.phone)}</small></Link></td><td>{lead.educationLevel ?? "Por confirmar"}{lead.targetGrade ? ` · ${lead.targetGrade}` : ""}</td><td><span className="admissions-stage">{stageName(lead.stage)}</span></td><td>{CHANNEL[lead.leadChannel ?? ""] ?? "Simulador"}</td><td>{lead.nextFollowupAt ? date(lead.nextFollowupAt) : "—"}</td></tr>)}</tbody></table></div> : <Empty title="No hay familias con estos filtros" />}
    {(leads.data?.total ?? 0) > shown.length && <div className="admissions-load-more"><button className="btn" disabled={leads.isFetching} onClick={() => setLimit((current) => current + 200)}>{leads.isFetching ? "Cargando…" : `Cargar ${Math.min(200, (leads.data?.total ?? 0) - shown.length)} más`}</button></div>}
  </div>;
}

export function AdmissionsDetail() {
  const { id } = useParams();
  const { tenant } = useSession();
  const qc = useQueryClient();
  const detail = useProspect(id);
  const stage = useChangeStage();
  const note = useAddNote(id ?? "");
  const [noteText, setNoteText] = useState("");
  const [reply, setReply] = useState("");
  const update = useMutation({ mutationFn: (nextFollowupAt: number | null) => apiFetch(`/api/admin/tenants/${encodeURIComponent(tenant)}/prospects/${encodeURIComponent(id ?? "")}/admissions`, { method: "PATCH", body: JSON.stringify({ nextFollowupAt }) }), onSuccess: () => void qc.invalidateQueries({ queryKey: [tenant] }) });
  const send = useMutation({ mutationFn: () => apiFetch(`/api/admin/tenants/${encodeURIComponent(tenant)}/conversations/${encodeURIComponent(detail.data?.conversation?.id ?? "")}/messages`, { method: "POST", body: JSON.stringify({ body: reply }) }), onSuccess: () => { setReply(""); void qc.invalidateQueries({ queryKey: [tenant] }); } });
  if (detail.isPending) return <div className="page"><Spinner /></div>;
  if (!detail.data) return <div className="page"><Empty title="Contacto no encontrado" /></div>;
  const lead = detail.data.prospect;
  return <div className="page admissions-page"><Link className="admissions-back" to="/admisiones"><ArrowLeft size={16} /> Volver a contactos</Link><PageHeader title={nameOf(lead)} subtitle={`${CHANNEL[lead.leadChannel ?? ""] ?? "Simulador"} · ${lead.educationLevel ?? "Nivel por confirmar"}`} />
    <div className="admissions-grid"><section className="card admissions-panel"><h2>Seguimiento</h2><dl className="admissions-facts"><div><dt>Teléfono</dt><dd>{phoneOf(lead.phone)}</dd></div><div><dt>Correo</dt><dd>{lead.email ?? "Por confirmar"}</dd></div><div><dt>Estudiante</dt><dd>{lead.studentName ?? "Por confirmar"}</dd></div><div><dt>Grado</dt><dd>{lead.targetGrade ?? "Por confirmar"}</dd></div><div><dt>Próximo contacto</dt><dd>{lead.nextFollowupAt ? date(lead.nextFollowupAt) : "Sin fecha"}</dd></div></dl>
      <label className="admissions-field">Etapa<select className="select" value={lead.stage} onChange={(event) => stage.mutate({ id: lead.id, stage: event.target.value as ProspectStage, ...(event.target.value === "lost" ? { reason: "Sin continuidad en la demo" } : {}) })}>{STAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><ErrorAlert error={stage.error} />
      <div className="row"><button className="btn" onClick={() => update.mutate(Date.now() + 48 * 60 * 60 * 1000)}>Contactar en 2 días</button><button className="btn" onClick={() => update.mutate(null)}>Marcar atendido</button></div><ErrorAlert error={update.error} />
      <h3>Notas del equipo</h3><div className="admissions-notes">{detail.data.notes.map((item) => <div key={item.id}><p>{item.body}</p><small>{date(item.createdAt)} · {item.authorName ?? "Equipo"}</small></div>)}</div><form onSubmit={(event) => { event.preventDefault(); note.mutate(noteText, { onSuccess: () => setNoteText("") }); }}><textarea className="textarea" value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Registrar llamada, duda o siguiente paso" /><button className="btn" disabled={!noteText.trim() || note.isPending}>Guardar nota</button></form><ErrorAlert error={note.error} />
    </section><section className="card admissions-panel"><h2>Conversación</h2>{detail.data.messages.length ? <div className="admissions-messages">{detail.data.messages.map((message) => <div className={`admissions-message admissions-message--${message.direction}`} key={message.id}><div className="admissions-message__content"><MessageContent m={message} /></div><small>{message.author === "ai" ? "Lynna" : message.author === "user" ? "Equipo" : "Familia"} · {date(message.createdAt)}</small></div>)}</div> : <p className="muted">Este contacto todavía no tiene mensajes en Lynna.</p>}{detail.data.conversation && <form className="admissions-reply" onSubmit={(event) => { event.preventDefault(); send.mutate(); }}><textarea className="textarea" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Responder como equipo de admisiones" /><button className="btn btn--primary" disabled={!reply.trim() || send.isPending}><Send size={15} /> Enviar respuesta</button><p className="field__hint">Si la conversación es de WhatsApp, se respeta la ventana de 24 horas de Meta.</p><ErrorAlert error={send.error} /></form>}</section></div>
  </div>;
}

const SUGGESTIONS = ["Hola, quiero información para secundaria", "¿Cuándo es el examen de admisión?", "¿Cuánto cuesta la preparatoria?", "¿Podemos conocer el colegio?", "¿Me compartes un flyer de la escuela?", "¿Tienen una guía de admisiones en PDF?"];
export function AdmissionsSimulator() {
  const history = useSimulatorHistory();
  const send = useSimulatorSend();
  const reset = useSimulatorReset();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = history.data?.messages ?? [];
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages.length]);
  function submit(event: FormEvent) { event.preventDefault(); if (!text.trim()) return; send.mutate({ message: text.trim() }, { onSuccess: () => setText("") }); }
  const last = messages.at(-1);
  const time = (ms: number) => new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Merida" }).format(ms);
  return <div className="page admissions-page admissions-wa-page">
    <PageHeader title="Probar a Lynna" subtitle="Conversa como una familia interesada en el CUM. El asistente registra la interacción en el CRM." />
    <div className="admissions-wa-shell">
      <aside className="admissions-wa-sidebar" aria-label="Opciones de la demostración">
        <div className="admissions-wa-sidebar__top"><span className="admissions-wa-sidebar__avatar">C</span><strong>Demo de admisiones</strong><span className="admissions-wa-sidebar__menu"><MoreVertical size={19} /></span></div>
        <div className="admissions-wa-sidebar__search"><Search size={16} /> Conversaciones de prueba</div>
        <button className="admissions-wa-contact" type="button" onClick={() => scrollRef.current?.focus()}><span className="admissions-wa-contact__avatar"><img src="/cum-logo.png" alt="" /></span><span><strong>Lynna · CUM</strong><small>{last?.body?.slice(0, 52) ?? "Inicia una conversación"}</small></span><time>{last ? time(last.createdAt) : ""}</time></button>
        <div className="admissions-wa-sidebar__body"><h2>Preguntas para probar</h2><div className="admissions-wa-prompts">{SUGGESTIONS.map((example) => <button type="button" key={example} onClick={() => send.mutate({ message: example })} disabled={send.isPending}>{example}</button>)}</div></div>
        <div className="admissions-wa-sidebar__foot"><button className="btn" type="button" onClick={() => reset.mutate()} disabled={reset.isPending}>Nueva conversación</button><Link to="/admisiones">Ver en el CRM <ArrowRight size={15} /></Link></div>
      </aside>
      <section className="admissions-wa-conversation" aria-label="Chat simulado con Lynna">
        <header className="admissions-wa-conversation__header"><span className="admissions-wa-contact__avatar"><img src="/cum-logo.png" alt="" /></span><span><strong>Lynna · Admisiones CUM</strong><small>Asistente de admisiones · demo</small></span><span className="admissions-wa-conversation__badge">SIMULADOR</span></header>
        <div className="admissions-wa-chat" ref={scrollRef} tabIndex={0} aria-label="Historial de la conversación simulada" onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const step = event.key === "ArrowDown" ? 48 : event.key === "ArrowUp" ? -48 : event.key === "PageDown" ? event.currentTarget.clientHeight * .8 : event.key === "PageUp" ? -event.currentTarget.clientHeight * .8 : null;
          if (step !== null) { event.preventDefault(); event.currentTarget.scrollBy({ top: step }); }
          if (event.key === "Home" || event.key === "End") { event.preventDefault(); event.currentTarget.scrollTop = event.key === "Home" ? 0 : event.currentTarget.scrollHeight; }
        }}>
          <div className="admissions-wa-date">{new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Merida" }).format(messages[0]?.createdAt ?? Date.now())}</div>
          <div className="admissions-wa-notice">Esta conversación es una prueba dentro de Lynna. No envía mensajes a WhatsApp.</div>
          {history.isPending ? <Spinner /> : messages.length ? messages.map((message) => <div className={`admissions-wa-bubble admissions-wa-bubble--${message.direction === "in" ? "family" : "lynna"}`} key={message.id}><div className="admissions-wa-bubble__content"><MessageContent m={message} /></div><div className="admissions-wa-bubble__meta">{time(message.createdAt)}{message.direction === "in" && <CheckCheck size={14} aria-label="Mensaje de prueba registrado" />}</div></div>) : <div className="admissions-wa-empty"><MessageCircle size={30} /><strong>Hola, soy Lynna</strong><span>Escribe una pregunta sobre admisiones o elige una de la lista para ver cómo respondería.</span></div>}
          {send.isPending && <div className="admissions-wa-typing"><span /><span /><span /> Lynna está respondiendo</div>}
        </div>
        <form className="admissions-wa-compose" onSubmit={submit}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Escribe un mensaje" aria-label="Mensaje para el simulador" /><button type="submit" disabled={send.isPending || !text.trim()} aria-label="Enviar mensaje de prueba"><Send size={19} /></button></form>
        <ErrorAlert error={send.error ?? reset.error ?? history.error} />
      </section>
    </div>
    <div className="admissions-wa-below"><div><strong>Material de demostración</strong><span>La asistente adjunta la imagen o el PDF cuando se los pides en el chat.</span></div><a href="/materiales/guia-admisiones-demo.png" target="_blank" rel="noreferrer">Ver imagen</a><a href="/materiales/guia-admisiones-demo.pdf" target="_blank" rel="noreferrer">Ver PDF</a>{send.data?.prospect?.educationLevel && <span className="admissions-wa-level"><GraduationCap size={16} /> Interés: {send.data.prospect.educationLevel}</span>}</div>
  </div>;
}
