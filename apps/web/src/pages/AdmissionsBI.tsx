import { useMemo, useState } from "react";
import { Link } from "react-router";
import { BarChart3, CalendarClock, CheckCircle2, Download, Printer, Users } from "lucide-react";
import { ErrorAlert, PageHeader, Spinner } from "../components/ui";
import "../styles/admissions-bi.css";

export type AdmissionsReportData = {
  total: number;
  newLast48h: number;
  followupsDue: number;
  byStage: Record<string, number>;
  byChannel: Record<string, number>;
  byLevel: Record<string, number>;
  leads: { id: string; name: string | null; stage: string; channel: string | null; level: string | null; followup: number | null; createdAt: number }[];
};

const STAGES = [
  ["new", "Nuevo"], ["qualified", "Interés identificado"], ["appointment", "Visita por coordinar"],
  ["visited", "Conoció el campus"], ["won", "Inscripción confirmada"], ["lost", "Sin continuidad"],
] as const;
const CHANNELS = [
  ["whatsapp", "WhatsApp"], ["web", "Sitio web"], ["correo", "Correo"],
  ["telefono", "Teléfono"], ["presencial", "Presencial"],
] as const;
const stageLabel = (value: string) => STAGES.find(([key]) => key === value)?.[1] ?? value;
const channelLabel = (value: string | null) => CHANNELS.find(([key]) => key === value)?.[1] ?? "Sin canal";
const levelLabel = (value: string | null) => value === "secundaria" ? "Secundaria" : value === "preparatoria" ? "Preparatoria" : "Por confirmar";
const date = (value: number) => new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Merida" }).format(value);

export function AdmissionsBI({ data, pending, error, onRefresh, refreshing }: {
  data?: AdmissionsReportData;
  pending: boolean;
  error: unknown;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [days, setDays] = useState("90");
  const [stage, setStage] = useState("all");
  const [channel, setChannel] = useState("all");
  const [level, setLevel] = useState("all");
  const rows = useMemo(() => (data?.leads ?? []).filter((lead) =>
    (days === "all" || lead.createdAt >= Date.now() - Number(days) * 86_400_000) &&
    (stage === "all" || lead.stage === stage) &&
    (channel === "all" || lead.channel === channel) &&
    (level === "all" || lead.level === level),
  ).sort((a, b) => b.createdAt - a.createdAt), [data, days, stage, channel, level]);
  const counts = (key: "stage" | "channel" | "level") => rows.reduce<Record<string, number>>((result, lead) => {
    const value = lead[key] ?? "none";
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
  const byStage = counts("stage");
  const byChannel = counts("channel");
  const byLevel = counts("level");
  const won = byStage.won ?? 0;
  const due = rows.filter((lead) => lead.followup && lead.followup <= Date.now() && lead.stage !== "won" && lead.stage !== "lost").length;
  const weeks = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const lead of rows) {
      const local = new Date(lead.createdAt);
      const monday = new Date(local.getFullYear(), local.getMonth(), local.getDate() - (local.getDay() + 6) % 7);
      const key = monday.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets].sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  }, [rows]);
  const maxWeek = Math.max(1, ...weeks.map(([, count]) => count));
  const exportCsv = () => {
    const safe = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
    const csv = ["Familia,Fecha,Etapa,Canal,Nivel,Próximo contacto", ...rows.map((lead) => [lead.name ?? "Familia sin nombre", date(lead.createdAt), stageLabel(lead.stage), channelLabel(lead.channel), levelLabel(lead.level), lead.followup ? date(lead.followup) : ""].map(safe).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "informe-admisiones-cum.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return <div className="page admissions-page admissions-bi">
    <PageHeader title="Reportes de admisiones" subtitle="Avance del embudo, origen de familias y próximos contactos." actions={<div className="row admissions-bi__actions"><button className="btn" onClick={onRefresh} disabled={refreshing}>Actualizar</button><button className="btn" onClick={exportCsv} disabled={!rows.length}><Download size={16} /> CSV</button><button className="btn btn--primary" onClick={() => window.print()} disabled={!data}><Printer size={16} /> Imprimir informe</button></div>} />
    <p className="admissions-bi__demo">Informe de demostración · Los contactos precargados son ficticios. Los nuevos contactos se incorporan al CRM y a estas cifras.</p>
    <ErrorAlert error={error} />
    {pending ? <Spinner /> : data && <>
      <div className="admissions-bi__filters" aria-label="Filtros del informe">
        <label>Periodo<select className="select" value={days} onChange={(e) => setDays(e.target.value)}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="all">Todo el historial</option></select></label>
        <label>Etapa<select className="select" value={stage} onChange={(e) => setStage(e.target.value)}><option value="all">Todas</option>{STAGES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Canal<select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}><option value="all">Todos</option>{CHANNELS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Nivel<select className="select" value={level} onChange={(e) => setLevel(e.target.value)}><option value="all">Todos</option><option value="secundaria">Secundaria</option><option value="preparatoria">Preparatoria</option></select></label>
      </div>
      <div className="admissions-bi__print-head"><img src="/cum-logo.png" alt="" /><span><strong>Lynna Leads · CUM</strong><br />Informe de admisiones · {date(Date.now())}<br />Periodo: {days === "all" ? "todo el historial" : `últimos ${days} días`} · Etapa: {stage === "all" ? "todas" : stageLabel(stage)} · Canal: {channel === "all" ? "todos" : channelLabel(channel)} · Nivel: {level === "all" ? "todos" : levelLabel(level)}</span></div>
      <div className="admissions-kpis admissions-bi__kpis">
        <div className="card admissions-kpi"><Users size={19} /><span>Familias en el periodo</span><strong>{rows.length}</strong></div>
        <div className="card admissions-kpi"><CheckCircle2 size={19} /><span>Inscripciones confirmadas</span><strong>{won}</strong></div>
        <div className="card admissions-kpi"><BarChart3 size={19} /><span>Conversión</span><strong>{rows.length ? Math.round(won / rows.length * 100) : 0}%</strong></div>
        <div className="card admissions-kpi"><CalendarClock size={19} /><span>Seguimientos vencidos</span><strong>{due}</strong></div>
      </div>
      <div className="admissions-bi__charts">
        <section className="card admissions-panel"><h2>Familias por semana</h2><div className="admissions-bi__trend" role="img" aria-label="Llegadas por semana">{weeks.length ? weeks.map(([week, count]) => <div key={week}><span>{count}</span><i style={{ height: `${Math.max(7, count / maxWeek * 100)}%` }} /><small>{week.slice(5)}</small></div>) : <p className="muted">Sin registros en el periodo.</p>}</div></section>
        <section className="card admissions-panel"><h2>Etapas de admisión</h2><div className="admissions-bi__bars">{STAGES.map(([key, label]) => <div key={key}><span>{label}</span><div><i style={{ width: `${rows.length ? (byStage[key] ?? 0) / rows.length * 100 : 0}%` }} /></div><strong>{byStage[key] ?? 0}</strong></div>)}</div></section>
      </div>
      <div className="admissions-bi__charts">
        <section className="card admissions-panel"><h2>Origen de las familias</h2><table className="admissions-bi__summary"><thead><tr><th>Canal</th><th>Familias</th><th>Participación</th></tr></thead><tbody>{CHANNELS.map(([key, label]) => <tr key={key}><td>{label}</td><td>{byChannel[key] ?? 0}</td><td>{rows.length ? Math.round((byChannel[key] ?? 0) / rows.length * 100) : 0}%</td></tr>)}</tbody></table></section>
        <section className="card admissions-panel"><h2>Nivel de interés</h2><table className="admissions-bi__summary"><thead><tr><th>Nivel</th><th>Familias</th><th>Participación</th></tr></thead><tbody>{["secundaria", "preparatoria", "none"].map((key) => <tr key={key}><td>{levelLabel(key)}</td><td>{byLevel[key] ?? 0}</td><td>{rows.length ? Math.round((byLevel[key] ?? 0) / rows.length * 100) : 0}%</td></tr>)}</tbody></table></section>
      </div>
      <section className="card admissions-panel admissions-bi__detail"><div className="admissions-panel__head"><h2>Detalle del informe</h2><span>{rows.length} {rows.length === 1 ? "familia" : "familias"}</span></div><div className="admissions-bi__table-wrap"><table><thead><tr><th>Familia</th><th>Ingreso</th><th>Etapa</th><th>Canal</th><th>Nivel</th><th>Próximo contacto</th></tr></thead><tbody>{rows.map((lead) => <tr key={lead.id}><td><Link to={`/admisiones/${lead.id}`}>{lead.name ?? "Familia sin nombre"}</Link></td><td>{date(lead.createdAt)}</td><td>{stageLabel(lead.stage)}</td><td>{channelLabel(lead.channel)}</td><td>{levelLabel(lead.level)}</td><td>{lead.followup ? date(lead.followup) : "—"}</td></tr>)}</tbody></table></div>{!rows.length && <p className="muted">No hay familias con los filtros elegidos.</p>}</section>
      <p className="admissions-report-note">Conversión = inscripciones confirmadas / familias del periodo. Las etapas reflejan el estado actual de cada familia; al filtrar por periodo se usa la fecha de primer contacto.</p>
    </>}
  </div>;
}
