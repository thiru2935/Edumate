import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "attached_assets");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: outDir,
    size: { width: 1280, height: 720 },
  },
});

const page = await context.newPage();

await page.goto("http://localhost:8081", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

await page.goto("http://localhost:8081/signup", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

await page.locator("#name").fill("Demo Learner");
await page.locator("#email").fill("demo.learner@example.com");
await page.locator("#password").fill("password123");
await page.locator("#age").fill("21");
await page.getByRole("combobox").click();
await page.getByRole("option", { name: "Student" }).click();
await page.waitForTimeout(1500);

await page.goto("http://localhost:8081/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.locator("#email").fill("alex@edumate.app");
await page.locator("#password").fill("password123");
await page.waitForTimeout(1500);

await page.mouse.wheel(0, 500);
await page.waitForTimeout(1200);
await page.mouse.wheel(0, -500);
await page.waitForTimeout(1200);

await context.close();
const videoPath = await page.video().path();
await browser.close();

const targetVideo = path.join(outDir, "edumate-demo.webm");
await fs.copyFile(videoPath, targetVideo);

console.log(`Saved raw video to: ${targetVideo}`);
