import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brand, storyProducts } from "./story-products.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postsDir = path.join(__dirname, "instagram_posts");
const htmlDir = path.join(postsDir, "html");
const projectRoot = __dirname;

const css = String.raw`
:root {
  --rose-50: #fff8fa;
  --rose-100: #ffeef3;
  --rose-200: #ffd9e5;
  --rose-300: #ffd1dd;
  --rose-400: #f7b2c6;
  --rose-500: #e88cab;
  --rose-600: #cc7394;
  --rose-700: #9a5d72;
  --ink: #4d2f35;
  --muted: #7c6167;
  --brand-brown: #5b3130;
  --gold: #c89b46;
  --cream: #fffaf8;
}
* { box-sizing: border-box; }
html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; }
body {
  font-family: Georgia, "Times New Roman", serif;
  background: #f8c9d5;
  color: var(--ink);
}
.artboard {
  width: 1080px;
  height: 1920px;
  padding: 40px;
  position: relative;
}
.frame {
  width: 100%;
  height: 100%;
  border-radius: 42px;
  padding: 42px;
  background: #f4b7c9;
  border: 1px solid rgba(255,255,255,0.42);
  box-shadow: 0 24px 70px rgba(122, 79, 95, 0.16);
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 28px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 20px;
}
.brand-logo {
  width: 114px;
  height: 114px;
  border-radius: 999px;
  object-fit: cover;
  background: white;
  border: 4px solid rgba(255,255,255,0.92);
  box-shadow: 0 12px 28px rgba(122, 79, 95, 0.14);
}
.brand-copy { min-width: 0; }
.eyebrow {
  margin: 0;
  font-family: Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 22px;
  color: #8d6974;
}
.brand-name {
  margin: 8px 0 0;
  font-size: 42px;
  line-height: 0.95;
  font-weight: 700;
  color: var(--brand-brown);
}
.price {
  padding: 18px 28px;
  border-radius: 999px;
  background: var(--cream);
  color: var(--brand-brown);
  font-family: Arial, sans-serif;
  font-size: 32px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 10px 24px rgba(133, 88, 102, 0.12);
}
.title-wrap { display: grid; gap: 14px; }
.product-name {
  margin: 0;
  max-width: 13ch;
  font-size: 86px;
  line-height: 0.88;
  font-weight: 700;
  color: var(--brand-brown);
}
.pill {
  justify-self: start;
  padding: 14px 24px;
  border-radius: 999px;
  background: rgba(255, 250, 251, 0.82);
  border: 1px solid rgba(255,255,255,0.5);
  font-family: Arial, sans-serif;
  font-size: 25px;
  font-weight: 700;
  color: #975b6f;
}
.description {
  margin: 0;
  max-width: 27ch;
  color: var(--ink);
  font-family: Arial, sans-serif;
  font-size: 30px;
  line-height: 1.35;
}
.media {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}
.main-photo, .detail-photo {
  margin: 0;
  overflow: hidden;
  border-radius: 36px;
  border: 1px solid rgba(255,255,255,0.48);
  box-shadow: 0 16px 30px rgba(122, 79, 95, 0.14);
  background: rgba(255,255,255,0.26);
}
.main-photo { aspect-ratio: 1 / 1.06; }
.detail-photo { aspect-ratio: 0.9 / 1.06; }
.main-photo img, .detail-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.details-box {
  background: rgba(255, 250, 248, 0.96);
  color: var(--ink);
  border-radius: 36px;
  padding: 34px 34px 32px;
  border: 1px solid rgba(255,255,255,0.56);
  box-shadow: 0 14px 26px rgba(122, 79, 95, 0.1);
}
.details-title {
  margin: 0;
  color: #a15f74;
  font-family: Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 22px;
}
.details-list {
  list-style: none;
  padding: 0;
  margin: 24px 0 0;
  display: grid;
  gap: 20px;
}
.details-list li {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  font-family: Arial, sans-serif;
  font-size: 31px;
  line-height: 1.25;
  color: var(--ink);
}
.details-list li::before {
  content: "";
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  margin-top: 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--gold), var(--rose-400));
  box-shadow: 0 0 0 8px rgba(226, 89, 128, 0.08);
}
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.footer-note {
  margin: 0;
  font-family: Arial, sans-serif;
  font-size: 24px;
  color: #84626c;
}
.footer-phone {
  font-weight: 800;
  color: var(--brand-brown);
}
`;

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function toDataUrl(relativePath) {
  const normalized = relativePath
    .replaceAll("/", path.sep)
    .replace(new RegExp(`^\\.\\.\\${path.sep}`), "");
  const absolute = path.resolve(projectRoot, normalized);
  const file = await fs.readFile(absolute);
  return `data:${mimeFor(absolute)};base64,${file.toString("base64")}`;
}

function renderProductPage(product, assets) {
  const composition = product.composition
    .map((item) => `<li>${item}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, initial-scale=1.0" />
    <title>${product.name}</title>
    <style>${css}</style>
  </head>
  <body>
    <main class="artboard">
      <section class="frame">
        <header class="header">
          <div class="brand">
            <img class="brand-logo" src="${assets.logo}" alt="Logo ${brand.name}" />
            <div class="brand-copy">
              <p class="eyebrow">Dia das Mães</p>
              <p class="brand-name">${brand.name}</p>
            </div>
          </div>
          <div class="price">${product.price}</div>
        </header>

        <div class="title-wrap">
          <h1 class="product-name">${product.name}</h1>
          <div class="pill">${product.label}</div>
          <p class="description">${product.description}</p>
        </div>

        <section class="media">
          <figure class="main-photo">
            <img src="${assets.photoA}" alt="${product.name}" />
          </figure>
          <figure class="detail-photo">
            <img src="${assets.photoB}" alt="Detalhe de ${product.name}" />
          </figure>
        </section>

        <section class="details-box">
          <h2 class="details-title">O que vai no kit</h2>
          <ul class="details-list">${composition}</ul>
        </section>

        <footer class="footer">
          <p class="footer-note">Feito com carinho para presentear no Dia das Mães.</p>
          <p class="footer-note footer-phone">${brand.phone}</p>
        </footer>
      </section>
    </main>
  </body>
</html>`;
}

await fs.mkdir(htmlDir, { recursive: true });

for (const product of storyProducts) {
  const assets = {
    logo: await toDataUrl(brand.logo),
    photoA: await toDataUrl(product.photos[0]),
    photoB: await toDataUrl(product.photos[1]),
  };
  const html = renderProductPage(product, assets);
  const target = path.join(htmlDir, `${product.slug}.html`);
  await fs.writeFile(target, html, "utf8");
}

const manifest = {
  generatedAt: new Date().toISOString(),
  count: storyProducts.length,
  products: storyProducts.map((product) => ({
    slug: product.slug,
    name: product.name,
    html: `html/${product.slug}.html`,
    png: `png/${product.slug}.png`,
  })),
};

await fs.writeFile(
  path.join(postsDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log(`Generated ${storyProducts.length} HTML story files in ${htmlDir}`);
