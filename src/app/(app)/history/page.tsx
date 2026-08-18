"use client";

import Link from "next/link";
import { BarChart3, ChevronLeft, ChevronRight, CircleCheck, Dumbbell, Flame, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { historyDays } from "@/mock/data";
import { Badge, PageIntro } from "@/components/ui";
import { currentRecordDate, formatRecordDateLabel } from "@/services/backend-service";

export default function HistoryPage() {
  const today = currentRecordDate();
  const [selected, setSelected] = useState(today);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.slice(0, 7) + "-01T12:00:00+08:00"));
  const viewYear = viewMonth.getUTCFullYear();
  const viewMonthIndex = viewMonth.getUTCMonth();
  const monthKey = viewYear + "-" + String(viewMonthIndex + 1).padStart(2, "0");
  const monthStart = useMemo(() => new Date(Date.UTC(viewYear, viewMonthIndex, 1, 12)), [viewMonthIndex, viewYear]);
  const leadingDays = (monthStart.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonthIndex + 1, 0)).getUTCDate();
  const days = [...Array.from({ length: leadingDays }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const monthLabel = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "long" }).format(monthStart);
  const selectedInfo = historyDays.find(day => day.date === selected);

  const moveMonth = (offset: number) => {
    setViewMonth(current => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + offset, 1, 12)));
  };

  const showToday = () => {
    setSelected(today);
    setViewMonth(new Date(today.slice(0, 7) + "-01T12:00:00+08:00"));
  };

  return <>
    <PageIntro eyebrow="你的时间线" title="历史" subtitle="回顾每一天，见证你的成长轨迹。" action={<button onClick={showToday} className="secondary-button px-3">今天</button>} />
    <div className="app-card mb-4 grid grid-cols-3 divide-x divide-slate-100 p-4 text-center"><HistoryStat icon={<Dumbbell />} title="训练天数" value="18" unit="天" tone="purple" /><HistoryStat icon={<CircleCheck />} title="复盘天数" value="24" unit="天" tone="green" /><HistoryStat icon={<Flame />} title="平均热量" value="2067" unit="kcal" tone="orange" /></div>
    <div className="app-card p-5">
      <div className="flex items-center justify-between"><button onClick={() => moveMonth(-1)} className="ghost-button p-2" aria-label="上个月"><ChevronLeft /></button><h2 className="text-xl font-bold">{monthLabel}</h2><button onClick={() => moveMonth(1)} className="ghost-button p-2" aria-label="下个月"><ChevronRight /></button></div>
      <div className="mt-5 grid grid-cols-7 text-center text-sm font-medium text-slate-400">{["一", "二", "三", "四", "五", "六", "日"].map(day => <div key={day} className="py-2">{day}</div>)}{days.map((day, index) => { const date = day ? monthKey + "-" + String(day).padStart(2, "0") : "outside-" + index; const info = historyDays.find(item => item.date === date); const isSelected = date === selected; return <button key={date} disabled={!day} onClick={() => day && setSelected(date)} className={"relative flex h-14 flex-col items-center justify-center rounded-2xl text-sm " + (isSelected ? "bg-blue-600 font-bold text-white shadow-md" : day ? "text-ink hover:bg-blue-50" : "text-slate-200")}>{day}<span className="mt-1 flex h-2 gap-1">{info?.workout && <i className={"h-1.5 w-1.5 rounded-full " + (isSelected ? "bg-white" : "bg-violet-400")} />}{info?.review && <i className={"h-1.5 w-1.5 rounded-full " + (isSelected ? "bg-white" : "bg-emerald-400")} />}{info?.meal && <i className={"h-1.5 w-1.5 rounded-full " + (isSelected ? "bg-white" : "bg-orange-400")} />}</span></button>; })}</div>
      <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500"><Legend color="bg-violet-400" text="训练" /><Legend color="bg-emerald-400" text="复盘" /><Legend color="bg-orange-400" text="饮食记录" /><span className="ml-auto text-blue-600"><Info className="inline" size={14} /> 数据说明</span></div>
    </div>
    <div className="app-card mt-4 p-5"><div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><span className="text-lg font-bold">{formatRecordDateLabel(selected)}</span><Badge tone="green">{selectedInfo ? "表现良好" : "暂无汇总"}</Badge></div><div className="mt-1 text-sm text-slate-500">{selectedInfo ? "完成度 " + selectedInfo.completion + "% · 记录清晰的一天" : "这个日期还没有演示数据，可进入详情补记。"}</div></div><BarChart3 className="text-blue-600" /></div><div className="mt-5 grid grid-cols-4 divide-x divide-slate-100 text-center"><Mini title="训练" value={selectedInfo?.workout ? "1 次" : "—"} /><Mini title="复盘" value={selectedInfo?.review ? "已完成" : "—"} /><Mini title="热量摄入" value={selectedInfo ? "2120" : "—"} /><Mini title="饮水" value={selectedInfo ? "2400 ml" : "—"} /></div><Link href={"/history/" + selected} className="primary-button mt-5 w-full">查看当天详情 <ChevronRight size={18} /></Link></div>
  </>;
}

function HistoryStat({ icon, title, value, unit, tone }: { icon: React.ReactNode; title: string; value: string; unit: string; tone: "purple" | "green" | "orange" }) { const colors = { purple: "bg-violet-50 text-violet-600", green: "bg-emerald-50 text-emerald-500", orange: "bg-orange-50 text-orange-500" }; return <div><div className={"mx-auto flex h-10 w-10 items-center justify-center rounded-2xl " + colors[tone]}>{icon}</div><div className="mt-2 text-xs text-slate-500">{title}</div><div className="mt-1 text-xl font-bold">{value} <span className="text-xs font-medium text-slate-400">{unit}</span></div></div>; }
function Legend({ color, text }: { color: string; text: string }) { return <span className="inline-flex items-center gap-2"><i className={"h-2.5 w-2.5 rounded-full " + color} />{text}</span>; }
function Mini({ title, value }: { title: string; value: string }) { return <div className="px-2"><div className="text-xs text-slate-400">{title}</div><div className="mt-2 text-sm font-bold text-blue-600">{value}</div></div>; }
