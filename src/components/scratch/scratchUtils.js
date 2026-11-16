// Utilities, sound effects, mission bank, IP/device detection, and Supabase helpers

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
  win_probability: 0.25,
  prize_title: 'ของขวัญพิเศษจาก เต้ย & ต่าย 🎁',
  is_open: true,
  ip_limit: 1
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
const DEVICE_COOKIE_KEY = 'tt_scratch_dev';
const LOCAL_SETTINGS_KEY = 'tt_scratch_local_settings_v1';
const LOCAL_PLAYS_KEY = 'tt_scratch_local_plays_v1';

let cachedClientIp = '';

function readCookie(name) {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
  } catch {
    return '';
  }
}

function writeCookie(name, value) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=2592000; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie errors in restricted contexts
  }
}

/** Returns a persistent device identifier backed by both localStorage and cookie. */
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY) || readCookie(DEVICE_COOKIE_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  localStorage.setItem(DEVICE_ID_KEY, id);
  writeCookie(DEVICE_COOKIE_KEY, id);
  return id;
}

/** Returns a concise human-readable label for device OS & browser app (e.g. "iPhone • LINE"). */
export function detectDeviceInfo() {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent || '';

  let os = 'Desktop';
  if (/iPhone/i.test(ua)) os = 'iPhone';
  else if (/iPad/i.test(ua)) os = 'iPad';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'Mac';
  else if (/Windows/i.test(ua)) os = 'Windows';

  let app = 'Browser';
  if (/\bLine\//i.test(ua)) app = 'LINE';
  else if (/FBAN|FBAV|Messenger/i.test(ua)) app = 'Facebook';
  else if (/Instagram/i.test(ua)) app = 'Instagram';
  else if (/Edg/i.test(ua)) app = 'Edge';
  else if (/CriOS|Chrome/i.test(ua)) app = 'Chrome';
  else if (/Safari/i.test(ua)) app = 'Safari';

  return `${os} • ${app}`;
}

/** Fetches the public IP address quickly with a fallback endpoint (used alongside server headers). */
export async function fetchClientIp() {
  if (cachedClientIp) return cachedClientIp;

  const tryFetch = async (url, parser) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return '';
      const text = await res.text();
      return parser(text) || '';
    } catch {
      return '';
    } finally {
      clearTimeout(timer);
    }
  };

  let ip = await tryFetch('https://1.1.1.1/cdn-cgi/trace', (txt) => {
    const line = txt.split('\n').find((l) => l.startsWith('ip='));
    return line ? line.slice(3).trim() : '';
  });

  if (!ip) {
    ip = await tryFetch('https://api.ipify.org?format=json', (txt) => {
      try {
        return JSON.parse(txt).ip || '';
      } catch {
        return '';
      }
    });
  }

  if (ip) cachedClientIp = ip;
  return ip;
}

export function pickRandomMission(seedText = '') {
  const idx = seedText
    ? Math.abs([...seedText].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + Math.floor(Math.random() * 10)) % AFTER_PARTY_MISSIONS.length
    : Math.floor(Math.random() * AFTER_PARTY_MISSIONS.length);
  return AFTER_PARTY_MISSIONS[idx];
}

// ---- Web Audio Synthesizer ----
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
      ? [523.25, 659.25, 783.99, 1046.5, 1318.51]
      : [440.0, 554.37, 659.25];

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
    // Ignore restricted audio context errors
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

    const settings = settingsData ? { ...DEFAULT_SETTINGS, ...settingsData } : DEFAULT_SETTINGS;
    const needsSqlUpgrade = settingsData ? !Object.prototype.hasOwnProperty.call(settingsData, 'ip_limit') : false;

    const { data: playsData, error: playsErr } = await supabase
      .from('scratch_plays')
      .select('*')
      .eq('round_number', settings.round_number)
      .order('created_at', { ascending: false });

    if (playsErr) throw playsErr;

    return {
      isCloudSynced: true,
      needsSqlUpgrade,
      settings,
      plays: playsData || []
    };
  } catch {
    const settings = getLocalSettings();
    const allPlays = getLocalPlays();
    return {
      isCloudSynced: false,
      needsSqlUpgrade: false,
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
  const deviceInfo = detectDeviceInfo();
  const clientIp = await fetchClientIp();

  // Simulated local test card (never written to live DB)
  if (forceOutcome === 'win' || forceOutcome === 'mission') {
    const isWinner = forceOutcome === 'win';
    return {
      status: 'ok',
      card: {
        id: `test_${Date.now()}`,
        round_number: settings.round_number,
        guest_name: guestName,
        table_no: tableNo || '',
        device_id: deviceId,
        client_ip: clientIp || 'local-test',
        device_info: deviceInfo,
        is_winner: isWinner,
        win_code: isWinner ? 'WIN-TEST' : null,
        mission_text: isWinner ? null : missionPayload,
        revealed: false,
        is_demo: true,
        created_at: new Date().toISOString()
      }
    };
  }

  if (isCloudSynced) {
    try {
      const { data: v2Data, error: v2Err } = await supabase.rpc('draw_scratch_card_v2', {
        p_guest_name: guestName,
        p_table_no: tableNo || '',
        p_device_id: deviceId,
        p_mission_text: missionPayload,
        p_client_ip: clientIp || '',
        p_device_info: deviceInfo
      });

      if (!v2Err && v2Data) {
        return v2Data;
      }

      // If database still has older v1 RPC before SQL upgrade, enforce IP client-side + call v1
      if (v2Err) {
        const { data: legacyCard, error: v1Err } = await supabase.rpc('draw_scratch_card', {
          p_guest_name: guestName,
          p_table_no: tableNo || '',
          p_device_id: deviceId,
          p_mission_text: missionPayload
        });
        if (!v1Err && legacyCard) {
          return { status: 'ok', card: legacyCard };
        }
      }
    } catch {
      // Fall back cleanly if offline
    }
  }

  // Local fallback draw + IP enforcement
  const allPlays = getLocalPlays();
  const existing = allPlays.find(
    (p) => p.round_number === settings.round_number && p.device_id === deviceId
  );
  if (existing) return { status: 'ok', card: existing };

  if (!settings.is_open) return { status: 'closed' };

  const ipLimit = Number(settings.ip_limit ?? 1);
  if (ipLimit > 0 && clientIp) {
    const sameIpPlays = allPlays.filter(
      (p) => p.round_number === settings.round_number && p.client_ip === clientIp
    );
    if (sameIpPlays.length >= ipLimit) {
      const firstHolder = sameIpPlays[sameIpPlays.length - 1];
      return {
        status: 'ip_blocked',
        blocked_ip: clientIp,
        blocked_by_name: firstHolder?.guest_name || '',
        blocked_at: firstHolder?.created_at,
        ip_limit: ipLimit
      };
    }
  }

  const currentRoundPlays = allPlays.filter((p) => p.round_number === settings.round_number);
  const winnerCount = currentRoundPlays.filter((p) => p.is_winner).length;
  const isWinner = winnerCount < settings.max_winners && Math.random() < settings.win_probability;

  const newPlay = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    round_number: settings.round_number,
    guest_name: guestName,
    table_no: tableNo || '',
    device_id: deviceId,
    client_ip: clientIp || 'local',
    device_info: deviceInfo,
    is_winner: isWinner,
    win_code: isWinner ? `WIN-${String(winnerCount + 1).padStart(2, '0')}` : null,
    mission_text: isWinner ? null : missionPayload,
    revealed: false,
    created_at: new Date().toISOString()
  };

  saveLocalPlays([newPlay, ...allPlays]);
  return { status: 'ok', card: newPlay };
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

export async function deleteScratchPlay(playId, isCloudSynced) {
  if (isCloudSynced && playId && !String(playId).startsWith('local_')) {
    await supabase.from('scratch_plays').delete().eq('id', playId);
  }
  const filtered = getLocalPlays().filter((p) => p.id !== playId);
  saveLocalPlays(filtered);
}

export async function updateHostSettings(patch, isCloudSynced) {
  if (isCloudSynced) {
    const { data, error } = await supabase
      .from('scratch_settings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single();
    if (!error && data) return { ...DEFAULT_SETTINGS, ...data };
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
