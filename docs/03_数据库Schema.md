# Personal Daily OS — 数据库 Schema V1.0

> 数据库：PostgreSQL / Supabase  
> 产品：单用户 Personal Daily OS  
> 日期：2026-08-17

---

## 1. Schema 设计目标

数据库需要满足：

1. 长期保存每天真实记录。
2. 支持按日期快速恢复完整的一天。
3. 饮食、训练必须保存历史快照。
4. 支持未来统计和 AI 分析。
5. 支持离线重试时幂等写入。
6. 当前单用户，不引入 `user_id`。
7. 修改食品库或训练计划不能污染历史数据。
8. 图片与业务数据分离。
9. 默认只允许 Next.js Server 访问数据库。

---

# 2. 核心关系总览

```text
app_profile
app_security
nutrition_goals

daily_logs
├── sleep_logs
├── body_measurements
├── cardio_sessions
├── meals
│   └── meal_items
├── water_logs
├── work_sessions
├── workout_sessions
│   └── workout_session_exercises
│       └── workout_sets
├── expenses
├── daily_notes
└── daily_reviews

food_library
├── meal_template_items
└── meal_items

meal_templates
└── meal_template_items

exercise_library
└── workout_plan_exercises

workout_plans
└── workout_plan_days
    └── workout_plan_exercises

expense_categories
└── expenses

media_assets
→ entity_type + entity_id 关联业务对象
```

---

# 3. 全局约定

## 主键

统一使用：

```sql
uuid DEFAULT gen_random_uuid()
```

## 日期与时间

业务记录统一区分：

```text
record_date   记录属于哪一天
created_at    实际创建时间
updated_at    最后修改时间
```

例如凌晨补记昨天晚饭：

```text
created_at  = 2026-08-18 00:30
record_date = 2026-08-17
```

因此历史查询不能只依赖 `created_at`。

## 数值

- 金额：`numeric(12,2)`
- kcal / Protein / Carbs / Fat / Fiber / Weight：`numeric(10,2)`
- 时间戳：`timestamptz`

## 删除

食品库、动作库等 Library 优先使用 `is_active=false`，避免破坏历史引用。

---

# 4. app_profile

单行表，保存个人长期基础资料。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | smallint | 固定 1 |
| display_name | text | 可选昵称 |
| sex | text | male/female/other |
| birth_date | date | 可选 |
| height_cm | numeric | 身高 |
| primary_goal | text | body_recomposition 等 |
| timezone | text | App 时区 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

当前基础值：

```text
sex = male
height_cm = 173
primary_goal = body_recomposition
```

年龄不永久保存为 21，后续填写出生日期后动态计算。

---

# 5. app_security

PIN 与 App 安全配置。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | smallint | 固定 1 |
| setup_completed | boolean | 是否完成初始化 |
| pin_hash | text | PIN Hash |
| session_version | integer | Session 版本 |
| auto_lock_minutes | integer | 自动锁定分钟 |
| failed_attempts | integer | 连续失败次数 |
| locked_until | timestamptz | 临时锁定到期时间 |
| updated_at | timestamptz | 更新时间 |

规则：

- PIN Hash 在 Server 生成。
- 不保存明文 PIN。
- Session Secret 放 Vercel Environment。
- 修改 PIN 时递增 `session_version`，让旧 Session 失效。

---

# 6. nutrition_goals

营养目标采用历史版本，而不是只保存一个当前值。

| 字段 | 类型 |
|---|---|
| id | uuid |
| effective_from | date |
| effective_to | date nullable |
| calories_kcal | numeric |
| protein_g | numeric |
| carbs_g | numeric |
| fat_g | numeric |
| fiber_g | numeric |
| water_ml | integer |
| note | text |
| created_at | timestamptz |

这样以后从 2050 kcal 调到 2200 kcal，历史当天的达标率不会被新目标污染。

---

# 7. daily_logs

一天的主索引，每个日期最多一条。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date UNIQUE |
| is_closed | boolean |
| completion_score | numeric nullable |
| closed_at | timestamptz nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

不直接保存每日 kcal、饮水等聚合值，避免冗余不一致。

---

# 8. sleep_logs

默认每天最多一条。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date UNIQUE |
| bedtime_at | timestamptz nullable |
| sleep_at | timestamptz nullable |
| wake_at | timestamptz nullable |
| duration_minutes | integer nullable |
| quality_score | smallint nullable |
| note | text nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

`quality_score`：1～5。

---

# 9. body_measurements

每天最多一条身体主记录。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date UNIQUE |
| measured_at | timestamptz nullable |
| weight_kg | numeric nullable |
| body_fat_pct | numeric nullable |
| waist_cm | numeric nullable |
| chest_cm | numeric nullable |
| arm_cm | numeric nullable |
| thigh_cm | numeric nullable |
| hip_cm | numeric nullable |
| note | text nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

日常主要填 `weight_kg`；围度可以每周补充。

---

# 10. cardio_sessions

一天允许多次有氧。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date |
| performed_at | timestamptz |
| cardio_type | text |
| duration_minutes | integer |
| speed_kmh | numeric nullable |
| incline_pct | numeric nullable |
| distance_km | numeric nullable |
| avg_heart_rate | integer nullable |
| calories_estimated | numeric nullable |
| note | text nullable |
| client_idempotency_key | text nullable UNIQUE |
| created_at | timestamptz |
| updated_at | timestamptz |

---

# 11. food_library

食品模板库。保存“当前食品定义”，不是历史真实摄入。

| 字段 | 类型 |
|---|---|
| id | uuid |
| name | text |
| brand | text nullable |
| serving_name | text nullable |
| serving_weight_g | numeric nullable |
| weight_basis | text |
| calories_per_100g | numeric |
| protein_per_100g | numeric |
| carbs_per_100g | numeric |
| fat_per_100g | numeric |
| fiber_per_100g | numeric |
| sodium_mg_per_100g | numeric nullable |
| barcode | text nullable |
| is_favorite | boolean |
| is_active | boolean |
| note | text nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

`weight_basis`：

```text
cooked
raw
edible_cooked
packaged
serving
other
```

当前可录入：米饭、玉米、土豆、红薯、鸡蛋、酵母蛋白粉、鸡胸肉、卤鸡腿、食用油、鱼油、西兰花。

---

# 12. meal_templates

餐食模板，例如“早餐 A”。

| 字段 | 类型 |
|---|---|
| id | uuid |
| name | text |
| meal_type | text |
| is_favorite | boolean |
| is_active | boolean |
| note | text |
| created_at | timestamptz |
| updated_at | timestamptz |

---

# 13. meal_template_items

模板中的食品项。

| 字段 | 类型 |
|---|---|
| id | uuid |
| template_id | uuid FK |
| food_id | uuid FK |
| quantity_g | numeric nullable |
| serving_count | numeric nullable |
| sort_order | integer |
| created_at | timestamptz |

模板被应用时生成新的真实 `meals + meal_items`。

---

# 14. meals

一顿真实餐食。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date |
| meal_type | text |
| title | text nullable |
| eaten_at | timestamptz |
| note | text nullable |
| source_template_id | uuid nullable |
| client_idempotency_key | text nullable UNIQUE |
| created_at | timestamptz |
| updated_at | timestamptz |

`meal_type`：breakfast / lunch / dinner / snack / pre_workout / post_workout / other。

---

# 15. meal_items

真实摄入食品快照，是 Nutrition 模块最关键的表。

| 字段 | 类型 |
|---|---|
| id | uuid |
| meal_id | uuid FK |
| food_id | uuid nullable |
| food_name_snapshot | text |
| brand_snapshot | text nullable |
| quantity_g | numeric nullable |
| serving_name_snapshot | text nullable |
| serving_count | numeric nullable |
| calories_snapshot | numeric |
| protein_snapshot | numeric |
| carbs_snapshot | numeric |
| fat_snapshot | numeric |
| fiber_snapshot | numeric |
| sodium_mg_snapshot | numeric nullable |
| sort_order | integer |
| created_at | timestamptz |

`*_snapshot` 保存的是这一次实际吃掉的总营养值。

例如 30g 蛋白粉：

```text
quantity_g = 30
calories_snapshot ≈ 124
protein_snapshot = 22.6
carbs_snapshot ≈ 0.9
fat_snapshot ≈ 3.2
```

食品库以后修改，历史不变。

---

# 16. water_logs

每一次喝水一条记录。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date |
| logged_at | timestamptz |
| amount_ml | integer |
| client_idempotency_key | text nullable UNIQUE |
| created_at | timestamptz |

适合 +200 / +300 / +500ml 快捷操作。

---

# 17. work_sessions

工作、学习、项目统一使用时间块。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date |
| session_type | text |
| title | text nullable |
| start_at | timestamptz nullable |
| end_at | timestamptz nullable |
| duration_minutes | integer nullable |
| did_text | text nullable |
| learned_text | text nullable |
| output_text | text nullable |
| problems_text | text nullable |
| note | text nullable |
| client_idempotency_key | text nullable UNIQUE |
| created_at | timestamptz |
| updated_at | timestamptz |

`session_type`：work / study / project / other。

默认 UI 可以给出 09:00–12:00、13:30–17:00，但数据库不写死。

---

# 18. exercise_library

训练动作库。

| 字段 | 类型 |
|---|---|
| id | uuid |
| name | text UNIQUE |
| category | text |
| primary_muscle | text nullable |
| equipment | text nullable |
| default_rest_seconds | integer nullable |
| is_active | boolean |
| note | text nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

---

# 19. workout_plans

训练计划版本。

| 字段 | 类型 |
|---|---|
| id | uuid |
| name | text |
| version | text |
| is_active | boolean |
| description | text nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

当前：`PPL + Core / V1`。

---

# 20. workout_plan_days

计划训练日。

| 字段 | 类型 |
|---|---|
| id | uuid |
| plan_id | uuid FK |
| day_code | text |
| name | text |
| sort_order | integer |
| estimated_minutes | integer nullable |
| is_rest_day | boolean |
| note | text nullable |

默认：Push / Pull / Legs / Core / Rest。

---

# 21. workout_plan_exercises

训练日动作模板。

| 字段 | 类型 |
|---|---|
| id | uuid |
| plan_day_id | uuid FK |
| exercise_id | uuid FK |
| sort_order | integer |
| target_sets | integer |
| rep_min | integer nullable |
| rep_max | integer nullable |
| duration_min_seconds | integer nullable |
| duration_max_seconds | integer nullable |
| target_rir | numeric nullable |
| rest_seconds | integer |
| is_optional | boolean |
| note | text nullable |

同时支持次数型动作和侧桥等时间型动作。

---

# 22. workout_sessions

一次真实训练。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date |
| plan_id | uuid nullable |
| plan_day_id | uuid nullable |
| workout_type_snapshot | text |
| workout_name_snapshot | text |
| started_at | timestamptz |
| ended_at | timestamptz nullable |
| duration_minutes | integer nullable |
| feeling_score | smallint nullable |
| note | text nullable |
| status | text |
| client_idempotency_key | text nullable UNIQUE |
| created_at | timestamptz |
| updated_at | timestamptz |

`status`：planned / in_progress / completed / cancelled。

---

# 23. workout_session_exercises

一次真实训练中的动作快照。

| 字段 | 类型 |
|---|---|
| id | uuid |
| session_id | uuid FK |
| exercise_id | uuid nullable |
| exercise_name_snapshot | text |
| sort_order | integer |
| target_sets_snapshot | integer nullable |
| rep_min_snapshot | integer nullable |
| rep_max_snapshot | integer nullable |
| target_rir_snapshot | numeric nullable |
| rest_seconds_snapshot | integer nullable |
| status | text |
| note | text nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

修改动作库或计划，不改变这里的历史数据。

---

# 24. workout_sets

真实完成的每一组。

| 字段 | 类型 |
|---|---|
| id | uuid |
| session_exercise_id | uuid FK |
| set_number | integer |
| set_type | text |
| weight_kg | numeric nullable |
| reps | integer nullable |
| rir | numeric nullable |
| duration_seconds | integer nullable |
| completed_at | timestamptz nullable |
| is_completed | boolean |
| client_idempotency_key | text nullable UNIQUE |
| created_at | timestamptz |
| updated_at | timestamptz |

`set_type`：warmup / working / drop / backoff / other。

---

# 25. expense_categories

消费分类库。

初始：餐饮、交通、购物、娱乐、健身、学习、其他。

字段：id、name、icon、sort_order、is_active、created_at。

---

# 26. expenses

真实消费记录。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date |
| spent_at | timestamptz |
| amount | numeric(12,2) |
| category_id | uuid nullable |
| merchant | text nullable |
| note | text nullable |
| client_idempotency_key | text nullable UNIQUE |
| created_at | timestamptz |
| updated_at | timestamptz |

V1 不做账户、银行卡、借贷和双重记账。

---

# 27. daily_notes

自由随手记。

字段：id、record_date、noted_at、text、client_idempotency_key、created_at、updated_at。

---

# 28. daily_reviews

每天最多一条。

| 字段 | 类型 |
|---|---|
| id | uuid |
| record_date | date UNIQUE |
| best_thing | text nullable |
| improvement | text nullable |
| tomorrow_priority | text nullable |
| mood_score | smallint nullable |
| energy_score | smallint nullable |
| completed_at | timestamptz nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

Review 完成时同步关闭 `daily_logs`。

---

# 29. media_assets

真实文件放 Supabase Private Storage，本表只存元数据。

| 字段 | 类型 |
|---|---|
| id | uuid |
| entity_type | text |
| entity_id | uuid |
| storage_bucket | text |
| storage_path | text UNIQUE |
| media_type | text |
| role | text nullable |
| original_filename | text nullable |
| mime_type | text nullable |
| size_bytes | bigint nullable |
| width | integer nullable |
| height | integer nullable |
| captured_at | timestamptz nullable |
| sort_order | integer |
| created_at | timestamptz |

`entity_type` 示例：meal / body_measurement / work_session / daily_note / daily_review。

`role` 示例：meal_photo / front / side / back / screenshot / general。

V1 采用多态媒体关联，应用层负责验证 `entity_type + entity_id`。

---

# 30. Storage 目录

```text
private-media/
├── meals/2026/08/17/
├── body/2026/08/17/
├── work/2026/08/17/
└── notes/2026/08/17/
```

数据库保存 `storage_path`，不保存永久公开 URL。

---

# 31. 聚合 Views

推荐建立：

### v_meal_totals

每顿饭聚合 kcal / Protein / Carbs / Fat / Fiber。

### v_daily_nutrition

每天营养总量。

### v_daily_water

每天饮水总量。

### v_daily_expenses

每天总支出。

### v_workout_session_summary

每次训练 working sets、总 reps 和训练容量。

训练容量：

```text
SUM(weight_kg × reps)
```

只统计完成的 working sets。

---

# 32. Today API 聚合

`GET /api/today?date=2026-08-17`

建议一次性返回：

```text
daily_log
sleep
body
cardio
meals + meal totals
water total
work sessions
workout
expense total
notes
review
nutrition goal
```

不要进入 Today 后让客户端连续发十几个请求。

---

# 33. Insights 查询

30 天体重：

```sql
SELECT record_date, weight_kg
FROM body_measurements
WHERE record_date >= CURRENT_DATE - INTERVAL '29 days'
ORDER BY record_date;
```

30 天营养：

```sql
SELECT *
FROM v_daily_nutrition
WHERE record_date >= CURRENT_DATE - INTERVAL '29 days'
ORDER BY record_date;
```

---

# 34. 索引策略

优先为以下字段建立索引：

```text
record_date
parent foreign key
started_at / eaten_at / spent_at
```

包括：

```text
meals(record_date)
water_logs(record_date)
work_sessions(record_date)
workout_sessions(record_date)
expenses(record_date)
cardio_sessions(record_date)
meal_items(meal_id)
workout_session_exercises(session_id)
workout_sets(session_exercise_id)
media_assets(entity_type, entity_id)
```

---

# 35. 删除策略

真实父记录的子项使用 `ON DELETE CASCADE`：

```text
meal → meal_items
workout_session → workout_session_exercises → workout_sets
meal_template → meal_template_items
```

Library 历史引用使用 `ON DELETE SET NULL` 或不物理删除。

因为历史表有 Snapshot，即使来源 Library 被停用，历史仍可读。

---

# 36. RLS 策略

所有业务表启用 RLS，但**不创建公开 Policy**。

浏览器只调用 Next.js API；服务端使用 `SUPABASE_SERVICE_ROLE_KEY`。

Private Storage 同样不公开。

---

# 37. 数据导出

未来至少支持：

- JSON 全量导出
- CSV 分类导出
- 图片单独打包

目标是保证个人数据随时可迁移。

---

# 38. 不提前设计的表

V1 不建立：

```text
users
organizations
subscriptions
payments
followers
likes
comments
social_feed
AI billing
```

未来 AI 需要时再增加：

```text
ai_insights
ai_jobs
ai_food_recognition
```

---

# 39. 推荐 Migration 顺序

```text
001_extensions.sql
002_core.sql
003_nutrition.sql
004_work.sql
005_workout.sql
006_finance.sql
007_notes_reviews.sql
008_media.sql
009_views.sql
010_indexes_rls.sql
011_seed.sql
```

第一版也可以先运行一份完整 `schema.sql`，稳定后再拆 migration。

---

# 40. V1 核心表清单

```text
01 app_profile
02 app_security
03 nutrition_goals
04 daily_logs
05 sleep_logs
06 body_measurements
07 cardio_sessions
08 food_library
09 meal_templates
10 meal_template_items
11 meals
12 meal_items
13 water_logs
14 work_sessions
15 exercise_library
16 workout_plans
17 workout_plan_days
18 workout_plan_exercises
19 workout_sessions
20 workout_session_exercises
21 workout_sets
22 expense_categories
23 expenses
24 daily_notes
25 daily_reviews
26 media_assets
```

共 **26 张核心表**。

---

# 41. Schema 核心原则

1. `record_date` 是日记系统核心字段。
2. 模板是模板，历史是历史。
3. 食品和训练必须保存 Snapshot。
4. 数据库不直接暴露给浏览器。
5. 图片只保存路径和元数据。
6. 聚合数据优先使用 View，减少冗余不一致。
7. 离线重试使用 `client_idempotency_key` 防重复。
8. 先服务单用户真实使用，不为商业化过度设计。
