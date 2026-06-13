import { createClient } from '@supabase/supabase-js';

// TODO: นำ URL และ ANON KEY จากโปรเจกต์ Supabase ของคุณมาใส่ที่นี่
// หรือกำหนดในไฟล์ .env
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR-PROJECT-REF.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR-ANON-KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
