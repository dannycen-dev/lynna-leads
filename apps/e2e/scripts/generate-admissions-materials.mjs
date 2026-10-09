import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// Material conceptual para la demo. Sustituir por piezas aprobadas por el CUM antes de enviarlo a familias.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../web/public");
const output = path.join(root, "materiales");
await mkdir(output, { recursive: true });
const [art, logo] = await Promise.all([
  readFile(path.join(root, "admissions-hero.webp")),
  readFile(path.join(root, "cum-logo.png")),
]);

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
* { box-sizing: border-box; }
html, body { margin: 0; width: 1080px; height: 1350px; font-family: Arial, Helvetica, sans-serif; }
body { background: #f6f3ea; color: #102f4c; }
.cover { position: relative; height: 660px; background: #102f4c url(data:image/webp;base64,${art.toString("base64")}) center / cover no-repeat; color: #fff; overflow: hidden; }
.cover:after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(9,37,60,.78), transparent 75%); }
.logo { position: absolute; z-index: 1; top: 65px; left: 76px; width: 88px; height: 92px; object-fit: contain; border-radius: 12px; background: #fff; padding: 7px; }
.eyebrow { position: absolute; z-index: 1; top: 190px; left: 76px; color: #e8c774; font-size: 24px; font-weight: bold; letter-spacing: 3px; }
h1 { position: absolute; z-index: 1; left: 72px; top: 238px; margin: 0; width: 640px; font-size: 73px; line-height: 1.06; letter-spacing: -2px; }
.cover p { position: absolute; z-index: 1; left: 76px; bottom: 65px; margin: 0; font-size: 29px; color: #eef3f4; }
.concept { position: absolute; z-index: 1; right: 30px; bottom: 20px; color: #fff; font-size: 16px; text-shadow: 0 1px 3px #102f4c; }
.body { padding: 74px 78px 48px; }
.body h2 { margin: 0 0 34px; font-size: 42px; line-height: 1.18; }
.steps { display: grid; gap: 24px; }
.step { display: flex; align-items: flex-start; gap: 25px; padding: 25px 28px; border-radius: 19px; background: #fff; box-shadow: 0 8px 28px rgba(16,47,76,.07); }
.number { display: grid; place-items: center; flex: none; width: 53px; height: 53px; border-radius: 14px; background: #e8c774; color: #102f4c; font-size: 23px; font-weight: bold; }
.step strong { display: block; margin-bottom: 6px; font-size: 27px; }
.step span { display: block; color: #536a79; font-size: 21px; line-height: 1.35; }
.footer { display: flex; justify-content: space-between; gap: 30px; margin-top: 36px; border-top: 2px solid #d9e3e7; padding-top: 20px; color: #647887; font-size: 17px; }
.footer strong { color: #173b59; }
</style></head><body>
<section class="cover"><img class="logo" src="data:image/png;base64,${logo.toString("base64")}" alt=""><div class="eyebrow">LYNNA LEADS · CUM</div><h1>Conversemos sobre su siguiente etapa</h1><p>Secundaria y preparatoria · Mérida, Yucatán</p><span class="concept">Ilustración conceptual</span></section>
<main class="body"><h2>Un camino sencillo para conocer la escuela</h2><div class="steps">
<div class="step"><div class="number">1</div><div><strong>Cuéntanos qué buscan</strong><span>Nivel y grado de interés de la familia.</span></div></div>
<div class="step"><div class="number">2</div><div><strong>Resuelve tus dudas</strong><span>Recibe información revisada por el equipo de admisiones.</span></div></div>
<div class="step"><div class="number">3</div><div><strong>Sigamos en contacto</strong><span>El equipo confirma visitas, fechas y costos vigentes.</span></div></div>
</div><div class="footer"><strong>Atención de admisiones · CUM</strong><span>Material de demostración. Información sujeta a validación del CUM.</span></div></main>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: path.join(output, "guia-admisiones-demo.png"), animations: "disabled" });
  await page.pdf({ path: path.join(output, "guia-admisiones-demo.pdf"), width: "1080px", height: "1350px", printBackground: true, pageRanges: "1" });
} finally {
  await browser.close();
}
