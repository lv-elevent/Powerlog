import fs from "node:fs/promises";

const port = 9223;
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outputDir = "D:/MyThing/Powerlog/docs/screenshots/final";
const pages = [
  ["01-unlock", "/unlock"], ["02-today", "/today"], ["03-plan", "/plan"],
  ["04-nutrition", "/nutrition"], ["05-nutrition-add", "/nutrition/add"],
  ["06-insights", "/insights"], ["07-history", "/history"],
  ["08-history-detail", "/history/2026-08-17"], ["09-review", "/review/2026-08-17"],
  ["10-workout", "/workout/push"], ["11-rest-timer", "/workout/push/rest"],
  ["12-workout-complete", "/workout/push/complete"], ["13-me", "/me"],
];

const version = await fetch(`http://localhost:${port}/json/version`).then(response => response.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const runtimeErrors = [];
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.consoleAPICalled" && ["error", "assert"].includes(message.params.type)) runtimeErrors.push(message.params.type);
  if (message.method === "Runtime.exceptionThrown") runtimeErrors.push("exception");
  if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
});
await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));

function send(method, params = {}, sessionId) { return new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, message => message.error ? reject(new Error(message.error.message)) : resolve(message.result)); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); }); }
const target = await send("Target.createTarget", { url: "about:blank" });
const sessionId = (await send("Target.attachToTarget", { targetId: target.targetId, flatten: true })).sessionId;
await send("Runtime.enable", {}, sessionId);
await send("Page.enable", {}, sessionId);
await fs.mkdir(outputDir, { recursive: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function evaluate(expression) { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId); return result.result?.value; }
async function navigate(path) { await send("Page.navigate", { url: baseUrl + path }, sessionId); await wait(750); }
async function clickText(text) { await evaluate(`[...document.querySelectorAll('button')].find(button => button.innerText.trim() === ${JSON.stringify(text)})?.click()`); }
async function clickContains(text) { await evaluate(`[...document.querySelectorAll('button,a')].find(element => element.innerText.includes(${JSON.stringify(text)}))?.click()`); }
async function capture(name) { const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true }, sessionId); await fs.writeFile(`${outputDir}/${name}.png`, Buffer.from(result.data, "base64")); }

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }, sessionId);
for (const [name, path] of pages) { await navigate(path); await capture(name); }
for (const [width, height] of [[430, 932], [768, 1024], [1440, 900]]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 }, sessionId);
  for (const [name, path] of [["today", "/today"], ["insights", "/insights"]]) { await navigate(path); await capture(`responsive-${width}-${name}`); }
}
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }, sessionId);

const interaction = {};
await navigate("/unlock");
for (const key of ["1", "2", "3", "4"]) await clickText(key);
await wait(250);
interaction.pinRoute = await evaluate("location.pathname");

await navigate("/today");
interaction.routeHasNo404 = !(await evaluate("document.body.innerText.includes('404')"));
interaction.quickAddVisible = await evaluate("Boolean(document.querySelector('button[aria-label=\"快速记录\"]'))");
await evaluate("document.querySelector('button[aria-label=\"快速记录\"]')?.click()");
await wait(200);
interaction.quickAddOpen = await evaluate("document.body.innerText.includes('快速记录')");
await clickText("饮水"); await wait(150); interaction.waterSheetOpen = await evaluate("document.body.innerText.includes('记录饮水')");
interaction.waterBefore = await evaluate("document.body.innerText.match(/\\d+ \/ 2500/g)?.join(',') ?? ''");
await clickText("+300 ml"); await wait(500); interaction.waterRecorded = await evaluate("!document.body.innerText.includes('记录饮水')");
await navigate("/today"); await evaluate("document.querySelector('button[aria-label=\"快速记录\"]')?.click()"); await wait(150); await clickText("支出"); await wait(150); interaction.expenseSheetOpen = await evaluate("document.body.innerText.includes('记录支出')"); await clickText("保存 ¥28"); await wait(200); interaction.expenseSaved = await evaluate("!document.body.innerText.includes('记录支出')");
await evaluate("document.querySelector('button[aria-label=\"快速记录\"]')?.click()"); await wait(150); await clickText("体重"); await wait(150); interaction.bodySheetOpen = await evaluate("document.body.innerText.includes('记录晨重')"); await clickText("保存晨重"); await wait(200); interaction.bodySaved = await evaluate("!document.body.innerText.includes('记录晨重')");
await navigate("/today"); await evaluate("document.querySelector('button[aria-label=\"快速记录\"]')?.click()"); await wait(150); await clickText("饮食"); await wait(600); interaction.quickMealRoute = await evaluate("location.pathname");

await navigate("/nutrition");
await evaluate("(() => { const input = document.querySelector('input[placeholder*=\"搜索食物\"]'); if (!input) return; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set; setter?.call(input, '鸡蛋'); input.dispatchEvent(new Event('input', { bubbles: true })); })()");
await wait(200); interaction.foodSearch = await evaluate("document.body.innerText.includes('鸡蛋（煮）')");
await navigate("/nutrition/add"); await clickContains("鸡蛋（煮）"); await wait(150); interaction.foodSelected = await evaluate("document.body.innerText.includes('加入早餐（1 项）')"); await clickContains("加入早餐（1 项）"); await wait(400); interaction.mealAddRoute = await evaluate("location.pathname");

await navigate("/workout/push"); await clickText("完成这一组"); await wait(250); interaction.restTimerVisible = await evaluate("document.body.innerText.includes('休息倒计时')"); await clickText("−30秒"); await clickText("+30秒"); await clickText("跳过"); await wait(150); interaction.restSkip = await evaluate("!document.body.innerText.includes('休息倒计时')");
await navigate("/workout/push/complete"); await clickText("5"); await clickContains("完成训练"); await wait(300); interaction.workoutCompleteRoute = await evaluate("location.pathname");

await navigate("/history"); await clickText("18"); await clickContains("查看当天详情"); await wait(300); interaction.historyRoute = await evaluate("location.pathname");
await navigate("/insights"); await clickText("7天"); await clickText("营养"); await wait(200); interaction.insightsNutrition = await evaluate("document.body.innerText.includes('营养平均值')");
await navigate("/me"); await evaluate("document.querySelector('a[href=\"/me/profile\"]')?.click()"); await wait(250); interaction.meDetailRoute = await evaluate("location.pathname");
await navigate("/review/2026-08-17"); await evaluate("(() => { const input = document.querySelector('textarea'); if (!input) return; const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set; setter?.call(input, '今天完成了核心任务'); input.dispatchEvent(new Event('input', { bubbles: true })); })()"); await clickText("完成今天"); await wait(250); interaction.reviewCompleted = await evaluate("document.body.innerText.includes('今天完成得很好')");

await navigate("/today");
const qaResult = { viewport: await evaluate("({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth })"), interaction, runtimeErrors };
await fs.writeFile(`${outputDir}/qa-results.json`, JSON.stringify(qaResult, null, 2));
console.log(JSON.stringify(qaResult, null, 2));
await send("Target.closeTarget", { targetId: target.targetId });
socket.close();
