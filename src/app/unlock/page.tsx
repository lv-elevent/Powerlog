"use client";

import { Delete, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// TODO(BACKEND): Replace mock PIN verification with secure server-side session.
export default function UnlockPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const press = (key: string) => {
    if (key === "delete") { setPin(value => value.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === "1234") router.push("/today");
      else { setError(true); setTimeout(() => setPin(""), 450); }
    }
  };

  return <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#dbeafe,transparent_35%),radial-gradient(circle_at_85%_80%,#eff6ff,transparent_34%),#f8fafc] px-6">
    <div className="w-full max-w-[390px] min-w-0 overflow-hidden text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_16px_32px_rgba(37,99,235,.25)]"><Sparkles size={46} strokeWidth={1.5} /></div>
      <h1 className="text-3xl font-bold tracking-tight">Personal Daily OS</h1>
      <p className="mt-3 text-lg text-slate-500">输入私人 PIN</p>
      <div className="my-8 flex justify-center gap-5">{[0, 1, 2, 3].map(index => <span key={index} className={`h-4 w-4 rounded-full border-[3px] ${pin.length > index ? "border-blue-600 bg-blue-600" : "border-blue-300 bg-transparent"} ${error ? "border-red-400" : ""}`} />)}</div>
      {error && <p className="mb-4 text-sm font-medium text-red-500">PIN 不正确，请再试一次</p>}
      <div className="mx-auto grid max-w-[300px] grid-cols-3 gap-4">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "scan", "0", "delete"].map(key => <button key={key} onClick={() => press(key)} className="flex h-[72px] min-w-0 items-center justify-center rounded-full bg-white text-3xl font-medium text-ink shadow-soft transition hover:bg-blue-50 active:scale-95">{key === "delete" ? <Delete size={25} className="text-blue-600" /> : key === "scan" ? <span className="text-base text-blue-600">面容</span> : key}</button>)}</div>
      <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full bg-blue-50 px-5 py-3 text-sm text-slate-500"><ShieldCheck size={18} className="text-blue-600" />此设备已保持解锁 <span className="font-semibold text-blue-600">30 天</span></div>
      <div className="mt-12 flex justify-between text-sm font-medium text-slate-500"><button>切换设备</button><button>忘记 PIN？</button></div>
      <p className="mt-8 text-xs text-slate-400">开发演示 PIN：1234</p>
    </div>
  </main>;
}
