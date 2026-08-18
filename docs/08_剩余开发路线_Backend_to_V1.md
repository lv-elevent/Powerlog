# Personal Daily OS — 剩余开发路线 Backend → V1

> 日期：2026-08-17  
> 当前状态：Frontend V1 UI Freeze + Backend Phase 1 已完成  
> 目标：在不推翻现有前端的前提下，把剩余 Mock 模块逐步替换成真实 Supabase 数据，最终完成可长期使用的 V1。

---

# 1. 当前已完成

## Frontend

- `/unlock`
- `/today`
- `/plan`
- `/nutrition`
- `/nutrition/add`
- `/insights`
- `/me`
- `/history`
- `/history/[date]`
- `/review/[date]`
- `/workout/[id]`
- Quick Add
- Rest Timer
- Workout Complete
- 390 / 430 / 768 / 1440 响应式
- Chromium QA
- `typecheck / lint / build` 全通过

## Backend Phase 1

已完成：

- Supabase 项目
- 完整 Schema
- 26 Tables
- 5 Views
- 26 Tables RLS
- 自定义 PIN
- scrypt PIN Hash
- HttpOnly Session
- `/setup`
- `/unlock`
- `/lock`
- Water 持久化
- Body 持久化
- Expense 持久化
- Daily Note 持久化
- Today 部分真实数据
- History 部分真实数据

当前真实数据链：

```text
UI
↓
Service
↓
Next.js Route Handler
↓
Repository
↓
Supabase
```

---

# 2. 剩余阶段总览

```text
Phase 2  Nutrition
Phase 3  Workout
Phase 4  Sleep / Cardio / Work / Daily Review
Phase 5  History Full Real Data
Phase 6  Insights Full Real Data
Phase 7  Media / Storage
Phase 8  Offline / Sync
Phase 9  PWA / Deployment / Production Hardening
Phase 10 Final QA / V1 Release
```

开发原则：

> 一阶段一闭环。  
> 每阶段完成真实持久化、刷新验证、History 验证，再进入下一阶段。

---

# 3. Phase 2 — Nutrition

目标：

```text
食品库
→ 餐食模板
→ 记录一顿饭
→ 自动营养计算
→ Today 汇总
→ History 回看
```

接入：

```text
nutrition_goals
food_library
meal_templates
meal_template_items
meals
meal_items
v_meal_totals
v_daily_nutrition
```

必须实现：

- Food Library 查询 / 新增 / 编辑 / 收藏 / 停用
- 早餐 / 午餐 / 晚餐 / 加餐
- 食物重量
- kcal
- Protein
- Carbs
- Fat
- Fiber
- Meal Template
- Nutrition Goal 历史版本
- Meal 编辑 / 删除
- Today 实时营养汇总
- History 真实餐食

最高优先级：

## Snapshot

历史 Meal 必须保存：

```text
food_name_snapshot
brand_snapshot
quantity_g
calories_snapshot
protein_snapshot
carbs_snapshot
fat_snapshot
fiber_snapshot
```

后续修改 Food Library：

> 历史 Meal 不允许变化。

完成标准：

```text
新增食品
→ 创建早餐
→ Today 更新
→ 刷新
→ 数据仍在
→ 修改食品库
→ 旧 Meal 不变
→ History 可查看
```

---

# 4. Phase 3 — Workout

目标：

```text
训练计划
→ 开始训练
→ 每组 Weight / Reps / RIR
→ Rest Timer
→ 完成训练
→ 下次显示上次真实记录
```

接入：

```text
exercise_library
workout_plans
workout_plan_days
workout_plan_exercises
workout_sessions
workout_session_exercises
workout_sets
v_workout_session_summary
```

核心流程：

```text
当前 Plan
↓
Start Workout
↓
创建 workout_session
↓
复制 Plan Day 到 Session Snapshot
↓
记录 Sets
↓
完成训练
↓
History
↓
下次训练读取历史
```

必须保留：

```text
exercise_name_snapshot
target_sets_snapshot
rep_min_snapshot
rep_max_snapshot
target_rir_snapshot
rest_seconds_snapshot
```

训练计划以后修改：

> 历史 Workout Session 不变化。

完成标准：

```text
开始 Push
→ 完成若干组
→ 结束训练
→ 刷新
→ Workout 仍存在
→ History 能看
→ 下次 Push 显示上次 Weight / Reps
```

---

# 5. Phase 4 — Life Logs

接入：

```text
sleep_logs
cardio_sessions
work_sessions
daily_reviews
```

## Sleep

- 上床时间
- 入睡时间
- 起床时间
- 睡眠时长
- 质量 1～5
- 备注

## Cardio

- 类型
- 时长
- 坡度
- 速度
- 距离
- 心率
- 热量估算

## Work / Study

- start_at
- end_at
- session_type
- did_text
- learned_text
- output_text
- problems_text
- note

## Daily Review

- best_thing
- improvement
- tomorrow_priority
- mood_score
- energy_score
- completed_at

完成 Review：

```text
daily_reviews.completed_at = now()
daily_logs.is_closed = true
daily_logs.closed_at = now()
```

---

# 6. Phase 5 — History Full Real Data

当前 History 已部分真实。

本阶段彻底移除 History 中剩余 Mock。

`GET /api/history/[date]` 返回：

```text
daily
sleep
body
cardio
meals
water
work
workout
expenses
notes
review
```

要求：

- 任意日期完整恢复
- 按真实时间排序
- 历史补记
- 历史编辑
- 历史删除
- Timeline 与 Today 共用组件

---

# 7. Phase 6 — Insights Full Real Data

将 `/insights` 的 Mock Trend Data 替换成真实数据。

## Body

- 体重
- 7 日平均
- 30 日变化
- 腰围

## Nutrition

- kcal
- Protein
- Carbs
- Fat
- Fiber
- 达标率

## Training

- 训练次数
- 总时长
- Push / Pull / Legs / Core 次数
- Working Sets
- Volume
- 动作最佳重量趋势

## Life

- Sleep
- Water
- Work / Study
- Cardio

## Finance

- 日
- 周
- 月
- 分类汇总

周期：

```text
7D
30D
3M
1Y
```

原则：

> 优先使用现有 Views + PostgreSQL 聚合，不在前端计算大量历史数据。

---

# 8. Phase 7 — Media / Storage

使用：

```text
Supabase Private Storage
```

Bucket：

```text
private-media
```

接入：

```text
media_assets
```

支持：

- Meal Photo
- Body Photo
- Work Screenshot
- Daily Note Image

原则：

```text
图片文件 → Storage
数据库 → 只保存 storage_path / metadata
```

禁止：

- Base64 存数据库
- Public Bucket
- 永久公开 URL

展示：

```text
Server
→ Signed URL
→ Client
```

---

# 9. Phase 8 — Offline / Sync

使用：

```text
IndexedDB
Dexie
```

本地：

```text
cached_today
local_drafts
sync_outbox
sync_metadata
```

优先离线支持：

- Water
- Expense
- Body
- Work
- Note
- Workout Set

流程：

```text
网络失败
↓
Outbox
↓
UI 显示待同步
↓
恢复网络
↓
Retry
↓
Supabase
```

必须使用：

```text
client_idempotency_key
```

防止重试产生重复数据。

图片离线同步可推迟到 V1.1。

---

# 10. Phase 9 — PWA / Deployment

部署：

```text
GitHub
→ Vercel
```

环境变量：

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
APP_SETUP_SECRET
APP_SESSION_SECRET
```

生产检查：

- PIN Guard
- Setup 关闭
- HttpOnly
- Secure Cookie
- Service Key 不进入 Client Bundle
- Storage Private
- API 401
- HTTPS
- PWA Manifest
- App Icon
- Apple Touch Icon
- Standalone Mode

---

# 11. Phase 10 — Final QA

最终必须验证：

## Security

- Setup
- Unlock
- Lock
- Wrong PIN
- Session Expire
- Unauthorized API = 401

## Persistence

- Water
- Body
- Expense
- Note
- Meal
- Workout
- Sleep
- Cardio
- Work
- Review

全部：

```text
新增
→ 刷新
→ 重新打开
→ History
```

数据必须仍存在。

## Snapshot

### Food

修改食品库：

> 历史 Meal 不变化。

### Workout

修改训练计划：

> 历史 Workout 不变化。

## Responsive

```text
390×844
430×932
768×1024
1440×900
```

## Commands

```bash
npm run typecheck
npm run lint
npm run build
```

要求全部 PASS。

---

# 12. 自动化开发策略

从 Phase 2 开始，Codex 可以连续开发，但必须遵守：

```text
完成 Phase
↓
运行 QA
↓
通过
↓
Git Commit
↓
进入下一 Phase
```

如果本阶段失败：

> 不继续下一阶段。

每阶段 Commit：

```text
feat(phase2): persist nutrition data
feat(phase3): persist workout sessions
feat(phase4): persist life logs
feat(phase5): complete history persistence
feat(phase6): connect real insights
feat(phase7): add private media storage
feat(phase8): add offline sync
feat(phase9): production deployment hardening
```

---

# 13. 优先级

剩余开发优先级：

```text
1 Nutrition
2 Workout
3 Life Logs
4 History
5 Insights
6 Media
7 Offline
8 Deployment
9 QA
```

如果额度不足：

最少完成：

```text
Nutrition
Workout
Life Logs
History
```

此时已经具备核心长期使用价值。

---

# 14. 不要继续扩展的功能

V1 暂不做：

- AI Food Recognition
- AI Coach
- AI Workout Recommendation
- Apple Health
- Health Connect
- Smart Watch
- Social
- Multi-user
- Billing
- Native iOS / Android

先完成真实数据系统。

---

# 15. 最终 V1 完成状态

```text
Wake Up
↓
Body
↓
Cardio
↓
Breakfast
↓
Work
↓
Lunch
↓
Work
↓
Dinner
↓
Workout
↓
Expense / Water
↓
Daily Review
↓
History
↓
Insights
```

所有数据：

```text
真实写入
长期保存
可修改
可回看
可统计
可导出
```

这就是 Personal Daily OS V1 的后端完成标准。
