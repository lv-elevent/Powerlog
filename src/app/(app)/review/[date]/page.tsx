"use client";
/* eslint-disable react/jsx-key */

import Link from "next/link";
import { ArrowLeft, BookOpen, Check, Droplets, Flame, Goal, Moon, Sparkles, Star, Wallet, Dumbbell } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { saveDailyReview } from "@/services/backend-service";
import { getHistoryData } from "@/services/history-service";
import type { BackendDayData } from "@/services/backend-service";
import { BackLink, SectionHeader } from "@/components/ui";

export default function ReviewPage() {
  const params = useParams<{ date: string }>();
  const date = params.date ?? "2026-08-17";
  const [data, setData] = useState<BackendDayData | null>(null);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { void getHistoryData(date).then(value => { setData(value); if (value.review) setAnswers([value.review.best_thing ?? "", value.review.improvement ?? "", value.review.tomorrow_priority ?? ""]); }).catch(reason => setError(reason instanceof Error ? reason.message : "复盘加载失败")); }, [date]);
  const prompts = [{ icon: <Star />, title: "今天做得最好的一件事是什么？", placeholder: "记录让你感到自豪和开心的时刻...", color: "green" }, { icon: <Flame />, title: "今天哪里可以改进？", placeholder: "诚实面对不足，才能持续进步...", color: "orange" }, { icon: <Goal />, title: "明天最重要的一件事是什么？", placeholder: "聚焦一件最重要的事，让明天更有意义...", color: "blue" }];
  const complete = async () => { try { await saveDailyReview(date, { bestThing: answers[0], improvement: answers[1], tomorrowPriority: answers[2] }); setDone(true); } catch (reason) { setError(reason instanceof Error ? reason.message : "复盘保存失败"); } };
  if (done) return <main className="flex min-h-[75vh] flex-col items-center justify-center text-center"><div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-blue-50 text-blue-600"><Sparkles size={46} /></div><h1 className="mt-6 text-3xl font-bold">今天完成得很好</h1><p className="mt-3 text-slate-500">真实复盘已保存，今日已关闭。</p><Link href="/today" className="primary-button mt-8 px-10">回到首页</Link></main>;
  const nutrition = data?.nutrition.totals;
  const sleepHours = data?.sleep?.duration_minutes ? (Number(data.sleep.duration_minutes) / 60).toFixed(1) : "—";
  const workHours = ((data?.work ?? []).reduce((sum, item) => sum + Number(item.duration_minutes ?? 0), 0) / 60).toFixed(1);
  const workoutMinutes = data?.workouts.reduce((sum, item) => sum + Number(item.session.duration_minutes ?? 0), 0) ?? 0;
  return <><div className="relative flex items-center justify-between pt-4 md:pt-8"><div className="flex items-center gap-2"><BackLink href={`/history/${date}`} /><div><div className="eyebrow">Daily review</div><h1 className="text-2xl font-bold">完成今天</h1></div></div><Link href="/today" className="ghost-button"><ArrowLeft size={18} />回到今天</Link></div><p className="mt-2 text-slate-500">回顾与反思，让每一天都成为更好的自己。</p>{error && <div className="mt-3 rounded-2xl bg-orange-50 p-3 text-sm text-orange-700">{error}</div>}<div className="app-card mt-6 p-5"><SectionHeader title="今日总结" action={<span className="text-sm text-slate-500">{date}</span>} /><div className="grid grid-cols-4 divide-x divide-slate-100">{[[<Flame />, "热量", nutrition ? String(Math.round(Number(nutrition.calories_kcal))) : "—", "kcal", "orange"], [<span>◒</span>, "蛋白质", nutrition ? String(Math.round(Number(nutrition.protein_g))) : "—", "g", "purple"], [<Droplets />, "饮水", data ? String(data.water.totalMl) : "—", "ml", "blue"], [<Dumbbell />, "训练", String(workoutMinutes), "分钟", "green"], [<BookOpen />, "工作", workHours, "小时", "blue"], [<Wallet />, "支出", data ? String(Math.round(data.expenses.total)) : "—", "元", "orange"], [<Moon />, "睡眠", sleepHours, "小时", "purple"]].map(([icon, label, value, unit, color]) => <div key={String(label)} className="px-2 text-center"><div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${color === "orange" ? "bg-orange-50 text-orange-500" : color === "purple" ? "bg-violet-50 text-violet-600" : color === "green" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-600"}`}>{icon}</div><div className="mt-2 text-[11px] text-slate-500">{label}</div><div className="mt-1 text-lg font-bold">{value}</div><div className="text-[10px] text-slate-400">{unit}</div></div>)}</div></div><div className="mt-5 space-y-4">{prompts.map((prompt, index) => <div className="app-card p-5" key={prompt.title}><div className="flex items-center gap-3"><div className={`icon-tile h-11 w-11 ${prompt.color === "green" ? "bg-emerald-50 text-emerald-500" : prompt.color === "orange" ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-600"}`}>{prompt.icon}</div><h2 className="font-bold">{prompt.title}</h2></div><textarea className="textarea mt-4" maxLength={2000} placeholder={prompt.placeholder} value={answers[index]} onChange={event => setAnswers(current => current.map((item, i) => i === index ? event.target.value : item))} /><div className="mt-1 text-right text-xs text-slate-400">{answers[index].length}/2000</div></div>)}</div><button onClick={() => void complete()} className="primary-button mt-5 w-full"><Check size={19} />完成今天</button><p className="mt-4 text-center text-sm text-slate-400">保存后会更新今日关闭状态。</p></>;
}
