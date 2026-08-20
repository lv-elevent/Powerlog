"use client";

import Link from "next/link";
import { CalendarDays, Check, ChevronDown, ChevronRight, ChevronUp, Clock3, Dumbbell, GripVertical, PencilLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { currentRecordDate } from "@/services/backend-service";
import { getCachedWorkoutPlans, refreshWorkoutPlans, startWorkout } from "@/services/workout-service";
import { getPlanTodos, savePlanTodos, saveWorkoutPlanOverride } from "@/services/plan-service";
import type { TimelineItem, WorkoutPlanExerciseRecord, WorkoutPlanRecord } from "@/types";
import { Badge, PageIntro, SectionHeader } from "@/components/ui";
import { mockToday } from "@/mock/data";

function dayLabel(name: string): string {
  return name.replace("Push", "推").replace("Pull", "拉").replace("Legs", "腿").replace("Core", "核心").replace("Rest", "休息");
}

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlanRecord | null>(null);
  const [dayId, setDayId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [editingPlan, setEditingPlan] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [todos, setTodos] = useState<TimelineItem[]>(() => mockToday.timeline.map(item => ({ ...item, completed: item.completed ?? false })));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const cached = getCachedWorkoutPlans()[0] ?? null;
    const fallbackTodos = mockToday.timeline.map(item => ({ ...item, completed: item.completed ?? false }));
    if (cached) {
      setPlan(cached);
      setDayId(cached.days.find(day => !day.isRestDay)?.id);
    }
    setTodos(getPlanTodos(fallbackTodos));
    setSyncing(!cached);
    void refreshWorkoutPlans()
      .then(plans => {
        const nextPlan = plans[0] ?? null;
        setPlan(nextPlan);
        setDayId(nextPlan?.days.find(day => !day.isRestDay)?.id);
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : "训练计划暂时不可用"));
  }, []);

  const activeDay = useMemo(() => plan?.days.find(day => day.id === dayId) ?? plan?.days.find(day => !day.isRestDay), [dayId, plan]);

  const start = async (nextDayId = activeDay?.id) => {
    if (!plan || !nextDayId) return;
    setLoading(true);
    setError("");
    try {
      const session = await startWorkout({ recordDate: currentRecordDate(), planId: plan.id, planDayId: nextDayId });
      router.push("/workout/" + session.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "训练启动失败");
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = (id: string, patch: Partial<Pick<TimelineItem, "time" | "title" | "detail" | "completed">>) => {
    setTodos(current => {
      const next = current.map(item => item.id === id ? { ...item, ...patch } : item);
      savePlanTodos(next);
      return next;
    });
  };

  const addTodo = () => {
    const id = "todo-" + Date.now();
    setTodos(current => {
      const next = [...current, { id, time: "09:00", title: "新的待办", detail: "填写今天要完成的事情", kind: "note" as const, completed: false }];
      savePlanTodos(next);
      return next;
    });
    setEditingTodoId(id);
  };

  const deleteTodo = (id: string) => {
    setTodos(current => {
      const next = current.filter(item => item.id !== id);
      savePlanTodos(next);
      return next;
    });
  };

  const updateExercise = (id: string, patch: Partial<WorkoutPlanExerciseRecord>) => {
    setPlan(current => current ? {
      ...current,
      days: current.days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.map(exercise => exercise.id === id ? { ...exercise, ...patch } : exercise) } : day),
    } : current);
  };

  const addExercise = () => {
    const id = `local-${crypto.randomUUID()}`;
    setPlan(current => current && activeDay ? { ...current, days: current.days.map(day => day.id === activeDay.id ? { ...day, exercises: [...day.exercises, { id, exerciseId: id, exercise: { id, name: "自定义动作", category: "strength", primaryMuscle: "自定义", equipment: null, defaultRestSeconds: 90, isActive: true }, sortOrder: day.exercises.length, targetSets: 3, repMin: 8, repMax: 12, targetRir: 2, restSeconds: 90, isOptional: false }] } : day) } : current);
  };

  const updateExerciseName = (id: string, name: string) => {
    setPlan(current => current ? { ...current, days: current.days.map(day => day.id === activeDay?.id ? { ...day, exercises: day.exercises.map(exercise => exercise.id === id ? { ...exercise, exercise: exercise.exercise ? { ...exercise.exercise, name } : exercise.exercise } : exercise) } : day) } : current);
  };

  const removeExercise = (id: string) => {
    setPlan(current => current && activeDay ? { ...current, days: current.days.map(day => day.id === activeDay.id ? { ...day, exercises: day.exercises.filter(exercise => exercise.id !== id).map((exercise, index) => ({ ...exercise, sortOrder: index })) } : day) } : current);
  };

  const moveExercise = (id: string, direction: -1 | 1) => {
    setPlan(current => {
      if (!current || !activeDay) return current;
      return { ...current, days: current.days.map(day => {
        if (day.id !== activeDay.id) return day;
        const index = day.exercises.findIndex(exercise => exercise.id === id);
        const nextIndex = index + direction;
        if (index < 0 || nextIndex < 0 || nextIndex >= day.exercises.length) return day;
        const exercises = [...day.exercises];
        [exercises[index], exercises[nextIndex]] = [exercises[nextIndex], exercises[index]];
        return { ...day, exercises: exercises.map((exercise, sortOrder) => ({ ...exercise, sortOrder })) };
      }) };
    });
  };

  const savePlanEdits = () => {
    if (plan) saveWorkoutPlanOverride(plan);
    setEditingPlan(false);
    setNotice("训练计划已保存，只影响未来训练。");
  };

  return <>
    <PageIntro eyebrow="每周节奏" title="训练计划" subtitle="把今天要做的事放在前面，再安排训练。" action={<Link href="/history" className="secondary-button px-3"><CalendarDays size={18} />历史</Link>} />
    {syncing && <div className="mb-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">正在后台同步最新计划，已缓存内容可直接使用。</div>}
    {error && <div className="mb-4 rounded-2xl bg-orange-50 p-4 text-sm text-orange-700">{error}</div>}
    {notice && <div className="mb-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">{notice}</div>}

    <section>
      <SectionHeader title="待办事项" action={<button onClick={addTodo} className="text-sm font-semibold text-blue-600"><Plus size={15} className="mr-1 inline" />新增</button>} />
      <div className="app-card divide-y divide-slate-100 overflow-hidden">
        {todos.map(todo => <div key={todo.id} className="p-4">
          {editingTodoId === todo.id ? <div className="space-y-3">
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3"><label className="muted pt-3">时间</label><input className="field" type="time" value={todo.time} onChange={event => updateTodo(todo.id, { time: event.target.value })} /></div>
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3"><label className="muted pt-3">事项</label><input className="field" value={todo.title} onChange={event => updateTodo(todo.id, { title: event.target.value })} /></div>
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3"><label className="muted pt-3">说明</label><input className="field" value={todo.detail} onChange={event => updateTodo(todo.id, { detail: event.target.value })} /></div>
            <div className="flex justify-end"><button onClick={() => setEditingTodoId(null)} className="primary-button px-4">完成编辑</button></div>
          </div> : <div className="flex items-center gap-3">
            <button aria-label={todo.completed ? "标记未完成" : "标记完成"} onClick={() => updateTodo(todo.id, { completed: !todo.completed })} className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 " + (todo.completed ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 text-transparent")}><Check size={17} /></button>
            <div className="min-w-0 flex-1"><div className={"text-xs font-semibold " + (todo.completed ? "text-slate-400 line-through" : "text-slate-400")}>{todo.time}</div><div className={"mt-1 font-semibold " + (todo.completed ? "text-slate-400 line-through" : "text-ink")}>{todo.title}</div><div className="mt-1 text-sm text-slate-500">{todo.detail}</div></div>
            <button aria-label={"编辑" + todo.title} onClick={() => setEditingTodoId(todo.id)} className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><PencilLine size={17} /></button>
            <button aria-label={"删除" + todo.title} onClick={() => deleteTodo(todo.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={17} /></button>
          </div>}
        </div>)}
      </div>
    </section>

    <section className="mt-6">
      <SectionHeader title="训练计划" action={<Badge tone="purple">{activeDay?.exercises.length ?? 0} 个动作</Badge>} />
      <div className="app-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5"><div><div className="eyebrow">当前计划</div><h2 className="mt-1 text-xl font-bold">{(plan?.name ?? "推拉腿 + 核心 V1").replace("PPL + Core", "推拉腿 + 核心")}</h2></div>{editingPlan ? <button onClick={savePlanEdits} className="primary-button min-h-10 px-3 text-sm">保存编辑</button> : <button onClick={() => { setNotice(""); setEditingPlan(true); }} className="secondary-button min-h-10 px-3 text-sm"><PencilLine size={16} />编辑</button>}</div>
        <div className="grid grid-cols-5 gap-2 p-4">{(plan?.days ?? []).map(day => <button key={day.id} onClick={() => setDayId(day.id)} className={"rounded-2xl p-3 text-center " + (day.id === activeDay?.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-500")}><div className="text-xs font-semibold">第 {day.sortOrder + 1} 天</div><div className="mt-1 text-sm font-bold">{dayLabel(day.name)}</div></button>)}</div>
      </div>
    </section>

    <section className="mt-5">
      <SectionHeader title={"今天 · " + dayLabel(activeDay?.name ?? "Push")} action={<div className="flex items-center gap-2"><Badge tone="purple">{activeDay?.exercises.length ?? 0} 个动作</Badge>{editingPlan && <button onClick={addExercise} className="secondary-button min-h-9 px-3 text-sm"><Plus size={15} />添加动作</button>}</div>} />
      <div className="app-card divide-y divide-slate-100 overflow-hidden">
        {activeDay?.exercises.map((item, index) => editingPlan ? <div key={item.id} className="space-y-3 p-4">
          <div className="flex items-center gap-3"><GripVertical size={17} className="text-slate-300" /><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Dumbbell size={19} /></div><input className="field min-w-0 flex-1" value={item.exercise?.name ?? ""} onChange={event => updateExerciseName(item.id, event.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><label className="muted">组数<input className="field mt-1 px-2" type="number" min="1" value={item.targetSets} onChange={event => updateExercise(item.id, { targetSets: Number(event.target.value) || 1 })} /></label><label className="muted">最少次数<input className="field mt-1 px-2" type="number" min="1" value={item.repMin ?? 1} onChange={event => updateExercise(item.id, { repMin: Number(event.target.value) || 1 })} /></label><label className="muted">最多次数<input className="field mt-1 px-2" type="number" min="1" value={item.repMax ?? item.repMin ?? 1} onChange={event => updateExercise(item.id, { repMax: Number(event.target.value) || 1 })} /></label><label className="muted">休息（秒）<input className="field mt-1 px-2" type="number" min="0" value={item.restSeconds} onChange={event => updateExercise(item.id, { restSeconds: Number(event.target.value) || 0 })} /></label></div>
          <div className="flex flex-wrap items-center justify-end gap-2"><button onClick={() => updateExercise(item.id, { targetRir: Math.max(0, (item.targetRir ?? 0) - 1) })} className="secondary-button min-h-9 px-3 text-xs">RIR −</button><span className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">目标 RIR {item.targetRir ?? 0}</span><button onClick={() => updateExercise(item.id, { targetRir: (item.targetRir ?? 0) + 1 })} className="secondary-button min-h-9 px-3 text-xs">RIR +</button><button aria-label="上移动作" onClick={() => moveExercise(item.id, -1)} disabled={index === 0} className="rounded-xl p-2 text-slate-400 disabled:opacity-30"><ChevronUp size={18} /></button><button aria-label="下移动作" onClick={() => moveExercise(item.id, 1)} disabled={index === activeDay.exercises.length - 1} className="rounded-xl p-2 text-slate-400 disabled:opacity-30"><ChevronDown size={18} /></button><button aria-label="删除动作" onClick={() => removeExercise(item.id)} className="rounded-xl p-2 text-red-400 hover:bg-red-50"><Trash2 size={17} /></button></div>
        </div> : <button onClick={() => void start(activeDay.id)} key={item.id} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-blue-50/50"><GripVertical size={16} className="text-slate-300" /><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Dumbbell size={19} /></div><div className="min-w-0 flex-1"><div className="font-semibold">{item.exercise?.name}</div><div className="mt-1 text-xs text-slate-400">{item.exercise?.primaryMuscle ?? "力量训练"} · 休息 {item.restSeconds} 秒</div></div><div className="text-right"><div className="font-semibold text-blue-600">{item.targetSets} × {item.repMin}–{item.repMax}</div><ChevronRight size={17} className="ml-auto mt-1 text-slate-300" /></div></button>)}
      </div>
    </section>

    <div className="app-card mt-4 p-5"><div className="flex items-center gap-3"><div className="icon-tile bg-blue-50 text-blue-600"><Clock3 size={20} /></div><div><div className="font-semibold">训练小提示</div><div className="mt-1 text-sm text-slate-500">先完成热身，再从第一个正式组开始记录。</div></div></div><button onClick={() => void start()} disabled={loading || !activeDay || editingPlan} className="primary-button mt-5 w-full"><Dumbbell size={18} />{loading ? "启动中…" : "开始推训练"}</button></div>
    <div className="mt-6"><SectionHeader title="计划原则" /><div className="grid gap-3 sm:grid-cols-3"><Info title="保持顺序" text="动作顺序影响今天的发力状态。" icon={<GripVertical size={18} />} /><Info title="记录每组" text="重量、次数与剩余次数都会成为下一次提示。" icon={<Check size={18} />} /><Info title="只影响未来" text="修改计划不会改变历史训练快照。" icon={<Clock3 size={18} />} /></div></div>
  </>;
}

function Info({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return <div className="app-card p-4"><div className="icon-tile h-9 w-9 bg-blue-50 text-blue-600">{icon}</div><div className="mt-3 font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{text}</div></div>;
}
