"use client";

import Link from "next/link";
import { ArrowLeft, Check, Cloud, Download, LockKeyhole, Plus, ShieldCheck, Target, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { BackLink, Badge, SectionHeader } from "@/components/ui";

const copy: Record<string, { title: string; subtitle: string; icon: typeof UserRound }> = {
  profile: { title: "个人资料", subtitle: "让每日目标更贴近真实的你。", icon: UserRound },
  goals: { title: "每日目标", subtitle: "目标可以随阶段调整，历史记录保持不变。", icon: Target },
  foods: { title: "食品库", subtitle: "管理常用食品和营养快照。", icon: Plus },
  "meal-templates": { title: "餐食模板", subtitle: "把高频餐食变成一键记录。", icon: Plus },
  training: { title: "训练计划", subtitle: "PPL + Core V1，只影响未来训练。", icon: Target },
  security: { title: "PIN 与安全", subtitle: "当前为前端演示流程。", icon: LockKeyhole },
  export: { title: "数据导出", subtitle: "后续支持完整 JSON / CSV 导出。", icon: Download },
  sync: { title: "同步状态", subtitle: "后端接入前，数据保存在本机演示状态。", icon: Cloud },
  app: { title: "PWA 设置", subtitle: "安装到主屏幕，像 App 一样使用。", icon: ShieldCheck },
};

export default function MeSectionPage() { const { section } = useParams<{ section: string }>(); const config = copy[section] ?? copy.profile; const Icon = config.icon; return <><div className="flex items-center gap-2 pt-4 md:pt-8"><BackLink href="/me" /><div><div className="eyebrow">Settings</div><h1 className="text-2xl font-bold">{config.title}</h1></div></div><p className="mt-2 pl-10 text-slate-500">{config.subtitle}</p><div className="app-card mt-6 flex items-center gap-4 bg-blue-50/60 p-5"><div className="icon-tile h-14 w-14 bg-white text-blue-600"><Icon size={26} /></div><div><Badge tone="blue">FRONTEND MOCK</Badge><div className="mt-2 font-semibold">这一页已准备好后端替换接口</div><div className="mt-1 text-sm text-slate-500">当前修改只保留在本地演示状态。</div></div></div><div className="app-card mt-4 p-5"><SectionHeader title="当前配置" /><div className="space-y-3">{["显示名称 · Personal Daily OS", "时区 · Asia/Shanghai", "目标 · Body Recomposition", "状态 · 已同步 Mock"].map(item => <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">{item.split(" · ")[0]}</span><span className="font-semibold">{item.split(" · ")[1]}</span></div>)}</div></div><button className="primary-button mt-5 w-full"><Check size={18} />保存演示设置</button><Link href="/me" className="ghost-button mt-3 w-full">返回我的</Link></> }
