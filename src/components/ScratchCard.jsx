// ==========================================
// ScratchCard.jsx — เกมการ์ดขูดลุ้นโชค After Party (Toey & Taii)
// ==========================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  RotateCcw,
  Camera,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import config from '../data/config.json';
import ScratchFoilCanvas from './scratch/ScratchFoilCanvas';
import ConfettiOverlay from './scratch/ConfettiOverlay';
import HostScratchModal from './scratch/HostScratchModal';
import {
  DEFAULT_SETTINGS,
  WINNER_PHOTOS,
  AFTER_PARTY_MISSIONS,
  getDeviceId,
  loadScratchState,
  createOrFetchCard,
  markCardRevealed,
  deleteScratchPlay,
  updateHostSettings,
  clearLocalDeviceCard,
  playRevealSound,
  triggerHaptic
} from './scratch/scratchUtils';

function parseMission(card) {
  if (!card?.mission_text) return AFTER_PARTY_MISSIONS[0];
  try {
    return JSON.parse(card.mission_text);
  } catch {
    return {
      photo: AFTER_PARTY_MISSIONS[0].photo,
      title: 'ภารกิจปาร์ตี้ 🍻',
      text: card.mission_text
    };
  }
}

const ScratchCard = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [plays, setPlays] = useState([]);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [needsSqlUpgrade, setNeedsSqlUpgrade] = useState(false);
  const [ipBlockedInfo, setIpBlockedInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [guestName, setGuestName] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [forceOutcome, setForceOutcome] = useState('random'); // 'random' | 'win' | 'mission'
  const [card, setCard] = useState(null);
  const [foilReady, setFoilReady] = useState(false);
  const [scratchPct, setScratchPct] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isHostParam = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('host') === '1';
  }, []);
  const [hostModalOpen, setHostModalOpen] = useState(isHostParam);
  const [drawing, setDrawing] = useState(false);
  const [testRunNonce, setTestRunNonce] = useState(0);

  const confettiTimerRef = useRef(null);
  const skipAutoRestoreRef = useRef(false);

  const baseDeviceId = useMemo(() => getDeviceId(), []);
  const deviceId = testRunNonce > 0 ? `${baseDeviceId}_test_${testRunNonce}` : baseDeviceId;

  const isLocalHost = useMemo(
    () =>
      ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('172.'),
    []
  );

  // Set page title cleanly
  useEffect(() => {
    document.title = `Scratch & Win | ${config.siteTitle || 'Wedding Toey & Taii'}`;
  }, []);

  const refreshState = useCallback(async () => {
    const state = await loadScratchState();
    setIsCloudSynced(state.isCloudSynced);
    setNeedsSqlUpgrade(Boolean(state.needsSqlUpgrade));
    setSettings(state.settings);
    setPlays(state.plays);

    // Restore guest's existing card in this round (prevents refresh cheating)
    if (!skipAutoRestoreRef.current) {
      const existing = state.plays.find(
        (p) => p.device_id === deviceId && p.round_number === state.settings.round_number
      );
      if (existing) {
        setCard(existing);
        if (existing.revealed) {
          setIsRevealed(true);
          setScratchPct(100);
        }
      }
    }
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    refreshState();
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, [refreshState]);

  // Realtime sync when Supabase tables are installed
  useEffect(() => {
    if (!isCloudSynced) return undefined;

    const channel = supabase
      .channel('public:scratch_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scratch_settings' },
        () => refreshState()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scratch_plays' },
        () => refreshState()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isCloudSynced, refreshState]);

  const handleDrawCard = async (e) => {
    e.preventDefault();
    if (!guestName.trim() || drawing) return;

    skipAutoRestoreRef.current = false;
    setIpBlockedInfo(null);
    setDrawing(true);
    setFoilReady(false);
    setScratchPct(0);
    setShowConfetti(false);

    const outcome = await createOrFetchCard({
      guestName: guestName.trim(),
      tableNo: tableNo.trim(),
      deviceId,
      forceOutcome,
      isCloudSynced,
      settings
    });

    if (outcome?.status === 'ip_blocked') {
      setIpBlockedInfo(outcome);
      setDrawing(false);
      return;
    }

    if (outcome?.status === 'closed') {
      await refreshState();
      setDrawing(false);
      return;
    }

    const newCard = outcome?.card || outcome;
    if (newCard) {
      setCard(newCard);
      setIsRevealed(Boolean(newCard.revealed));
      if (!newCard.is_demo) {
        await refreshState();
      }
    }
    setDrawing(false);
  };

  const handleDeletePlay = async (playId) => {
    await deleteScratchPlay(playId, isCloudSynced);
    if (card?.id === playId) {
      setCard(null);
      setIsRevealed(false);
      setFoilReady(false);
      setScratchPct(0);
    }
    setIpBlockedInfo(null);
    await refreshState();
  };

  const handleReveal = useCallback(async () => {
    if (isRevealed) return;
    setIsRevealed(true);
    setScratchPct(100);

    const isWinner = Boolean(card?.is_winner);
    if (soundEnabled) playRevealSound(isWinner);
    triggerHaptic(isWinner);

    if (isWinner) {
      setShowConfetti(true);
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 5000);
    }

    await markCardRevealed(card, isCloudSynced);
    setCard((prev) => (prev ? { ...prev, revealed: true } : prev));
    if (!card?.is_demo) {
      refreshState();
    }
  }, [isRevealed, card, soundEnabled, isCloudSynced, refreshState]);

  const handleTryAgainTest = () => {
    skipAutoRestoreRef.current = true;
    clearLocalDeviceCard(settings.round_number, deviceId);
    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    setCard(null);
    setIsRevealed(false);
    setFoilReady(false);
    setScratchPct(0);
    setShowConfetti(false);
    setTestRunNonce((n) => n + 1);
  };

  const handleHostUpdateSettings = async (patch) => {
    const updated = await updateHostSettings(patch, isCloudSynced);
    setSettings(updated);
    if (patch.round_number && patch.round_number !== settings.round_number) {
      setCard(null);
      setIsRevealed(false);
      setFoilReady(false);
      setScratchPct(0);
      setShowConfetti(false);
    }
    refreshState();
  };

  const winnerPhoto = useMemo(() => {
    const idx = card?.win_code?.endsWith('2') ? 1 : 0;
    return WINNER_PHOTOS[idx % WINNER_PHOTOS.length];
  }, [card?.win_code]);

  const mission = useMemo(() => parseMission(card), [card]);
  const winnersSoFar = plays.filter((p) => p.is_winner).length;
  const remainingPrizes = Math.max(0, (settings.max_winners || 5) - winnersSoFar);
  const canShowTestTools = !isCloudSynced || isLocalHost || Boolean(card?.is_demo);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'radial-gradient(circle at top, #fff8fa 0%, #fdeef2 55%, #f9dce4 100%)',
        fontFamily: 'var(--font-body)',
        color: '#4a3038',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom, 20px))',
        overflowX: 'hidden'
      }}
    >
      <ConfettiOverlay active={showConfetti} />

      {/* Top Navigation Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          maxWidth: '540px',
          margin: '0 auto',
          padding: '14px 16px 8px'
        }}
      >
        <a
          href="/"
          style={{
            minHeight: '44px',
            padding: '0 14px',
            borderRadius: '22px',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            border: '1px solid #f0c4cf',
            color: '#c46d82',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(196, 109, 130, 0.08)'
          }}
        >
          <ArrowLeft size={16} /> กลับการ์ดเชิญ
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-label={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              border: '1px solid #f0c4cf',
              color: '#c46d82',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {isHostParam && (
            <button
              type="button"
              onClick={() => setHostModalOpen(true)}
              style={{
                minHeight: '44px',
                padding: '0 14px',
                borderRadius: '22px',
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                border: '1px solid #f0c4cf',
                color: '#4a3038',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <SlidersHorizontal size={15} color="#c46d82" /> พิธีกร/รางวัล
            </button>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: '460px', margin: '0 auto', padding: '10px 16px' }}>
        {/* Header Crest */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: '#c46d82',
              fontWeight: 700,
              backgroundColor: '#ffffff',
              padding: '5px 14px',
              borderRadius: '20px',
              border: '1px solid #f0c4cf',
              marginBottom: '8px'
            }}
          >
            ✨ After Party • Scratch &amp; Win ✨
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
              color: '#c46d82',
              margin: '0 0 6px',
              textWrap: 'balance'
            }}
          >
            การ์ดขูดลุ้นโชค {config.hero?.name1 || 'Toey'} &amp; {config.hero?.name2 || 'Taii'}
          </h1>
          <p style={{ fontSize: '0.94rem', color: '#6b4f57', margin: 0, textWrap: 'pretty' }}>
            ขูดเจอภาพคู่ <strong>เจ้าบ่าว &amp; เจ้าสาว</strong> รับของรางวัลสุดพิเศษหน้าเวที!
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#c46d82', fontWeight: 500 }}>
            ⏳ กำลังเตรียมการ์ดขูดมงคลให้คุณ...
          </div>
        ) : !settings.is_open && !card ? (
          /* Locked Waiting State for Synchronized Countdown */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '36px 24px',
              textAlign: 'center',
              border: '2px solid #f0c4cf',
              boxShadow: '0 16px 40px rgba(196, 109, 130, 0.16)'
            }}
          >
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#fce8ed',
              color: '#c46d82',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Clock size={34} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem', color: '#4a3038', marginBottom: '10px' }}>
              เตรียมมือถือให้พร้อม! 🍀
            </h2>
            <p style={{ color: '#6b4f57', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              รอสัญญาณจากพิธีกรบนเวทีเพื่อนับถอยหลังเปิดขูดพร้อมกันทั้งห้องนะครับ
            </p>
          </motion.div>
        ) : ipBlockedInfo ? (
          /* IP Blocked Notice (1 Person / 1 IP Limit) */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '30px 22px',
              textAlign: 'center',
              border: '2px solid #fecdd3',
              boxShadow: '0 16px 40px rgba(225, 29, 72, 0.12)'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <ShieldAlert size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.22rem', color: '#881337', margin: '0 0 8px' }}>
              เครือข่าย (IP) นี้ใช้สิทธิ์ขูดครบแล้ว
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#4a3038', lineHeight: 1.6, margin: '0 0 12px' }}>
              รอบนี้จำกัด <strong>1 คน / 1 สิทธิ์ (IP: {ipBlockedInfo.blocked_ip})</strong>
              {ipBlockedInfo.blocked_by_name && (
                <>
                  <br />
                  ใช้สิทธิ์แล้วโดยคุณ: <strong style={{ color: '#c46d82' }}>{ipBlockedInfo.blocked_by_name}</strong>
                </>
              )}
            </p>
            <div style={{
              backgroundColor: '#fff5f7',
              borderRadius: '14px',
              padding: '12px 14px',
              fontSize: '0.84rem',
              color: '#6b4f57',
              lineHeight: 1.55,
              border: '1px dashed #f0c4cf',
              marginBottom: '18px'
            }}>
              💡 <strong>กรณีมาด้วยกันและเกาะ Wi-Fi เดียวกัน:</strong><br />
              กรุณา<strong>ปิด Wi-Fi</strong> แล้วเปลี่ยนมาใช้เน็ตมือถือ (4G/5G) ของตัวเอง จากนั้นกดปุ่มลองใหม่ด้านล่างได้เลยครับ
            </div>
            <button
              type="button"
              onClick={() => setIpBlockedInfo(null)}
              style={{
                width: '100%',
                minHeight: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.98rem',
                cursor: 'pointer'
              }}
            >
              🔄 ลองใหม่อีกครั้ง
            </button>
          </motion.div>
        ) : !card ? (
          /* STEP 1: GUEST ENTRY FORM */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '26px 22px',
              border: '1.5px solid #f0c4cf',
              boxShadow: '0 18px 45px rgba(196, 109, 130, 0.16)'
            }}
          >
            {/* Status & Prize Pill */}
            <div
              style={{
                backgroundColor: '#fff5f7',
                border: '1px dashed #e8a8b8',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="#d4af37" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#4a3038' }}>
                  {settings.prize_title}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#c46d82',
                  backgroundColor: '#fff',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid #f0c4cf'
                }}
              >
                รอบ {settings.round_number} • เหลือ {remainingPrizes} รางวัล
              </span>
            </div>

            <form onSubmit={handleDrawCard}>
              <div style={{ marginBottom: '14px' }}>
                <label
                  htmlFor="scratch-guest-name"
                  style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, marginBottom: '6px', color: '#4a3038' }}
                >
                  ชื่อเล่น / ชื่อของคุณ *
                </label>
                <input
                  id="scratch-guest-name"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="เช่น น้องพลอย / ป๊อบเพื่อนเจ้าบ่าว"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '2px solid #f0c4cf',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="scratch-table-no"
                  style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '6px', color: '#6b4f57' }}
                >
                  เลขโต๊ะ หรือ กลุ่มเพื่อน (ถ้ามี)
                </label>
                <input
                  id="scratch-table-no"
                  type="text"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  placeholder="เช่น โต๊ะ 5 (ไม่ใส่ก็ได้)"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1.5px solid #f5dce2',
                    fontSize: '0.98rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Host / Developer Quick Simulation Switcher */}
              {canShowTestTools && (
                <div
                  style={{
                    backgroundColor: '#fdf8fa',
                    borderRadius: '14px',
                    padding: '10px 12px',
                    marginBottom: '18px',
                    border: '1px solid #f0c4cf'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9c7d85', marginBottom: '8px' }}>
                    🧪 โหมดทดลองเล่น (เลือกเทสผลลัพธ์ได้ทันที):
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'random', label: '🎲 สุ่มจริง' },
                      { id: 'win', label: '🏆 ลองใบชนะ' },
                      { id: 'mission', label: '🍻 ลองใบภารกิจ' }
                    ].map((opt) => {
                      const active = forceOutcome === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setForceOutcome(opt.id)}
                          style={{
                            flex: '1 1 auto',
                            minHeight: '44px',
                            padding: '6px 10px',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: active ? 700 : 500,
                            border: active ? '1.5px solid #c46d82' : '1px solid #e5d0d5',
                            backgroundColor: active ? '#fce8ed' : '#ffffff',
                            color: active ? '#c46d82' : '#6b4f57',
                            cursor: 'pointer'
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!guestName.trim() || drawing}
                style={{
                  width: '100%',
                  minHeight: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)',
                  color: '#ffffff',
                  fontSize: '1.08rem',
                  fontWeight: 700,
                  cursor: guestName.trim() ? 'pointer' : 'not-allowed',
                  opacity: guestName.trim() ? 1 : 0.55,
                  boxShadow: '0 8px 24px rgba(196, 109, 130, 0.35)',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)'
                }}
              >
                {drawing ? '⏳ กำลังออกการ์ด...' : '🎫 รับการ์ดขูดลุ้นโชคเลย!'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9c7d85', margin: '12px 0 0', lineHeight: 1.45 }}>
                {settings.ip_limit === 1
                  ? '🔒 จำกัดสิทธิ์ 1 คน / 1 เครื่อง / 1 IP เท่านั้น (แนะนำให้ใช้เน็ต 4G/5G ส่วนตัว)'
                  : '🔒 จำกัดสิทธิ์ 1 เครื่อง ต่อ 1 ครั้งในแต่ละรอบ'}
              </p>
            </form>
          </motion.div>
        ) : (
          /* STEP 2: INTERACTIVE LUXURY SCRATCH CARD */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '26px',
              padding: '18px',
              border: '2px solid #e8c589',
              boxShadow: '0 20px 50px rgba(196, 109, 130, 0.22)'
            }}
          >
            {/* Card Stub Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                paddingBottom: '12px',
                marginBottom: '12px',
                borderBottom: '1.5px dashed #f0c4cf',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', letterSpacing: '1.5px', color: '#c59b52', fontWeight: 700 }}>
                  ROUND #{card.round_number} • LUCKY TICKET
                </div>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#4a3038' }}>
                  บัตรของ: <span style={{ color: '#c46d82' }}>{card.guest_name}</span>
                  {card.table_no && (
                    <span style={{ fontSize: '0.84rem', fontWeight: 500, color: '#88686e', marginLeft: '6px' }}>
                      ({card.table_no})
                    </span>
                  )}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-cursive)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#c46d82',
                  backgroundColor: '#fff5f7',
                  padding: '4px 12px',
                  borderRadius: '14px',
                  border: '1px solid #f0c4cf'
                }}
              >
                T&amp;T
              </span>
            </div>

            {/* Scratch Window */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '350px',
                borderRadius: '18px',
                overflow: 'hidden',
                backgroundColor: '#fff9fb',
                border: '2px solid #f5dce2'
              }}
            >
              {/* Hidden Result Layer (Rendered only once foilReady prevents spoiler flash) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  opacity: foilReady || isRevealed ? 1 : 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  textAlign: 'center',
                  background: card.is_winner
                    ? 'radial-gradient(circle, #fffdf5 0%, #fef3c7 55%, #fde68a 100%)'
                    : 'radial-gradient(circle, #ffffff 0%, #fff1f4 100%)'
                }}
              >
                {card.is_winner ? (
                  <>
                    <div
                      style={{
                        backgroundColor: '#d4af37',
                        color: '#fff',
                        padding: '4px 14px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        marginBottom: '10px',
                        boxShadow: '0 3px 10px rgba(212, 175, 55, 0.4)'
                      }}
                    >
                      👑 BINGO! เจอหน้า เต้ย &amp; ต่าย แล้ว!
                    </div>
                    <div
                      style={{
                        width: '175px',
                        height: '175px',
                        borderRadius: '50%',
                        padding: '5px',
                        background: 'linear-gradient(135deg, #f6e2b3, #d4af37, #e8a8b8)',
                        boxShadow: '0 10px 26px rgba(196, 109, 130, 0.28)',
                        marginBottom: '10px'
                      }}
                    >
                      <img
                        src={winnerPhoto.src}
                        alt="คู่บ่าวสาว เต้ย และ ต่าย"
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          objectPosition: 'center 20%',
                          border: '3px solid #ffffff',
                          display: 'block'
                        }}
                      />
                    </div>
                    <h2
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#92400e',
                        margin: '0 0 4px'
                      }}
                    >
                      🎉 ยินดีด้วย! คุณคือผู้ชนะ!
                    </h2>
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #d4af37',
                        borderRadius: '10px',
                        padding: '4px 14px',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: '#b45309'
                      }}
                    >
                      รหัสรับรางวัล: {card.win_code || 'WIN-01'}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        backgroundColor: '#fce8ed',
                        color: '#c46d82',
                        padding: '4px 14px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        marginBottom: '10px',
                        border: '1px solid #f0c4cf'
                      }}
                    >
                      {mission.title}
                    </div>
                    <div
                      style={{
                        width: '148px',
                        height: '148px',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        border: '3px solid #ffffff',
                        boxShadow: '0 8px 20px rgba(196, 109, 130, 0.2)',
                        marginBottom: '12px'
                      }}
                    >
                      <img
                        src={mission.photo}
                        alt="ภาพบ่าวสาวน่ารัก"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center 20%',
                          display: 'block'
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: 600,
                        color: '#4a3038',
                        lineHeight: 1.5,
                        margin: 0,
                        maxWidth: '280px'
                      }}
                    >
                      {mission.text}
                    </p>
                  </>
                )}
              </div>

              {/* Interactive Metallic Foil Canvas */}
              <ScratchFoilCanvas
                isRevealed={isRevealed}
                onProgress={setScratchPct}
                onReveal={handleReveal}
                onReady={() => setFoilReady(true)}
              />
            </div>

            {/* Footer Controls under Card */}
            <div style={{ marginTop: '14px' }}>
              {!isRevealed ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#88686e', marginBottom: '6px' }}>
                    <span>ความคืบหน้าการขูด</span>
                    <span style={{ fontWeight: 700, color: '#c46d82' }}>{scratchPct}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#fce8ed',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (scratchPct / 50) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #e8a8b8, #d4af37)',
                        transition: 'width 0.15s ease'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleReveal}
                    style={{
                      width: '100%',
                      minHeight: '46px',
                      borderRadius: '14px',
                      backgroundColor: '#fff5f7',
                      border: '1.5px solid #e8a8b8',
                      color: '#c46d82',
                      fontWeight: 600,
                      fontSize: '0.94rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={16} /> แตะเพื่อเปิดฟอยล์ทั้งหมดเลย
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                  >
                    {card.is_winner ? (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '14px',
                          backgroundColor: '#fef3c7',
                          border: '1.5px solid #f59e0b',
                          color: '#92400e',
                          fontSize: '0.9rem',
                          textAlign: 'center',
                          fontWeight: 600,
                          lineHeight: 1.5
                        }}
                      >
                        🎁 โชว์หน้าจอนี้ให้พิธีกรที่หน้าเวทีเพื่อรับรางวัล:<br />
                        <strong>{settings.prize_title}</strong>
                      </div>
                    ) : (
                      <a
                        href="/photobooth"
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.96rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          textDecoration: 'none',
                          boxShadow: '0 6px 18px rgba(196, 109, 130, 0.25)'
                        }}
                      >
                        <Camera size={18} /> ไปถ่าย Photo Booth เก็บภาพสนุกๆ กัน!
                      </a>
                    )}

                    {canShowTestTools && (
                      <button
                        type="button"
                        onClick={handleTryAgainTest}
                        style={{
                          width: '100%',
                          minHeight: '46px',
                          borderRadius: '14px',
                          backgroundColor: '#fff',
                          border: '1.5px solid #f0c4cf',
                          color: '#6b4f57',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCcw size={16} /> ลองขูดใบใหม่อีกครั้ง (โหมดทดสอบ)
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <HostScratchModal
        isOpen={hostModalOpen}
        onClose={() => setHostModalOpen(false)}
        settings={settings}
        plays={plays}
        isCloudSynced={isCloudSynced}
        needsSqlUpgrade={needsSqlUpgrade}
        onUpdateSettings={handleHostUpdateSettings}
        onDeletePlay={handleDeletePlay}
        onResetLocalTest={handleTryAgainTest}
      />
    </div>
  );
};

export default ScratchCard;
