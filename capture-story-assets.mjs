import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { storyProducts } from "./story-products.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postsDir = path.join(__dirname, "instagram_posts");
const htmlDir = path.join(postsDir, "html");
const pngDir = path.join(postsDir, "png");

await fs.mkdir(pngDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
});

for (const product of storyProducts) {
  const htmlPath = path.join(htmlDir, `${product.slug}.html`);
  const targetPath = path.join(pngDir, `${product.slug}.png`);
  const url = new URL(`file:///${htmlPath.replace(/\\/g, "/")}`);

  await page.goto(url.href, { waitUntil: "load" });
  await page.screenshot({
    path: targetPath,
    fullPage: true,
  });
  console.log(`Captured ${targetPath}`);
}

await browser.close();
