#!/usr/bin/env node
// Alta o actualización del número de WhatsApp (Cloud API) del CUM.
// El webhook resuelve la institución por phone_number_id: sin esta fila, los mensajes reales se ignoran.
//
//   pnpm --filter @lynna/api wa:account --tenant cum --phone-number-id 123456789 --waba-id 987654321 --display-phone "+52 999 000 0000" --target cum
//
// --target local (por omisión) | cum      --persist-to <dir>  (solo local)
//
// Si el phone_number_id ya existe, actualiza institución, WABA y número visible.

import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const TARGETS = ["local", "cum"];

const { values: a } = parseArgs({
  options: {
    tenant: { type: "string" },
    "phone-number-id": { type: "string" },
    "waba-id": { type: "string" },
    "display-phone": { type: "string" },
    target: { type: "string", default: "local" },
    "persist-to": { type: "string" },
  },
});

function fail(msg) {
  console.error(`✘ ${msg}`);
  process.exit(1);
}

const phoneNumberId = a["phone-number-id"]?.trim();
const wabaId = a["waba-id"]?.trim() || null;
if (a.tenant !== "cum") fail("--tenant cum es obligatorio en esta variante.");
if (!phoneNumberId || !/^\d+$/.test(phoneNumberId)) fail("--phone-number-id es obligatorio y son solo dígitos (WhatsApp Manager → número → ID).");
if (wabaId && !/^\d+$/.test(wabaId)) fail("--waba-id son solo dígitos.");
if (!TARGETS.includes(a.target)) fail(`--target debe ser uno de: ${TARGETS.join(", ")}.`);

const apiDir = path.resolve(import.meta.dirname, "..");
const remote = a.target !== "local";
const env = { ...process.env };
if (remote && !env.CLOUDFLARE_API_TOKEN && !env.XDG_CONFIG_HOME) env.XDG_CONFIG_HOME = path.join(homedir(), ".wrangler-cuentas/31rooms");

function wrangler(args) {
  const base = ["exec", "wrangler", "d1", "execute", "DB", ...(remote ? ["--remote"] : ["--local"])];
  if (!remote && a["persist-to"]) base.push("--persist-to", a["persist-to"]);
  const res = spawnSync("pnpm", [...base, ...args], { cwd: apiDir, env, encoding: "utf8" });
  if (res.status !== 0) fail(`wrangler falló:\n${res.stderr || res.stdout}`);
  return res.stdout;
}

const q = (s) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const rowsOf = (out) => JSON.parse(out.slice(out.indexOf("[")))[0]?.results ?? [];

const tenants = rowsOf(wrangler(["--json", "--command", `SELECT id FROM tenants WHERE slug = ${q(a.tenant)}`]));
if (tenants.length === 0) fail(`No existe la institución "${a.tenant}" en ${a.target}.`);
const tenantId = tenants[0].id;

const sql = `INSERT INTO wa_accounts (id, tenant_id, phone_number_id, waba_id, display_phone, created_at)
VALUES (${q(crypto.randomUUID())}, ${q(tenantId)}, ${q(phoneNumberId)}, ${q(wabaId)}, ${q(a["display-phone"]?.trim() || null)}, ${Date.now()})
ON CONFLICT(phone_number_id) DO UPDATE SET
  tenant_id = excluded.tenant_id, waba_id = excluded.waba_id, display_phone = excluded.display_phone;`;
wrangler(["--command", sql]);

console.log(`✔ Número listo en ${a.target}: ${a["display-phone"] ?? phoneNumberId} → ${a.tenant} (phone_number_id ${phoneNumberId})`);
