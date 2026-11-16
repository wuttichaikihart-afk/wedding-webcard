// Utilities, sound effects, mission bank, and storage/Supabase helpers for Scratch & Win

import { supabase } from '../../supabaseClient';
import winnerCouplePhoto from '../../assets/pic10.jpg';
import winnerUniformPhoto from '../../assets/pic26.jpg';
import funFootballPhoto from '../../assets/pic22.jpg';
import funDatePhoto from '../../assets/pic23.jpg';
import funRingHeartPhoto from '../../assets/pic6.jpg';
import funPicnicPhoto from '../../assets/pic16.jpg';

export const DEFAULT_SETTINGS = {
  round_number: 1,
  max_winners: 5,
  win_probability: 0.3,
  prize_title: 'ของขวัญพิเศษจาก เต้ย & ต่าย 🎁',
  is_open: true
};

export const WINNER_PHOTOS = [
  { src: winnerCouplePhoto, caption: 'Toey & Taii — Glamorous Couple' },
  { src: winnerUniformPhoto, caption: 'Toey & Taii — Together Forever' }
];

export const AFTER_PARTY_MISSIONS = [
  {
    photo: funFootballPhoto,
    title: 'ภารกิจสายปาร์ตี้ 🍻',
    text: 'อดรางวัลใหญ่... แต่ต้อง "ชนแก้วฉลองกับคนข้างๆ 1 ที" แล้วตะโกน Hooray!'
  },
  {
    photo: funDatePhoto,
    title: 'ภารกิจล่าความทรงจำ 📸',
    text: 'เกือบเจอแล้ว! ไปถ่าย Photo Booth ท่ามินิฮาร์ทกับเพื่อนร่วมโต๊ะ 1 รูป'
  },
  {
    photo: funRingHeartPhoto,
    title: 'ภารกิจร้องช่วยวง 🎤',
    text: 'อีกนิดเดียว! รางวัลปลอบใจคือช่วยร้องเพลงฮุกตามวงดนตรีสดให้ดังที่สุด!'
  },
  {
    photo: funPicnicPhoto,
    title: 'ภารกิจสายแดนซ์ 💃',
    text: 'ยังไม่ได้รางวัลใหญ่! ลุกขึ้นโชว์สเต็ปเต้น 5 วินาทีเรียกเสียงปรบมือทั้งโต๊ะ'
  },
  {
    photo: funFootballPhoto,
    title: 'ภารกิจแจกความสดใส 🤍',
    text: 'ขอแสดงความเสียใจด้วยนะ... แต่ขอกอดหรือแท็กมือบ่าวสาว 1 ทีเป็นรางวัลปลอบใจ!'
  },
  {
    photo: funRingHeartPhoto,
    title: 'ภารกิจรอยยิ้มหวาน 🫰',
    text: 'ดวงความรักมาแรงแทน! หันไปยิ้มหวานให้โต๊ะข้างๆ พร้อมชู 2 นิ้ว'
  }
];

export const HOST_PIN = '1912';

const DEVICE_ID_KEY = 'tt_scratch_device_id';
const LOCAL_SETTINGS_KEY = 'tt_scratch_local_settings_v1';
const LOCAL_PLAYS_KEY = 'tt_scratch_local_plays_v1';

/** Returns or creates a persistent anonymous device identifier for anti-duplicate control. */
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function pickRandomMission(seedText = '') {
  const idx = seedText
    ? Math.abs([...seedText].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + Math.floor(Math.random() * 10)) % AFTER_PARTY_MISSIONS.length
    : Math.floor(Math.random() * AFTER_PARTY_MISSIONS.length);
  return AFTER_PARTY_MISSIONS[idx];
}

// ---- Web Audio Synthesizer (zero external files) ----
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playRevealSound(isWinner) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = isWinner
      ? [523.25, 659.25, 783.99, 1046.5, 1318.51] // C5 E5 G5 C6 E6 fanfare
      : [440.0, 554.37, 659.25]; // Gentle playful A major triad

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isWinner ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(isWinner ? 0.16 : 0.1, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + (isWinner ? 0.55 : 0.35));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + (isWinner ? 0.6 : 0.4));
    });
  } catch {
    // Ignore audio errors on restricted devices
  }
}

export function triggerHaptic(isWinner) {
  try {
    if (navigator?.vibrate) {
      navigator.vibrate(isWinner ? [60, 40, 120] : [25]);
    }
  } catch {
    // Unsupported
  }
}

// ---- Local Fallback Storage Helpers ----
export function getLocalSettings() {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveLocalSettings(next) {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(next));
}

export function getLocalPlays() {
  try {
    const raw = localStorage.getItem(LOCAL_PLAYS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalPlays(list) {
  localStorage.setItem(LOCAL_PLAYS_KEY, JSON.stringify(list));
}

// ---- Unified Supabase + Fallback Backend Adapter ----
export async function loadScratchState() {
  try {
    const { data: settingsData, error: settingsErr } = await supabase
      .from('scratch_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (settingsErr) throw settingsErr;

    const settings = settingsData || DEFAULT_SETTINGS;
    const { data: playsData, error: playsErr } = await supabase
      .from('scratch_plays')
      .select('*')
      .eq('round_number', settings.round_number)
      .order('created_at', { ascending: false });

    if (playsErr) throw playsErr;

    return {
      isCloudSynced: true,
      settings,
      plays: playsData || []
    };
  } catch {
    const settings = getLocalSettings();
    const allPlays = getLocalPlays();
    return {
      isCloudSynced: false,
      settings,
      plays: allPlays.filter((p) => p.round_number === settings.round_number)
    };
  }
}

export async function createOrFetchCard({
  guestName,
  tableNo,
  deviceId,
  forceOutcome, // 'random' | 'win' | 'mission'
  isCloudSynced,
  settings
}) {
  const mission = pickRandomMission(guestName);
  const missionPayload = JSON.stringify(mission);

  // Explicit forced test outcome (used only when user selects simulation mode)
  if (forceOutcome === 'win' || forceOutcome === 'mission') {
    const isWinner = forceOutcome === 'win';
    return {
      id: `test_${Date.now()}`,
      round_number: settings.round_number,
      guest_name: guestName,
      table_no: tableNo || '',
      device_id: deviceId,
      is_winner: isWinner,
      win_code: isWinner ? 'WIN-TEST' : null,
      mission_text: isWinner ? null : missionPayload,
      revealed: false,
      is_demo: true,
      created_at: new Date().toISOString()
    };
  }

  if (isCloudSynced) {
    try {
      const { data, error } = await supabase.rpc('draw_scratch_card', {
        p_guest_name: guestName,
        p_table_no: tableNo || '',
        p_device_id: deviceId,
        p_mission_text: missionPayload
      });
      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback to local draw if RPC unavailable
    }
  }

  // Local fallback draw
  const allPlays = getLocalPlays();
  const existing = allPlays.find(
    (p) => p.round_number === settings.round_number && p.device_id === deviceId
  );
  if (existing) return existing;

  const currentRoundPlays = allPlays.filter((p) => p.round_number === settings.round_number);
  const winnerCount = currentRoundPlays.filter((p) => p.is_winner).length;
  const isWinner = winnerCount < settings.max_winners && Math.random() < settings.win_probability;

  const newPlay = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    round_number: settings.round_number,
    guest_name: guestName,
    table_no: tableNo || '',
    device_id: deviceId,
    is_winner: isWinner,
    win_code: isWinner ? `WIN-${String(winnerCount + 1).padStart(2, '0')}` : null,
    mission_text: isWinner ? null : missionPayload,
    revealed: false,
    created_at: new Date().toISOString()
  };

  saveLocalPlays([newPlay, ...allPlays]);
  return newPlay;
}

export async function markCardRevealed(card, isCloudSynced) {
  if (!card || card.revealed || card.is_demo) return;

  if (isCloudSynced && card.id && !String(card.id).startsWith('local_')) {
    await supabase
      .from('scratch_plays')
      .update({ revealed: true })
      .eq('id', card.id);
    return;
  }

  const allPlays = getLocalPlays().map((p) =>
    p.id === card.id ? { ...p, revealed: true } : p
  );
  saveLocalPlays(allPlays);
}

export async function updateHostSettings(patch, isCloudSynced) {
  if (isCloudSynced) {
    const { data, error } = await supabase
      .from('scratch_settings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single();
    if (!error && data) return data;
  }
  const next = { ...getLocalSettings(), ...patch };
  saveLocalSettings(next);
  return next;
}

export function clearLocalDeviceCard(roundNumber, deviceId) {
  const filtered = getLocalPlays().filter(
    (p) => !(p.round_number === roundNumber && p.device_id === deviceId)
  );
  saveLocalPlays(filtered);
}
