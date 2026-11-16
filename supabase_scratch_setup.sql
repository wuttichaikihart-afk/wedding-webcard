-- ==========================================
-- SQL สำหรับเกมการ์ดขูด After Party (Toey & Taii)
-- รองรับ: จำกัดสิทธิ์ต่อ IP + เก็บประวัติผู้กดเข้าเล่น + กระดานพิธีกร Realtime
-- สามารถรันซ้ำทับของเดิมใน Supabase Dashboard > SQL Editor ได้อย่างปลอดภัย
-- ==========================================

-- 1. ตารางตั้งค่าเกม
CREATE TABLE IF NOT EXISTS public.scratch_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  round_number INTEGER NOT NULL DEFAULT 1,
  max_winners INTEGER NOT NULL DEFAULT 5,
  win_probability NUMERIC NOT NULL DEFAULT 0.25,
  prize_title TEXT NOT NULL DEFAULT 'ของขวัญพิเศษจาก เต้ย & ต่าย 🎁',
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  ip_limit INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scratch_settings
  ADD COLUMN IF NOT EXISTS ip_limit INTEGER NOT NULL DEFAULT 1;

INSERT INTO public.scratch_settings (id, round_number, max_winners, win_probability, prize_title, is_open, ip_limit)
VALUES (1, 1, 5, 0.25, 'ของขวัญพิเศษจาก เต้ย & ต่าย 🎁', TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- 2. ตารางเก็บผลและประวัติผู้กดเข้าเล่นทุกคน
CREATE TABLE IF NOT EXISTS public.scratch_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INTEGER NOT NULL DEFAULT 1,
  guest_name TEXT NOT NULL,
  table_no TEXT DEFAULT '',
  device_id TEXT NOT NULL,
  client_ip TEXT DEFAULT '',
  device_info TEXT DEFAULT '',
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  win_code TEXT,
  mission_text TEXT,
  revealed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scratch_plays
  ADD COLUMN IF NOT EXISTS client_ip TEXT DEFAULT '';
ALTER TABLE public.scratch_plays
  ADD COLUMN IF NOT EXISTS device_info TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_scratch_plays_round_device
  ON public.scratch_plays (round_number, device_id);

CREATE INDEX IF NOT EXISTS idx_scratch_plays_round_ip
  ON public.scratch_plays (round_number, client_ip);

-- 3. ตั้งค่า RLS Policies
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

DROP POLICY IF EXISTS "Allow public delete scratch_plays" ON public.scratch_plays;
CREATE POLICY "Allow public delete scratch_plays" ON public.scratch_plays FOR DELETE USING (true);

-- 4. ฟังก์ชันสุ่มการ์ด + จำกัด IP ฝั่งเซิร์ฟเวอร์ + กันล้นโควต้า
CREATE OR REPLACE FUNCTION public.draw_scratch_card_v2(
  p_guest_name TEXT,
  p_table_no TEXT,
  p_device_id TEXT,
  p_mission_text TEXT,
  p_client_ip TEXT DEFAULT '',
  p_device_info TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings public.scratch_settings;
  v_existing public.scratch_plays;
  v_ip_existing public.scratch_plays;
  v_headers JSONB;
  v_server_ip TEXT;
  v_effective_ip TEXT;
  v_ip_count INTEGER;
  v_winner_count INTEGER;
  v_is_winner BOOLEAN := FALSE;
  v_win_code TEXT := NULL;
  v_result public.scratch_plays;
BEGIN
  PERFORM pg_advisory_xact_lock(19122026);

  -- ดึง IP จริงจาก Header ฝั่งเซิร์ฟเวอร์ (กันปลอมแปลง) หากไม่มีใช้ค่าจาก Client
  BEGIN
    v_headers := COALESCE(NULLIF(current_setting('request.headers', true), ''), '{}')::jsonb;
  EXCEPTION WHEN OTHERS THEN
    v_headers := '{}'::jsonb;
  END;

  v_server_ip := COALESCE(
    NULLIF(TRIM(v_headers ->> 'cf-connecting-ip'), ''),
    NULLIF(TRIM(SPLIT_PART(v_headers ->> 'x-forwarded-for', ',', 1)), ''),
    NULLIF(TRIM(v_headers ->> 'x-real-ip'), '')
  );
  v_effective_ip := COALESCE(v_server_ip, NULLIF(TRIM(p_client_ip), ''), 'unknown');

  SELECT * INTO v_settings FROM public.scratch_settings WHERE id = 1;
  IF NOT FOUND THEN
    INSERT INTO public.scratch_settings (id) VALUES (1) RETURNING * INTO v_settings;
  END IF;

  -- 1) ถ้าเครื่องเดิมเคยรับการ์ดในรอบนี้แล้ว คืนการ์ดใบเดิมเสมอ (รีเฟรชไม่เสียสิทธิ์)
  SELECT * INTO v_existing
  FROM public.scratch_plays
  WHERE round_number = v_settings.round_number AND device_id = p_device_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object('status', 'ok', 'card', to_jsonb(v_existing));
  END IF;

  -- 2) ถ้าพิธีกรล็อครอบอยู่ ยังไม่ให้สร้างการ์ดใหม่
  IF NOT v_settings.is_open THEN
    RETURN jsonb_build_object('status', 'closed');
  END IF;

  -- 3) ตรวจสอบการจำกัดสิทธิ์ตาม IP (เช่น 1 คน / 1 IP ต่อรอบ)
  IF COALESCE(v_settings.ip_limit, 1) > 0 AND v_effective_ip <> 'unknown' THEN
    SELECT COUNT(*) INTO v_ip_count
    FROM public.scratch_plays
    WHERE round_number = v_settings.round_number AND client_ip = v_effective_ip;

    IF v_ip_count >= v_settings.ip_limit THEN
      SELECT * INTO v_ip_existing
      FROM public.scratch_plays
      WHERE round_number = v_settings.round_number AND client_ip = v_effective_ip
      ORDER BY created_at ASC
      LIMIT 1;

      RETURN jsonb_build_object(
        'status', 'ip_blocked',
        'blocked_ip', v_effective_ip,
        'blocked_by_name', COALESCE(v_ip_existing.guest_name, ''),
        'blocked_at', v_ip_existing.created_at,
        'ip_limit', v_settings.ip_limit
      );
    END IF;
  END IF;

  -- 4) สุ่มผลรางวัลตามโควต้า
  SELECT COUNT(*) INTO v_winner_count
  FROM public.scratch_plays
  WHERE round_number = v_settings.round_number AND is_winner = TRUE;

  IF v_winner_count < v_settings.max_winners AND random() < v_settings.win_probability THEN
    v_is_winner := TRUE;
    v_win_code := 'WIN-' || LPAD((v_winner_count + 1)::TEXT, 2, '0');
  END IF;

  INSERT INTO public.scratch_plays (
    round_number, guest_name, table_no, device_id, client_ip, device_info, is_winner, win_code, mission_text, revealed
  )
  VALUES (
    v_settings.round_number,
    p_guest_name,
    COALESCE(p_table_no, ''),
    p_device_id,
    v_effective_ip,
    COALESCE(p_device_info, ''),
    v_is_winner,
    v_win_code,
    CASE WHEN v_is_winner THEN NULL ELSE p_mission_text END,
    FALSE
  )
  RETURNING * INTO v_result;

  RETURN jsonb_build_object('status', 'ok', 'card', to_jsonb(v_result));
END;
$$;

-- 5. เปิด Realtime Sync
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
