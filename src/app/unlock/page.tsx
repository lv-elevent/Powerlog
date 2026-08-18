"use client";

import { Delete, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UnlockPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const press = (key: string) => {
    if (key === "delete") { setPin(value => value.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setBusy(true);
      void fetch("/api/auth/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: next }) }).then(async response => {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
        if (response.ok) { router.replace("/today"); return; }
        setError(true);
        setMessage(payload.code === "SETUP_REQUIRED" ? "请先完成应用初始化" : payload.error ?? "PIN 不正确");
        setTimeout(() => setPin(""), 450);
      }).catch(() => { setError(true); setMessage("网络异常，请稍后重试"); setTimeout(() => setPin(""), 450); }).finally(() => setBusy(false));
    }
  };

  return <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#dbeafe,transparent_35%),radial-gradient(circle_at_85%_80%,#eff6ff,transparent_34%),#f8fafc] px-6">
    <div className="w-full max-w-[390px] min-w-0 overflow-hidden text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_16px_32px_rgba(37,99,235,.25)]"><Sparkles size={46} strokeWidth={1.5} /></div>
      <h1 className="text-3xl font-bold tracking-tight">个人每日系统</h1>
      <p className="mt-3 text-lg text-slate-500">输入私人 PIN</p>
      <div className="my-8 flex justify-center gap-5">{[0, 1, 2, 3].map(index => <span key={index} className={`h-4 w-4 rounded-full border-[3px] ${pin.length > index ? "border-blue-600 bg-blue-600" : "border-blue-300 bg-transparent"} ${error ? "border-red-400" : ""}`} />)}</div>
      {error && <p className="mb-4 text-sm font-medium text-red-500">{message}</p>}
      <div className="mx-auto grid max-w-[300px] grid-cols-3 gap-4">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "scan", "0", "delete"].map(key => <button disabled={busy} key={key} onClick={() => press(key)} className="flex h-[72px] min-w-0 items-center justify-center rounded-full bg-white text-3xl font-medium text-ink shadow-soft transition hover:bg-blue-50 active:scale-95">{key === "delete" ? <Delete size={25} className="text-blue-600" /> : key === "scan" ? <span className="text-base text-blue-600">面容</span> : key}</button>)}</div>
      <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full bg-blue-50 px-5 py-3 text-sm text-slate-500"><ShieldCheck size={18} className="text-blue-600" />此设备已保持解锁 <span className="font-semibold text-blue-600">30 天</span></div>
      <div className="mt-12 flex justify-between text-sm font-medium text-slate-500"><button>切换设备</button><button>忘记 PIN？</button></div>
      <Link href="/setup" className="mt-8 inline-block text-xs text-slate-400 underline-offset-4 hover:underline">首次使用？进入初始化</Link>
    </div>
  </main>;
}
