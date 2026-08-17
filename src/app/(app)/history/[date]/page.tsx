"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, CircleCheck, Dumbbell, Droplets, Flame, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { mockToday } from "@/mock/data";
import { getHistoryData, type BackendDayData } from "@/services/history-service";
import { BackLink, Badge, SectionHeader, Timeline } from "@/components/ui";
import type { TimelineItem } from "@/types";

export default function HistoryDetailPage() {
  const params = useParams<{ date: string }>();
  const date = params.date ?? "2026-08-17";
  const [data, setData] = useState<BackendDayData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void getHistoryData(date).then(setData).catch(reason => setError(reason instanceof Error ? reason.message : "历史数据暂时不可用")); }, [date]);

  const realTimeline = useMemo<TimelineItem[]>(() => {
    if (!data) return [];
    const items: TimelineItem[] = [];
    if (data.body) items.push({ id: data.body.id, time: data.body.measured_at ? new Date(data.body.measured_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "—", title: "晨重", detail: `${Number(data.body.weight_kg ?? 0).toFixed(1)} kg`, kind: "body", value: "已记录" });
    if (data.water.logs.length) items.push({ id: "water-total", time: "全天", title: "饮水", detail: `${data.water.logs.length} 次记录`, kind: "water", value: `${data.water.totalMl} ml` });
    data.expenses.logs.forEach(item => items.push({ id: item.id, time: new Date(item.spent_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }), title: "支出", detail: `${item.category_name ?? "其他"}${item.note ? ` · ${item.note}` : ""}`, kind: "expense", value: `¥${Number(item.amount).toFixed(2)}` }));
    data.notes.forEach(item => items.push({ id: item.id, time: new Date(item.noted_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }), title: "随手记", detail: item.text, kind: "note" }));
    return items;
  }, [data]);
  const completion = data?.daily?.completion_score ?? 92;
  const timeline = [...realTimeline, ...mockToday.timeline];
  return <><div className="flex items-center justify-between pt-4 md:pt-8"><div className="flex items-center gap-1"><BackLink href="/history" /><div><div className="eyebrow">Read mode</div><h1 className="text-2xl font-bold">8 月 {date.slice(-2)} 日 · 周一</h1></div></div><Link href="/history" className="secondary-button px-3"><CalendarDays size={18} />日历</Link></div><div className="mt-2 flex items-center gap-2 pl-10 text-sm text-slate-500"><Badge tone="green">{completion}% 完整</Badge><span>{error ? "真实数据暂时不可用" : "真实记录与未接入模块并列展示"}</span></div><div className="app-card mt-5 grid grid-cols-5 divide-x divide-slate-100 p-4 text-center"><DayStat icon={<Flame />} label="热量" value="2054" tone="orange" /><DayStat icon={<span>◒</span>} label="蛋白质" value="123g" tone="purple" /><DayStat icon={<Droplets />} label="饮水" value={data ? `${data.water.totalMl}` : "—"} tone="blue" /><DayStat icon={<Dumbbell />} label="训练" value="56min" tone="purple" /><DayStat icon={<Wallet />} label="支出" value={data ? `¥${data.expenses.total.toFixed(2)}` : "—"} tone="orange" /></div><div className="mt-6"><SectionHeader title="完整时间线" action={<button className="text-sm font-semibold text-blue-600">编辑</button>} /><div className="app-card p-5"><Timeline items={timeline} /></div></div><Link href={`/review/${date}`} className="primary-button mt-5 w-full"><CircleCheck size={18} />查看每日复盘 <ChevronRight size={18} /></Link></>;
}
function DayStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "orange" | "purple" | "blue" }) { const colors = { orange: "text-orange-500 bg-orange-50", purple: "text-violet-600 bg-violet-50", blue: "text-blue-600 bg-blue-50" }; return <div><div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</div><div className="mt-2 text-[11px] text-slate-500">{label}</div><div className="mt-1 text-xs font-bold">{value}</div></div>; }
