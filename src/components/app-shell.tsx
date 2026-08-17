"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, ClipboardCheck, Home, Plus, UserRound, Utensils } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { QuickAddSheet } from "@/components/quick-add-sheet";

const nav = [{ href: "/plan", label: "计划", icon: ClipboardCheck }, { href: "/nutrition", label: "饮食", icon: Utensils }, { href: "/today", label: "首页", icon: Home }, { href: "/insights", label: "数据", icon: BarChart3 }, { href: "/me", label: "我的", icon: UserRound }];

export function AppShell({ children }: { children: React.ReactNode }) { const pathname = usePathname(); const [quickOpen, setQuickOpen] = useState(false); const workoutMode = pathname.startsWith("/workout/"); return <div className="mobile-frame"><main className="page-wrap">{children}</main>{!workoutMode && <><nav className="safe-bottom fixed bottom-0 left-1/2 z-30 flex h-[76px] w-full max-w-[520px] -translate-x-1/2 items-end justify-around border-t border-slate-100 bg-white/95 px-2 pb-2 shadow-[0_-4px_20px_rgba(15,23,42,.04)] backdrop-blur"><NavItem item={nav[0]} active={pathname.startsWith("/plan")} /><NavItem item={nav[1]} active={pathname.startsWith("/nutrition")} /><button onClick={() => setQuickOpen(true)} aria-label="快速记录" className="-mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,.32)] transition hover:scale-105 active:scale-95"><Plus size={30} strokeWidth={2.4} /></button><NavItem item={nav[3]} active={pathname.startsWith("/insights") || pathname.startsWith("/history")} /><NavItem item={nav[4]} active={pathname.startsWith("/me")} /></nav><QuickAddSheet open={quickOpen} onClose={() => setQuickOpen(false)} /></>}</div>; }
function NavItem({ item, active }: { item: typeof nav[number]; active: boolean }) { const Icon = item.icon; return <Link href={item.href} className={`flex w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium ${active ? "text-blue-600" : "text-slate-400"}`}><Icon size={22} strokeWidth={active ? 2.4 : 1.8} /><span>{item.label}</span></Link>; }
