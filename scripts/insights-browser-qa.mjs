const port = 9223;
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const version = await fetch(`http://127.0.0.1:${port}/json/version`).then(response => response.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const runtimeErrors = [];
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") runtimeErrors.push("exception");
  if (message.method === "Runtime.consoleAPICalled" && ["error", "assert"].includes(message.params.type)) runtimeErrors.push(message.params.type);
  if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
});
await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
function send(method, params = {}, sessionId) { return new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, message => message.error ? reject(new Error(message.error.message)) : resolve(message.result)); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); }); }
const target = await send("Target.createTarget", { url: "about:blank" });
const sessionId = (await send("Target.attachToTarget", { targetId: target.targetId, flatten: true })).sessionId;
await send("Runtime.enable", {}, sessionId);
await send("Page.enable", {}, sessionId);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function evaluate(expression) { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId); return result.result?.value; }
async function navigate(path) { await send("Page.navigate", { url: baseUrl + path }, sessionId); await wait(600); }
async function click(text) { await evaluate(`[...document.querySelectorAll('button')].find(button => button.innerText.trim() === ${JSON.stringify(text)})?.click()`); await wait(350); }
async function pageHealth() { return evaluate(`({ path: location.pathname, text: document.body.innerText, hasCharts: document.querySelectorAll('.recharts-wrapper').length > 0 })`); }

await navigate("/insights");
const result = { route: await evaluate("location.pathname"), ranges: {}, categories: {}, runtimeErrors };
if (result.route === "/unlock") {
  result.blocked = "未解锁，无法执行真实数据浏览器 QA";
} else {
  for (const range of ["7天", "30天", "3月", "1年"]) { await click(range); const state = await pageHealth(); result.ranges[range] = { path: state.path, hasErrorText: /NaN|Infinity|0\/0/.test(state.text), hasCharts: state.hasCharts }; }
  for (const category of ["身体", "营养", "训练", "生活", "消费"]) { await click(category); const state = await pageHealth(); result.categories[category] = { path: state.path, hasErrorText: /NaN|Infinity|0\/0/.test(state.text), hasCharts: state.hasCharts }; }
}
result.runtimeErrors = runtimeErrors;
console.log(JSON.stringify(result, null, 2));
await send("Target.closeTarget", { targetId: target.targetId });
socket.close();
