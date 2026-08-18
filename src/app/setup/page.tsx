"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SetupPage() {
  const router = useRouter();
  const [setupSecret, setSetupSecret] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (pin !== confirmPin) { setError("两次输入的 PIN 不一致"); return; }
    setSaving(true);
    try {
      const response = await fetch("/api/auth/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ setupSecret, pin }) });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) { setError(payload.error ?? "初始化失败"); return; }
      router.replace("/today");
    } catch { setError("网络异常，请稍后重试"); }
    finally { setSaving(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6"><form onSubmit={submit} className="w-full max-w-[390px] rounded-[28px] bg-white p-6 shadow-soft"><div className="eyebrow">首次设置</div><h1 className="mt-2 text-3xl font-bold tracking-tight">初始化个人每日系统</h1><p className="mt-3 text-sm leading-6 text-slate-500">使用服务器环境变量中的初始化密钥设置首个私人 PIN。PIN 只会以加密摘要形式保存。</p><label className="mt-6 block text-sm font-semibold">初始化密钥<input className="field mt-2" type="password" value={setupSecret} onChange={event => setSetupSecret(event.target.value)} required /></label><label className="mt-4 block text-sm font-semibold">新 PIN<input className="field mt-2" inputMode="numeric" pattern="[0-9]{4,12}" maxLength={12} type="password" value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, ""))} required /></label><label className="mt-4 block text-sm font-semibold">确认 PIN<input className="field mt-2" inputMode="numeric" pattern="[0-9]{4,12}" maxLength={12} type="password" value={confirmPin} onChange={event => setConfirmPin(event.target.value.replace(/\D/g, ""))} required /></label>{error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}<button className="primary-button mt-6 w-full" disabled={saving}>{saving ? "初始化中…" : "完成初始化"}</button></form></main>;
}
