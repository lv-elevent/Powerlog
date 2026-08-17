-- Personal Daily OS
-- PostgreSQL / Supabase Schema V1.0
-- 2026-08-17

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- App Core
-- =========================================================

CREATE TABLE IF NOT EXISTS app_profile (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  display_name text,
  sex text CHECK (sex IS NULL OR sex IN ('male', 'female', 'other')),
  birth_date date,
  height_cm numeric(6,2) CHECK (height_cm IS NULL OR height_cm > 0),
  primary_goal text,
  timezone text NOT NULL DEFAULT 'Asia/Shanghai',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_security (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  setup_completed boolean NOT NULL DEFAULT false,
  pin_hash text,
  session_version integer NOT NULL DEFAULT 1 CHECK (session_version > 0),
  auto_lock_minutes integer NOT NULL DEFAULT 43200 CHECK (auto_lock_minutes >= 0),
  failed_attempts integer NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nutrition_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  effective_from date NOT NULL,
  effective_to date,
  calories_kcal numeric(10,2) CHECK (calories_kcal IS NULL OR calories_kcal >= 0),
  protein_g numeric(10,2) CHECK (protein_g IS NULL OR protein_g >= 0),
  carbs_g numeric(10,2) CHECK (carbs_g IS NULL OR carbs_g >= 0),
  fat_g numeric(10,2) CHECK (fat_g IS NULL OR fat_g >= 0),
  fiber_g numeric(10,2) CHECK (fiber_g IS NULL OR fiber_g >= 0),
  water_ml integer CHECK (water_ml IS NULL OR water_ml >= 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL UNIQUE,
  is_closed boolean NOT NULL DEFAULT false,
  completion_score numeric(5,2) CHECK (
    completion_score IS NULL OR
    (completion_score >= 0 AND completion_score <= 100)
  ),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- Sleep / Body / Cardio
-- =========================================================

CREATE TABLE IF NOT EXISTS sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL UNIQUE,
  bedtime_at timestamptz,
  sleep_at timestamptz,
  wake_at timestamptz,
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  quality_score smallint CHECK (quality_score IS NULL OR quality_score BETWEEN 1 AND 5),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL UNIQUE,
  measured_at timestamptz,
  weight_kg numeric(7,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  body_fat_pct numeric(6,2) CHECK (
    body_fat_pct IS NULL OR
    (body_fat_pct >= 0 AND body_fat_pct <= 100)
  ),
  waist_cm numeric(7,2) CHECK (waist_cm IS NULL OR waist_cm > 0),
  chest_cm numeric(7,2) CHECK (chest_cm IS NULL OR chest_cm > 0),
  arm_cm numeric(7,2) CHECK (arm_cm IS NULL OR arm_cm > 0),
  thigh_cm numeric(7,2) CHECK (thigh_cm IS NULL OR thigh_cm > 0),
  hip_cm numeric(7,2) CHECK (hip_cm IS NULL OR hip_cm > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cardio_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  performed_at timestamptz NOT NULL DEFAULT now(),
  cardio_type text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  speed_kmh numeric(7,2) CHECK (speed_kmh IS NULL OR speed_kmh >= 0),
  incline_pct numeric(7,2) CHECK (incline_pct IS NULL OR incline_pct >= 0),
  distance_km numeric(9,3) CHECK (distance_km IS NULL OR distance_km >= 0),
  avg_heart_rate integer CHECK (avg_heart_rate IS NULL OR avg_heart_rate > 0),
  calories_estimated numeric(10,2) CHECK (
    calories_estimated IS NULL OR calories_estimated >= 0
  ),
  note text,
  client_idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- Nutrition
-- =========================================================

CREATE TABLE IF NOT EXISTS food_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  serving_name text,
  serving_weight_g numeric(10,2) CHECK (
    serving_weight_g IS NULL OR serving_weight_g > 0
  ),
  weight_basis text NOT NULL DEFAULT 'cooked'
    CHECK (weight_basis IN (
      'cooked', 'raw', 'edible_cooked', 'packaged', 'serving', 'other'
    )),
  calories_per_100g numeric(10,2) NOT NULL DEFAULT 0 CHECK (calories_per_100g >= 0),
  protein_per_100g numeric(10,2) NOT NULL DEFAULT 0 CHECK (protein_per_100g >= 0),
  carbs_per_100g numeric(10,2) NOT NULL DEFAULT 0 CHECK (carbs_per_100g >= 0),
  fat_per_100g numeric(10,2) NOT NULL DEFAULT 0 CHECK (fat_per_100g >= 0),
  fiber_per_100g numeric(10,2) NOT NULL DEFAULT 0 CHECK (fiber_per_100g >= 0),
  sodium_mg_per_100g numeric(10,2) CHECK (
    sodium_mg_per_100g IS NULL OR sodium_mg_per_100g >= 0
  ),
  barcode text,
  is_favorite boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN (
    'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'other'
  )),
  is_favorite boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
  food_id uuid NOT NULL REFERENCES food_library(id) ON DELETE RESTRICT,
  quantity_g numeric(10,2) CHECK (quantity_g IS NULL OR quantity_g > 0),
  serving_count numeric(10,2) CHECK (serving_count IS NULL OR serving_count > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (quantity_g IS NOT NULL OR serving_count IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN (
    'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'other'
  )),
  title text,
  eaten_at timestamptz NOT NULL DEFAULT now(),
  note text,
  source_template_id uuid REFERENCES meal_templates(id) ON DELETE SET NULL,
  client_idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_id uuid REFERENCES food_library(id) ON DELETE SET NULL,
  food_name_snapshot text NOT NULL,
  brand_snapshot text,
  quantity_g numeric(10,2) CHECK (quantity_g IS NULL OR quantity_g > 0),
  serving_name_snapshot text,
  serving_count numeric(10,2) CHECK (serving_count IS NULL OR serving_count > 0),
  calories_snapshot numeric(10,2) NOT NULL DEFAULT 0 CHECK (calories_snapshot >= 0),
  protein_snapshot numeric(10,2) NOT NULL DEFAULT 0 CHECK (protein_snapshot >= 0),
  carbs_snapshot numeric(10,2) NOT NULL DEFAULT 0 CHECK (carbs_snapshot >= 0),
  fat_snapshot numeric(10,2) NOT NULL DEFAULT 0 CHECK (fat_snapshot >= 0),
  fiber_snapshot numeric(10,2) NOT NULL DEFAULT 0 CHECK (fiber_snapshot >= 0),
  sodium_mg_snapshot numeric(10,2) CHECK (
    sodium_mg_snapshot IS NULL OR sodium_mg_snapshot >= 0
  ),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  amount_ml integer NOT NULL CHECK (amount_ml > 0),
  client_idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- Work / Study
-- =========================================================

CREATE TABLE IF NOT EXISTS work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  session_type text NOT NULL DEFAULT 'work'
    CHECK (session_type IN ('work', 'study', 'project', 'other')),
  title text,
  start_at timestamptz,
  end_at timestamptz,
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  did_text text,
  learned_text text,
  output_text text,
  problems_text text,
  note text,
  client_idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at IS NULL OR start_at IS NULL OR end_at >= start_at)
);

-- =========================================================
-- Workout
-- =========================================================

CREATE TABLE IF NOT EXISTS exercise_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'strength',
  primary_muscle text,
  equipment text,
  default_rest_seconds integer CHECK (
    default_rest_seconds IS NULL OR default_rest_seconds >= 0
  ),
  is_active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text NOT NULL DEFAULT 'V1',
  is_active boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, version)
);

CREATE TABLE IF NOT EXISTS workout_plan_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_code text NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL,
  estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
  is_rest_day boolean NOT NULL DEFAULT false,
  note text,
  UNIQUE (plan_id, day_code),
  UNIQUE (plan_id, sort_order)
);

CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id uuid NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercise_library(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL,
  target_sets integer NOT NULL CHECK (target_sets > 0),
  rep_min integer CHECK (rep_min IS NULL OR rep_min > 0),
  rep_max integer CHECK (rep_max IS NULL OR rep_max > 0),
  duration_min_seconds integer CHECK (duration_min_seconds IS NULL OR duration_min_seconds > 0),
  duration_max_seconds integer CHECK (duration_max_seconds IS NULL OR duration_max_seconds > 0),
  target_rir numeric(4,1) CHECK (target_rir IS NULL OR target_rir >= 0),
  rest_seconds integer NOT NULL DEFAULT 90 CHECK (rest_seconds >= 0),
  is_optional boolean NOT NULL DEFAULT false,
  note text,
  UNIQUE (plan_day_id, sort_order),
  CHECK (rep_min IS NULL OR rep_max IS NULL OR rep_max >= rep_min),
  CHECK (
    duration_min_seconds IS NULL OR duration_max_seconds IS NULL OR
    duration_max_seconds >= duration_min_seconds
  )
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  plan_id uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  plan_day_id uuid REFERENCES workout_plan_days(id) ON DELETE SET NULL,
  workout_type_snapshot text NOT NULL,
  workout_name_snapshot text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  feeling_score smallint CHECK (feeling_score IS NULL OR feeling_score BETWEEN 1 AND 5),
  note text,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  client_idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE IF NOT EXISTS workout_session_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercise_library(id) ON DELETE SET NULL,
  exercise_name_snapshot text NOT NULL,
  sort_order integer NOT NULL,
  target_sets_snapshot integer CHECK (target_sets_snapshot IS NULL OR target_sets_snapshot > 0),
  rep_min_snapshot integer CHECK (rep_min_snapshot IS NULL OR rep_min_snapshot > 0),
  rep_max_snapshot integer CHECK (rep_max_snapshot IS NULL OR rep_max_snapshot > 0),
  target_rir_snapshot numeric(4,1) CHECK (target_rir_snapshot IS NULL OR target_rir_snapshot >= 0),
  rest_seconds_snapshot integer CHECK (rest_seconds_snapshot IS NULL OR rest_seconds_snapshot >= 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, sort_order),
  CHECK (
    rep_min_snapshot IS NULL OR rep_max_snapshot IS NULL OR
    rep_max_snapshot >= rep_min_snapshot
  )
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id uuid NOT NULL REFERENCES workout_session_exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL CHECK (set_number > 0),
  set_type text NOT NULL DEFAULT 'working'
    CHECK (set_type IN ('warmup', 'working', 'drop', 'backoff', 'other')),
  weight_kg numeric(8,2) CHECK (weight_kg IS NULL OR weight_kg >= 0),
  reps integer CHECK (reps IS NULL OR reps >= 0),
  rir numeric(4,1) CHECK (rir IS NULL OR rir >= 0),
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  completed_at timestamptz,
  is_completed boolean NOT NULL DEFAULT false,
  client_idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_exercise_id, set_number, set_type)
);

-- =========================================================
-- Finance
-- =========================================================

CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  spent_at timestamptz NOT NULL DEFAULT now(),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  category_id uuid REFERENCES expense_categories(id) ON DELETE SET NULL,
  merchant text,
  note text,
  client_idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- Notes / Review
-- =========================================================

CREATE TABLE IF NOT EXISTS daily_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  noted_at timestamptz NOT NULL DEFAULT now(),
  text text NOT NULL,
  client_idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL UNIQUE,
  best_thing text,
  improvement text,
  tomorrow_priority text,
  mood_score smallint CHECK (mood_score IS NULL OR mood_score BETWEEN 1 AND 5),
  energy_score smallint CHECK (energy_score IS NULL OR energy_score BETWEEN 1 AND 5),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- Media
-- =========================================================

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  storage_bucket text NOT NULL DEFAULT 'private-media',
  storage_path text NOT NULL UNIQUE,
  media_type text NOT NULL DEFAULT 'image'
    CHECK (media_type IN ('image', 'file')),
  role text,
  original_filename text,
  mime_type text,
  size_bytes bigint CHECK (size_bytes IS NULL OR size_bytes >= 0),
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  captured_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- Views
-- =========================================================

CREATE OR REPLACE VIEW v_meal_totals AS
SELECT
  m.id AS meal_id,
  m.record_date,
  m.meal_type,
  m.eaten_at,
  COALESCE(SUM(mi.calories_snapshot), 0)::numeric(12,2) AS calories_kcal,
  COALESCE(SUM(mi.protein_snapshot), 0)::numeric(12,2) AS protein_g,
  COALESCE(SUM(mi.carbs_snapshot), 0)::numeric(12,2) AS carbs_g,
  COALESCE(SUM(mi.fat_snapshot), 0)::numeric(12,2) AS fat_g,
  COALESCE(SUM(mi.fiber_snapshot), 0)::numeric(12,2) AS fiber_g
FROM meals m
LEFT JOIN meal_items mi ON mi.meal_id = m.id
GROUP BY m.id, m.record_date, m.meal_type, m.eaten_at;

CREATE OR REPLACE VIEW v_daily_nutrition AS
SELECT
  record_date,
  COALESCE(SUM(calories_kcal), 0)::numeric(12,2) AS calories_kcal,
  COALESCE(SUM(protein_g), 0)::numeric(12,2) AS protein_g,
  COALESCE(SUM(carbs_g), 0)::numeric(12,2) AS carbs_g,
  COALESCE(SUM(fat_g), 0)::numeric(12,2) AS fat_g,
  COALESCE(SUM(fiber_g), 0)::numeric(12,2) AS fiber_g
FROM v_meal_totals
GROUP BY record_date;

CREATE OR REPLACE VIEW v_daily_water AS
SELECT
  record_date,
  COALESCE(SUM(amount_ml), 0)::bigint AS water_ml
FROM water_logs
GROUP BY record_date;

CREATE OR REPLACE VIEW v_daily_expenses AS
SELECT
  record_date,
  COALESCE(SUM(amount), 0)::numeric(14,2) AS total_expense
FROM expenses
GROUP BY record_date;

CREATE OR REPLACE VIEW v_workout_session_summary AS
SELECT
  ws.id AS session_id,
  COUNT(wset.id) FILTER (
    WHERE wset.is_completed = true AND wset.set_type = 'working'
  ) AS working_sets,
  COALESCE(
    SUM(wset.reps) FILTER (
      WHERE wset.is_completed = true AND wset.set_type = 'working'
    ), 0
  )::bigint AS total_reps,
  COALESCE(
    SUM(COALESCE(wset.weight_kg, 0) * COALESCE(wset.reps, 0)) FILTER (
      WHERE wset.is_completed = true AND wset.set_type = 'working'
    ), 0
  )::numeric(16,2) AS total_volume_kg
FROM workout_sessions ws
LEFT JOIN workout_session_exercises wse ON wse.session_id = ws.id
LEFT JOIN workout_sets wset ON wset.session_exercise_id = wse.id
GROUP BY ws.id;

-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_nutrition_goals_effective
  ON nutrition_goals(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_cardio_record_date ON cardio_sessions(record_date);
CREATE INDEX IF NOT EXISTS idx_meals_record_date ON meals(record_date);
CREATE INDEX IF NOT EXISTS idx_meals_eaten_at ON meals(eaten_at);
CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_water_record_date ON water_logs(record_date);
CREATE INDEX IF NOT EXISTS idx_work_sessions_record_date ON work_sessions(record_date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_record_date ON workout_sessions(record_date);
CREATE INDEX IF NOT EXISTS idx_workout_session_exercises_session ON workout_session_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session_exercise ON workout_sets(session_exercise_id);
CREATE INDEX IF NOT EXISTS idx_expenses_record_date ON expenses(record_date);
CREATE INDEX IF NOT EXISTS idx_expenses_spent_at ON expenses(spent_at);
CREATE INDEX IF NOT EXISTS idx_daily_notes_record_date ON daily_notes(record_date);
CREATE INDEX IF NOT EXISTS idx_media_entity ON media_assets(entity_type, entity_id);

-- =========================================================
-- updated_at triggers
-- =========================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'app_profile', 'app_security', 'daily_logs', 'sleep_logs',
    'body_measurements', 'cardio_sessions', 'food_library',
    'meal_templates', 'meals', 'work_sessions', 'exercise_library',
    'workout_plans', 'workout_sessions', 'workout_session_exercises',
    'workout_sets', 'expenses', 'daily_notes', 'daily_reviews'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- =========================================================
-- RLS: intentionally no public policies
-- =========================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'app_profile', 'app_security', 'nutrition_goals', 'daily_logs',
    'sleep_logs', 'body_measurements', 'cardio_sessions', 'food_library',
    'meal_templates', 'meal_template_items', 'meals', 'meal_items',
    'water_logs', 'work_sessions', 'exercise_library', 'workout_plans',
    'workout_plan_days', 'workout_plan_exercises', 'workout_sessions',
    'workout_session_exercises', 'workout_sets', 'expense_categories',
    'expenses', 'daily_notes', 'daily_reviews', 'media_assets'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- =========================================================
-- Seed
-- =========================================================

INSERT INTO app_profile (id, sex, height_cm, primary_goal)
VALUES (1, 'male', 173, 'body_recomposition')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_security (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_categories (name, sort_order)
VALUES
  ('餐饮', 10),
  ('交通', 20),
  ('购物', 30),
  ('娱乐', 40),
  ('健身', 50),
  ('学习', 60),
  ('其他', 70)
ON CONFLICT (name) DO NOTHING;

COMMIT;
