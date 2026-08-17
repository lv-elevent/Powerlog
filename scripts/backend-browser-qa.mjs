const port = 9223;
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const version = await fetch(`http://127.0.0.1:${port}/json/version`).then(response => response.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
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
async function navigate(path) { await send("Page.navigate", { url: baseUrl + path }, sessionId); await wait(500); }
async function click(text) { await evaluate(`[...document.querySelectorAll('button')].find(button => button.innerText.trim() === ${JSON.stringify(text)})?.click()`); }

await navigate("/unlock");
const result = {
  unlockLoaded: await evaluate("location.pathname === '/unlock'"),
  mockPinRemoved: await evaluate("!document.body.innerText.includes('1234')"),
};
for (const key of ["1", "2", "3", "4"]) await click(key);
await wait(500);
result.unlockWithoutBackendShowsError = await evaluate("document.body.innerText.includes('Missing required server environment variable') || document.body.innerText.includes('网络异常')");
await navigate("/today");
result.privatePageRedirects = await evaluate("location.pathname === '/unlock'");
result.privateApiWithoutSession = await evaluate("fetch('/api/water', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({date:'2026-08-17', amountMl:300}) }).then(response => response.status)");
console.log(JSON.stringify(result, null, 2));
await send("Target.closeTarget", { targetId: target.targetId });
socket.close();
