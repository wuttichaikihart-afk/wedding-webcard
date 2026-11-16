-- ==========================================
-- SQL สำหรับเกมการ์ดขูด After Party (Toey & Taii)
-- รันใน Supabase Dashboard > SQL Editor
-- ==========================================

-- 1. ตารางตั้งค่าเกม (ควบคุมรอบการเล่น, จำนวนผู้ชนะ, ของรางวัล)
CREATE TABLE IF NOT EXISTS public.scratch_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  round_number INTEGER NOT NULL DEFAULT 1,
  max_winners INTEGER NOT NULL DEFAULT 5,
  win_probability NUMERIC NOT NULL DEFAULT 0.25,
  prize_title TEXT NOT NULL DEFAULT 'ของขวัญพิเศษจาก เต้ย & ต่าย 🎁',
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.scratch_settings (id, round_number, max_winners, win_probability, prize_title, is_open)
VALUES (1, 1, 5, 0.25, 'ของขวัญพิเศษจาก เต้ย & ต่าย 🎁', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. ตารางเก็บผลผู้เล่นการ์ดขูดแต่ละรอบ
CREATE TABLE IF NOT EXISTS public.scratch_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INTEGER NOT NULL DEFAULT 1,
  guest_name TEXT NOT NULL,
  table_no TEXT DEFAULT '',
  device_id TEXT NOT NULL,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  win_code TEXT,
  mission_text TEXT,
  revealed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scratch_plays_round_device
  ON public.scratch_plays (round_number, device_id);

-- 3. เปิด RLS และสิทธิ์ให้แขกในงานเล่นได้
ALTER TABLE public.scratch_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_plays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read scratch_settings" ON public.scratch_settings;
CREATE POLICY "Allow public read scratch_settings" ON public.scratch_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update scratch_settings" ON public.scratch_settings;
CREATE POLICY "Allow public update scratch_settings" ON public.scratch_settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read scratch_plays" ON public.scratch_plays;
CREATE POLICY "Allow public read scratch_plays" ON public.scratch_plays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert scratch_plays" ON public.scratch_plays;
CREATE POLICY "Allow public insert scratch_plays" ON public.scratch_plays FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update scratch_plays" ON public.scratch_plays;
CREATE POLICY "Allow public update scratch_plays" ON public.scratch_plays FOR UPDATE USING (true);

-- 4. ฟังก์ชันสุ่มการ์ดแบบกันล้นโควต้า (Atomic Winner Allocation)
CREATE OR REPLACE FUNCTION public.draw_scratch_card(
  p_guest_name TEXT,
  p_table_no TEXT,
  p_device_id TEXT,
  p_mission_text TEXT
)
RETURNS public.scratch_plays
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings public.scratch_settings;
  v_existing public.scratch_plays;
  v_winner_count INTEGER;
  v_is_winner BOOLEAN := FALSE;
  v_win_code TEXT := NULL;
  v_result public.scratch_plays;
BEGIN
  PERFORM pg_advisory_xact_lock(19122026);

  SELECT * INTO v_settings FROM public.scratch_settings WHERE id = 1;
  IF NOT FOUND THEN
    INSERT INTO public.scratch_settings (id) VALUES (1) RETURNING * INTO v_settings;
  END IF;

  -- คืนใบเดิมถ้าเครื่องนี้เคยรับการ์ดในรอบนี้ไปแล้ว
  SELECT * INTO v_existing
  FROM public.scratch_plays
  WHERE round_number = v_settings.round_number AND device_id = p_device_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN v_existing;
  END IF;

  SELECT COUNT(*) INTO v_winner_count
  FROM public.scratch_plays
  WHERE round_number = v_settings.round_number AND is_winner = TRUE;

  IF v_winner_count < v_settings.max_winners AND random() < v_settings.win_probability THEN
    v_is_winner := TRUE;
    v_win_code := 'WIN-' || LPAD((v_winner_count + 1)::TEXT, 2, '0');
  END IF;

  INSERT INTO public.scratch_plays (
    round_number, guest_name, table_no, device_id, is_winner, win_code, mission_text, revealed
  )
  VALUES (
    v_settings.round_number,
    p_guest_name,
    COALESCE(p_table_no, ''),
    p_device_id,
    v_is_winner,
    v_win_code,
    CASE WHEN v_is_winner THEN NULL ELSE p_mission_text END,
    FALSE
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- 5. เปิด Realtime ให้กระดานผู้ชนะอัปเดตสดขึ้นจอ
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'scratch_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scratch_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'scratch_plays'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scratch_plays;
  END IF;
END $$;
