# Personal Daily OS — Codex 前端优先开发说明 V1.0

> 当前策略：**先把全部前端页面与核心交互做完，暂不接后端数据库。**  
> 原因：优先利用当前 Codex 额度完成最难替代、最直观的页面开发；后续 Supabase、真实存储、同步、AI 等能力可以再由其他模型/Agent继续补齐。

---

# 1. 本阶段唯一目标

Codex 当前只做一件事：

> **把 Personal Daily OS 的手机端前端完整做出来，并尽可能达到现有 UI 设计稿。**

当前阶段必须完成：

- 全部核心页面
- 全部主要二级页面
- 手机端响应式
- 底部导航
- Quick Add 弹层
- 饮食交互
- 训练记录交互
- Rest Timer
- History 日历
- Daily Review
- 数据趋势图表
- Me / 设置页面
- PIN 解锁视觉与前端流程
- Mock 数据
- 页面之间真实可跳转
- 组件复用

当前阶段**不要**花额度做：

- Supabase 建库
- API Route 完整业务实现
- Service Role
- 数据迁移
- RLS
- 服务端 PIN 安全
- Offline Sync
- 图片真实上传
- AI 食物识别
- AI Coach
- 原生 App

这些全部留给后续阶段。

---

# 2. 前端技术栈

锁定：

```text
Next.js App Router
React
TypeScript strict
Tailwind CSS
CSS Variables
shadcn/ui / Radix primitives
Lucide Icons
React Hook Form
Zod
Recharts
date-fns
```

当前阶段允许增加少量必要前端依赖，但不得更换主体技术栈。

---

# 3. 当前页面导航最终口径

最新视觉稿优先，底部主导航锁定为：

```text
计划 / 饮食 / 首页 / 数据 / 我的
```

推荐路由：

```text
/                → redirect /today
/unlock          → PIN 解锁
/today           → 首页
/plan            → 今日计划
/nutrition       → 饮食记录
/insights        → 数据趋势
/me              → 我的
/history         → 历史日历
/history/[date]  → 某日详情
/review/[date]   → 完成今天 / 每日复盘
/workout/[id]    → 训练中
/workout/[id]/rest
/workout/[id]/complete
/nutrition/add
```

注意：

> History 不占底部主导航，首页右上角“日历”或相关入口进入 `/history`。

---

# 4. UI 设计稿优先级

压缩包中已有 17 张 UI 图。

开发时优先级：

## 第一优先级：新版视觉

```text
06 清新今日计划仪表盘
07 清爽营养饮食记录界面
08 数据趋势健康仪表盘
09 极简健身训练追踪界面
10 个人每日系统_PIN_界面
11 健身营养历史日历界面
12 每日健康与生活记录界面
13 完成今天_每日复盘界面
14 健康计划快速记录界面
15 清新营养饮食记录界面
16 蓝色健身休息倒计时界面
17 训练完成数据总结界面
```

这些应作为最终视觉基准。

## 第二优先级：第一轮稿

```text
01～05
```

仅用于补充布局与早期想法，不应覆盖新版视觉。

---

# 5. 页面与设计稿对应

| 页面 | 主要参考设计稿 |
|---|---|
| 首页 / Today | 06 |
| 计划 | 06 + 14（结构） |
| 饮食主页 | 07 |
| 数据趋势 | 08 |
| 我的 | 04（结构）+ 新版统一风格 |
| 训练中 | 09 |
| PIN | 10 |
| History 日历 | 11 |
| History 某日详情 | 12 |
| Daily Review | 13 |
| Quick Add | 14 |
| 添加饮食 / 食品库 | 15 |
| Rest Timer | 16 |
| 训练完成 | 17 |

如果设计稿之间存在冲突：

> **使用编号更高、生成时间更新的设计稿。**

---

# 6. Design System

整体基调：

```text
Bright White
Soft Blue
Soft Gradient
Large Radius
Low Contrast Border
Soft Shadow
Premium Fitness App
Mobile First
```

视觉特点：

- 白色 / 极浅蓝灰背景
- 蓝色为核心品牌色
- 橙 / 绿 / 紫只作为少量业务状态辅助色
- 20～24px 卡片圆角
- 图标使用柔和浅色底容器
- 大数字突出
- 数据模块适度丰富，不要太素
- 可以使用轻量渐变与 3D 风格装饰插图，但不要泛滥
- 页面之间必须像一个 App，而不是 17 套不同模板

禁止：

- 黑暗风格
- 大面积蓝紫渐变
- 企业后台布局
- 默认 shadcn 风格直接套用
- 过度玻璃拟态
- Emoji 当主要图标
- 每张卡片都不同配色

---

# 7. 前端数据策略：全部 Mock，但接口形状要可替换

当前不接数据库。

建议结构：

```text
src/
├── mock/
│   ├── today.ts
│   ├── plan.ts
│   ├── nutrition.ts
│   ├── workout.ts
│   ├── history.ts
│   ├── insights.ts
│   └── profile.ts
│
├── services/
│   ├── daily-service.ts
│   ├── nutrition-service.ts
│   ├── workout-service.ts
│   └── history-service.ts
```

Service 当前返回 Mock：

```ts
export async function getTodayData() {
  return mockTodayData;
}
```

后续只需要把 service 内实现替换成 API 请求即可。

不要让页面组件直接 import 大量 Mock JSON。

---

# 8. Mock 数据必须覆盖真实场景

至少准备：

## Today

```text
60.0kg
1280 / 2050 kcal
Protein 78 / 125g
Water 1300 / 2500ml
PUSH
¥46
```

## Nutrition

```text
早餐
午餐
晚餐待记录
加餐待记录
```

## Workout

```text
Push
6 actions
17 sets
45kg bench press
RIR 2
```

## History

至少 30 天 Mock 数据，保证月历和趋势图真实可展示。

---

# 9. 必须先实现的公共组件

优先完成：

```text
AppShell
BottomNav
PageHeader
SectionHeader
Card
MetricCard
ProgressBar
StatusPill
IconTile
BottomSheet
QuickAddSheet
DailyTimeline
TimelineItem
MacroProgress
NumberStepper
RestTimer
CalendarMonth
TrendChart
EmptyState
```

避免每个页面重复写同一套卡片。

---

# 10. 前端开发顺序（额度优先版）

按照下面顺序，不要跳：

## Phase F0 — 基础

- Next.js 项目
- Tailwind
- Design Tokens
- App Shell
- Bottom Nav
- 公共组件
- Mock Data

## Phase F1 — 主导航 5 页

1. `/today`
2. `/plan`
3. `/nutrition`
4. `/insights`
5. `/me`

先让这 5 页完整可看、可跳转。

## Phase F2 — 关键流程页

6. `/unlock`
7. `/history`
8. `/history/[date]`
9. `/review/[date]`
10. Quick Add Bottom Sheet
11. `/nutrition/add`

## Phase F3 — Workout

12. `/workout/[id]`
13. Rest Timer 状态
14. Workout Complete

## Phase F4 — Polish

- 手机 390px 重点适配
- 375 / 430px
- 平板 / PC 自然响应
- Loading / Empty / Error
- Motion
- 交互细节

---

# 11. PIN 当前只做前端演示

当前阶段：

```text
输入 4 位 PIN
→ 前端校验 Mock PIN
→ 进入 /today
```

例如开发默认：

```text
PIN = 1234
```

只用于本地演示。

必须留下明显注释：

```ts
// TODO(BACKEND): Replace mock PIN verification with server-side secure session.
```

不要浪费当前额度做正式安全方案。

---

# 12. Quick Add 必须真实可用（前端层）

点击中央按钮后打开 Bottom Sheet：

```text
饮食
饮水
训练
支出
体重
工作
有氧
随手记
图片
```

至少实现：

- 打开/关闭
- 对应子 Sheet
- 输入
- 保存到 Client State
- Today 页面即时更新

刷新后数据丢失目前可以接受。

---

# 13. 饮食页前端必须完成

必须实现：

- kcal 总进度
- Protein / Carbs / Fat / Fiber
- 早餐 / 午餐 / 晚餐 / 加餐
- 常用模板
- 最近使用
- 食品库
- 搜索
- 添加食品
- 修改克数
- 拍照 / 相册按钮 UI

图片识别本阶段只是 UI，占位即可。

---

# 14. Workout 前端必须认真做

这是整个前端最重要交互之一。

必须完成：

- Push 页面
- 当前动作
- 上次记录
- Weight Stepper
- Reps Stepper
- RIR Stepper
- 完成这一组
- Set 状态更新
- Rest Timer
- -30 / 跳过 / +30
- 下一个动作
- 当前动作列表
- 训练计时
- 完成训练
- Summary
- Feeling 1～5
- Note

全部可使用 Local State 实现。

---

# 15. Chart 页面

`/insights` 使用 Recharts。

必须有：

```text
7天
30天
3月
1年
```

Tab：

```text
身体
营养
训练
生活
消费
```

当前 Mock 数据即可。

---

# 16. 我的页面

至少完成：

```text
个人资料
每日目标
营养目标
食品库
餐食模板
训练计划
PIN 与安全
数据导出
同步状态
```

二级设置不需要全部真正持久化，但 UI 与路由入口必须存在。

---

# 17. 前端完成标准

本阶段完成时，应该能做到：

> 打开 App → PIN → Today

> 切换计划 / 饮食 / 数据 / 我的

> 打开 Quick Add

> 添加模拟饮水 / 支出 / 体重

> 进入饮食页并添加模拟食物

> 开始 PUSH 训练

> 完成 Set → Rest Timer

> 完成训练 → Summary

> 打开 History 月历

> 打开某一天完整记录

> 完成 Daily Review

整个流程全部可以演示。

---

# 18. 当前阶段不要追求的东西

如果额度紧张，以下内容全部往后放：

```text
真实数据库
真正登录
服务端 PIN
图片 Storage
离线同步
PWA 高级缓存
AI
真实营养数据库
原生推送
复杂测试覆盖率
```

前端完整度优先。

---

# 19. 每个 Phase 结束执行

至少：

```text
npm run typecheck
npm run lint
npm run build
```

如果没有 `typecheck` script，使用：

```text
npx tsc --noEmit
```

---

# 20. Codex 最重要的执行规则

> **不要因为后端没做而停下来。**

> **所有数据先 Mock。**

> **优先完成用户真正能看到和操作的页面。**

> **严格按照 UI 图和 04_UI视觉规范开发。**

> **不要主动扩展产品需求。**

> **如果某个交互缺少明确规则，选择最简单、最符合现有设计稿的实现，然后继续。**

当前阶段的胜利条件不是“架构完美”，而是：

# **前端完整、好看、能点、能演示。**
