-- 1. เพิ่มคอลัมน์ใหม่ในตาราง guestbook สำหรับเก็บลิงก์รูปภาพและเสียง
ALTER TABLE public.guestbook ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.guestbook ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- 2. สร้าง Bucket ใน Storage ชื่อ 'guest_media' (เปิดเป็นสาธารณะ)
INSERT INTO storage.buckets (id, name, public) VALUES ('guest_media', 'guest_media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. ตั้งค่านโยบายความปลอดภัย (Policy) ให้ทุกคนสามารถอัปโหลดไฟล์เข้า Storage ได้
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'guest_media' );

-- 4. ตั้งค่านโยบายความปลอดภัย (Policy) ให้ทุกคนสามารถดูและดาวน์โหลดไฟล์ได้
CREATE POLICY "Allow public read objects" ON storage.objects FOR SELECT USING ( bucket_id = 'guest_media' );
