// ==========================================
// supabaseClient.js — การเชื่อมต่อฐานข้อมูล Supabase
// ==========================================
// ไฟล์นี้เป็นจุดเชื่อมต่อกับฐานข้อมูล Supabase
// ใช้โดย RSVPForm.jsx และ Guestbook.jsx
//
// ⚠️ หากต้องการเปลี่ยนโปรเจกต์ Supabase:
//    ให้แก้ค่า supabaseUrl และ supabaseAnonKey ด้านล่าง
//    ค่าเหล่านี้หาได้จาก: Supabase Dashboard > Project Settings > API
//
// ฐานข้อมูลที่ใช้งานอยู่:
//   - ตาราง "rsvps"     : เก็บข้อมูลการตอบรับจาก RSVPForm
//   - ตาราง "guestbook" : เก็บข้อความอวยพรจาก Guestbook

import { createClient } from '@supabase/supabase-js';

// ==========================================
// URL และ Key ของโปรเจกต์ Supabase
// ถ้าต้องการเปลี่ยน ให้แก้ค่าด้านล่างนี้
// หรือตั้งค่าในไฟล์ .env ก็ได้:
//   VITE_SUPABASE_URL=your-url
//   VITE_SUPABASE_ANON_KEY=your-key
// ==========================================
import config from './data/config.json';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || config.database?.supabaseUrl || 'https://vnefqflyibkbsewwfjtq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || config.database?.supabaseAnonKey || 'sb_publishable_MnbH_pjNnaJJraJR747ZUw_OLUPN1Ni';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
