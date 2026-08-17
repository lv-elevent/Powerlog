# AGENTS.md

## Project

Personal Daily OS 是一个单用户、自用、Mobile First 的个人生活工作台。

当前开发阶段：**FRONTEND FIRST**。

优先完成所有前端页面与核心交互，后端、Supabase、AI、同步等后续再接。

---

## Read First

开始工作前按顺序阅读：

1. `01_PRD`（如项目中存在）
2. `02_技术栈与页面架构.md`
3. `03_数据库Schema.md`（仅理解数据形状，当前不要实现数据库）
4. `04_UI视觉规范与页面详细设计.md`
5. `05_开发实施计划与章节手册.md`
6. `06_Codex前端优先开发说明.md`
7. UI 设计稿 `01～17`

如果文档冲突：

> 最新文档 > 最新编号 UI 设计稿 > 旧稿。

---

## Current Scope

必须优先完成：

```text
/unlock
/today
/plan
/nutrition
/nutrition/add
/insights
/me
/history
/history/[date]
/review/[date]
/workout/[id]
```

以及：

```text
Quick Add Bottom Sheet
Workout Rest Timer
Workout Complete
```

---

## Main Navigation

锁定为：

```text
计划 / 饮食 / 首页 / 数据 / 我的
```

History 从“日历”等入口进入，不占底部主导航。

---

## Frontend Stack

```text
Next.js App Router
React
TypeScript strict
Tailwind CSS
CSS Variables
shadcn/ui / Radix
Lucide
React Hook Form
Zod
Recharts
date-fns
```

不要更换技术栈。

---

## Data Rule

当前阶段全部使用 Mock Data。

禁止因为没有后端而停止开发。

推荐：

```text
src/mock/*
src/services/*
```

页面调用 service，service 当前返回 Mock。

后续 backend 只替换 service 实现。

---

## Visual Rule

新版 UI 优先参考：

```text
06～17
```

01～05 仅作为旧版结构参考。

整体视觉：

```text
亮白
浅蓝灰背景
蓝色主色
少量橙/绿/紫辅助色
20～24px 大圆角
柔和阴影
轻渐变
Premium Fitness App
Mobile First
```

禁止：

- 黑暗风
- 企业后台
- 默认 shadcn 主题直接套用
- 大面积紫色渐变
- 随意新增视觉语言

---

## Coding Rules

- TypeScript strict
- 避免 `any`
- 页面负责组合，业务拆 feature/service
- UI 不直接耦合 Mock 数据源
- 组件尽量 < 300 行
- 优先复用组件
- 不创建无意义抽象
- 不做与当前前端无关的重构

---

## UX Priority

优先级：

```text
1. 前端完整
2. 手机好用
3. 页面视觉一致
4. 核心交互可演示
5. 组件复用
6. PC 自然响应
7. 后端扩展接口可替换
```

---

## Backend Boundary

当前不要实现：

```text
Supabase Database
RLS
Service Role
真实 Auth
服务端 PIN
真实 Storage
Offline Sync
AI
```

PIN 当前只做 Mock 前端流程，并加 TODO 注释。

---

## Required Mock Interactions

必须能演示：

- PIN 解锁
- Bottom Nav
- Quick Add
- 饮水添加
- 支出添加
- 体重记录
- 饮食模板添加
- 食品搜索/选择
- Workout Set
- Rest Timer
- Workout Complete
- History 日期选择
- Daily Review
- Insights Tab / Range 切换

---

## Completion Checks

每个阶段结束：

```bash
npm run lint
npm run build
```

如果存在：

```bash
npm run typecheck
npm run test
```

失败必须修复再继续。

---

## Do Not Ask Unless Blocked

不要因为小型 UI/交互细节反复询问用户。

优先依据：

```text
UI 图 → UI 文档 → PRD → 最简单合理实现
```

只有真正无法继续开发时才询问。

---

## Final Goal of This Stage

# 前端完整、好看、能点、能演示。

后端以后接。
