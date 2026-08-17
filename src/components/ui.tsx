"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CircleCheck, Droplets, Dumbbell, Flame, Footprints, Moon, PenLine, Plus, Sun, Utensils, Wallet, BriefcaseBusiness, BookOpen, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TimelineItem } from "@/types";

export const iconForKind: Record<TimelineItem["kind"], LucideIcon> = { sleep: Moon, cardio: Footprints, meal: Utensils, work: BriefcaseBusiness, workout: Dumbbell, water: Droplets, expense: Wallet, review: CircleCheck };

export function PageIntro({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="relative mb-5 flex items-start justify-between gap-4 overflow-hidden pt-4 md:pt-8"><div className="relative z-10"><div className="eyebrow mb-2">{eyebrow}</div><h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em] text-ink md:text-4xl">{title}</h1>{subtitle && <p className="mt-2 text-[15px] text-slate-500">{subtitle}</p>}</div>{action && <div className="relative z-10 shrink-0 pt-1">{action}</div>}<div className="pointer-events-none absolute -right-10 -top-24 h-52 w-52 rounded-full bg-blue-100/60 blur-3xl" /></div>;
}

export function SectionHeader({ title, action, className = "" }: { title: string; action?: React.ReactNode; className?: string }) { return <div className={`mb-3 flex items-center justify-between ${className}`}><h2 className="section-title">{title}</h2>{action}</div>; }
export function ProgressBar({ value, color = "blue" }: { value: number; color?: "blue" | "green" | "orange" | "purple" }) { const colors = { blue: "bg-blue-500", green: "bg-emerald-500", orange: "bg-orange-500", purple: "bg-violet-500" }; return <div className="progress-track"><div className={`h-full rounded-full ${colors[color]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>; }
export function Metric({ label, value, unit, color = "blue" }: { label: string; value: string | number; unit?: string; color?: "blue" | "green" | "orange" | "purple" }) { const colors = { blue: "text-blue-600", green: "text-emerald-500", orange: "text-orange-500", purple: "text-violet-600" }; return <div><div className="text-[13px] text-slate-500">{label}</div><div className={`mt-1 text-[26px] font-bold tracking-[-0.04em] ${colors[color]}`}>{value}<span className="ml-1 text-[12px] font-medium text-slate-400">{unit}</span></div></div>; }

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="app-card flex flex-col items-center px-6 py-12 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Plus size={28} /></div><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>; }

export function Timeline({ items, compact = false }: { items: TimelineItem[]; compact?: boolean }) {
  return (
    <div className="relative">
      {items.map((item, index) => {
        const Icon = iconForKind[item.kind];
        const isLast = index === items.length - 1;

        return (
          <div
            className={`relative grid grid-cols-[48px_16px_40px_minmax(0,1fr)] items-start gap-3 ${isLast ? "" : "pb-4"}`}
            key={item.id}
          >
            <div className="flex h-10 items-center justify-end text-xs font-medium text-slate-400">
              {item.time}
            </div>

            <div className="relative self-stretch">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-200"
                />
              )}
              <div className="relative flex h-10 w-4 items-center justify-center">
                <span
                  className={`z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 ${item.completed ? "border-blue-500 bg-blue-500" : "border-blue-300 bg-white"}`}
                >
                  {item.completed && <Check size={10} className="text-white" />}
                </span>
              </div>
            </div>

            <div className="icon-tile h-10 w-10 rounded-2xl bg-blue-50 text-blue-600">
              <Icon size={20} />
            </div>

            <div
              className={`min-w-0 ${isLast ? "" : "border-b border-slate-100"} ${compact ? "pb-1" : "pb-4"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>
                {item.value && (
                  <span
                    className={`whitespace-nowrap text-sm font-semibold ${item.kind === "workout" ? "text-violet-600" : item.kind === "meal" ? "text-orange-500" : "text-blue-600"}`}
                  >
                    {item.value}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BackLink({ href = "/today" }: { href?: string }) { return <Link className="ghost-button -ml-3" href={href}><ArrowRight className="rotate-180" size={20} /></Link>; }
export function IconButton({ onClick, children, label }: { onClick?: () => void; children: React.ReactNode; label?: string }) { return <button aria-label={label} onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">{children}</button>; }
export function Sheet({ open, title, subtitle, onClose, children }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) { if (!open) return null; return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 px-0 backdrop-blur-[2px]" onMouseDown={onClose}><div className="sheet-enter max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-float" onMouseDown={event => event.stopPropagation()}><div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300" /><div className="mb-5 flex items-start justify-between"><div><h2 className="text-2xl font-bold tracking-tight">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div><IconButton onClick={onClose} label="关闭"><X size={20} /></IconButton></div>{children}</div></div>; }

export function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "orange" | "purple" }) { const tones = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-600", orange: "bg-orange-50 text-orange-600", purple: "bg-violet-50 text-violet-600" }; return <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>; }

export function QuickLink({ href, icon: Icon, title, subtitle }: { href: string; icon: LucideIcon; title: string; subtitle?: string }) { return <Link href={href} className="app-card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md"><div className="icon-tile bg-blue-50 text-blue-600"><Icon size={21} /></div><div className="min-w-0 flex-1"><div className="font-semibold">{title}</div>{subtitle && <div className="mt-1 text-xs text-slate-400">{subtitle}</div>}</div><ChevronRight size={18} className="text-slate-300" /></Link>; }
