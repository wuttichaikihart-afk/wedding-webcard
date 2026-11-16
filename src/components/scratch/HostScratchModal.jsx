import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trophy,
  RefreshCw,
  Copy,
  Check,
  Lock,
  Sparkles,
  Database,
  Users,
  Search,
  Trash2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { HOST_PIN } from './scratchUtils';

function formatThaiTime(isoString) {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return '-';
  }
}

/**
 * Host & MC control modal:
 * - Full live log of every guest who clicked into the scratch game (with IP & device info)
 * - Winner leaderboard for stage display
 * - IP restriction limit & round management
 */
const HostScratchModal = ({
  isOpen,
  onClose,
  settings,
  plays,
  isCloudSynced,
  needsSqlUpgrade,
  onUpdateSettings,
  onDeletePlay,
  onResetLocalTest
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [prevSettings, setPrevSettings] = useState(settings);
  const [draft, setDraft] = useState(settings);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saving, setSaving] = useState(false);

  // Player list filter state
  const [activeView, setActiveView] = useState('players'); // 'players' | 'settings'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'winners' | 'pending'
  const [searchTerm, setSearchTerm] = useState('');

  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setDraft(settings);
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const ipCounts = useMemo(() => {
    const counts = {};
    for (const p of plays) {
      if (p.client_ip && p.client_ip !== 'unknown') {
        counts[p.client_ip] = (counts[p.client_ip] || 0) + 1;
      }
    }
    return counts;
  }, [plays]);

  const filteredPlays = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return plays.filter((p) => {
      if (filterMode === 'winners' && !p.is_winner) return false;
      if (filterMode === 'pending' && p.revealed) return false;
      if (!q) return true;
      return (
        (p.guest_name || '').toLowerCase().includes(q) ||
        (p.table_no || '').toLowerCase().includes(q) ||
        (p.client_ip || '').toLowerCase().includes(q) ||
        (p.win_code || '').toLowerCase().includes(q)
      );
    });
  }, [plays, filterMode, searchTerm]);

  if (!isOpen) return null;

  const isLocalHost =
    ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('172.');

  const winners = plays.filter((p) => p.is_winner);
  const revealedCount = plays.filter((p) => p.revealed).length;
  const uniqueIpCount = Object.keys(ipCounts).length;
  const scratchUrl = `${window.location.origin}/scratch`;

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput.trim() === HOST_PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await onUpdateSettings({
      max_winners: Math.max(1, Number(draft.max_winners) || 1),
      win_probability: Math.min(1, Math.max(0.05, Number(draft.win_probability) || 0.25)),
      prize_title: draft.prize_title || 'ของขวัญพิเศษจาก เต้ย & ต่าย 🎁',
      is_open: Boolean(draft.is_open),
      ip_limit: Number(draft.ip_limit ?? 1)
    });
    setSaving(false);
  };

  const handleNextRound = async () => {
    if (!window.confirm(`เริ่มเกมรอบที่ ${(settings.round_number || 1) + 1} ใช่ไหมครับ?\nแขกทุกคนจะสามารถรับการ์ดขูดใบใหม่ได้อีกครั้ง`)) {
      return;
    }
    setSaving(true);
    await onUpdateSettings({
      round_number: (settings.round_number || 1) + 1,
      is_open: true
    });
    onResetLocalTest?.();
    setSaving(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scratchUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="แผงควบคุมสำหรับบ่าวสาวและพิธีกร"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(40, 20, 28, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '2px solid #f0c4cf',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          padding: '22px',
          position: 'relative',
          fontFamily: 'var(--font-body)'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่างควบคุม"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#fdf0f4',
            color: '#c46d82',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {!unlocked ? (
          <form onSubmit={handleUnlock} style={{ textAlign: 'center', padding: '18px 8px' }}>
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: '#fce8ed',
              color: '#c46d82',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <Lock size={26} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.35rem', color: '#4a3038', marginBottom: '6px' }}>
              โหมดบ่าวสาว &amp; พิธีกร
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#88686e', marginBottom: '18px' }}>
              ใส่รหัส PIN 4 หลักเพื่อดูรายชื่อผู้เข้าเล่นและตั้งค่ารางวัล
              {isLocalHost && (
                <span style={{ display: 'block', marginTop: '4px', color: '#c46d82', fontWeight: 600 }}>
                  (รหัสทดสอบในเครื่อง: 1912)
                </span>
              )}
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="กรอก PIN..."
              style={{
                width: '180px',
                minHeight: '48px',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '6px',
                borderRadius: '12px',
                border: pinError ? '2px solid #e11d48' : '2px solid #f0c4cf',
                marginBottom: '12px',
                outline: 'none'
              }}
            />
            {pinError && (
              <p style={{ color: '#e11d48', fontSize: '0.85rem', marginBottom: '10px' }}>
                รหัส PIN ไม่ถูกต้องครับ
              </p>
            )}
            <div>
              <button
                type="submit"
                style={{
                  minHeight: '48px',
                  padding: '0 28px',
                  borderRadius: '25px',
                  background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                เข้าสู่แผงควบคุม
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingRight: '40px' }}>
              <Trophy size={24} color="#c46d82" />
              <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem', color: '#4a3038', margin: 0 }}>
                ควบคุมเกมการ์ดขูด (รอบที่ {settings.round_number})
              </h2>
            </div>

            {/* Connection & Upgrade Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '10px',
              marginBottom: '14px',
              fontSize: '0.8rem',
              backgroundColor: !isCloudSynced || needsSqlUpgrade ? '#fff7ed' : '#ecfdf5',
              color: !isCloudSynced || needsSqlUpgrade ? '#9a3412' : '#065f46',
              border: `1px solid ${!isCloudSynced || needsSqlUpgrade ? '#fed7aa' : '#a7f3d0'}`
            }}>
              {needsSqlUpgrade ? <AlertTriangle size={16} /> : <Database size={16} />}
              {needsSqlUpgrade ? (
                <span>กรุณารันไฟล์ <code>supabase_scratch_setup.sql</code> เวอร์ชั่นอัปเดตใน Supabase เพื่อเปิดใช้ตัวล็อค IP และบันทึก IP</span>
              ) : isCloudSynced ? (
                <span>เชื่อมต่อ Supabase Realtime แล้ว — ซิงค์ผู้เข้าเล่นและล็อค 1 IP / {settings.ip_limit > 0 ? `${settings.ip_limit} สิทธิ์` : 'ไม่จำกัด'}</span>
              ) : (
                <span>โหมดทดสอบในเครื่อง (localStorage)</span>
              )}
            </div>

            {/* Live Summary Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))',
              gap: '8px',
              marginBottom: '14px'
            }}>
              <div style={{ backgroundColor: '#fff5f7', borderRadius: '12px', padding: '10px 12px', border: '1px solid #f0c4cf' }}>
                <div style={{ fontSize: '0.75rem', color: '#88686e' }}>👥 กดเข้ามาเล่นแล้ว</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4a3038' }}>{plays.length} คน</div>
              </div>
              <div style={{ backgroundColor: '#fefce8', borderRadius: '12px', padding: '10px 12px', border: '1px solid #fde047' }}>
                <div style={{ fontSize: '0.75rem', color: '#854d0e' }}>🏆 ขูดเจอผู้ชนะ</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a16207' }}>
                  {winners.length} / {settings.max_winners}
                </div>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '10px 12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534' }}>✨ เปิดดูผลแล้ว</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>
                  {revealedCount} / {plays.length}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>🌐 IP ไม่ซ้ำกัน</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>{uniqueIpCount} IP</div>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setActiveView('players')}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: activeView === 'players' ? '#c46d82' : '#fdf0f4',
                  color: activeView === 'players' ? '#fff' : '#4a3038',
                  border: '1px solid #f0c4cf'
                }}
              >
                <Users size={16} /> รายชื่อผู้กดเข้าเล่น ({plays.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveView('settings')}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: activeView === 'settings' ? '#c46d82' : '#fdf0f4',
                  color: activeView === 'settings' ? '#fff' : '#4a3038',
                  border: '1px solid #f0c4cf'
                }}
              >
                <ShieldCheck size={16} /> ตั้งค่ารางวัล &amp; ล็อค IP
              </button>
            </div>

            {activeView === 'players' ? (
              <div>
                {/* Search & Filter Controls */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: '1 1 180px' }}>
                    <Search size={16} color="#9c7d85" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ค้นหาชื่อ, โต๊ะ, IP หรือรหัส WIN..."
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '8px 12px 8px 36px',
                        borderRadius: '10px',
                        border: '1px solid #f0c4cf',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'all', label: 'ทั้งหมด' },
                      { id: 'winners', label: `🏆 ชนะ (${winners.length})` },
                      { id: 'pending', label: '⏳ กำลังขูด' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterMode(tab.id)}
                        style={{
                          minHeight: '44px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          border: '1px solid #f0c4cf',
                          backgroundColor: filterMode === tab.id ? '#fce8ed' : '#fff',
                          color: filterMode === tab.id ? '#c46d82' : '#6b4f57'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Players List */}
                <div style={{
                  maxHeight: '360px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '2px'
                }}>
                  {filteredPlays.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '28px 12px',
                      color: '#9c7d85',
                      fontSize: '0.9rem',
                      backgroundColor: '#fff9fb',
                      borderRadius: '14px',
                      border: '1px dashed #f0c4cf'
                    }}>
                      ยังไม่มีรายการที่ตรงกับตัวกรองในรอบนี้ ✨
                    </div>
                  ) : (
                    filteredPlays.map((p) => {
                      const sameIpTotal = p.client_ip ? ipCounts[p.client_ip] || 1 : 0;
                      const isDupIp = sameIpTotal > 1;
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '14px',
                            backgroundColor: p.is_winner ? '#fffdf5' : '#ffffff',
                            border: p.is_winner ? '1.5px solid #d4af37' : '1px solid #f0d7de'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <strong style={{ color: '#4a3038', fontSize: '0.96rem' }}>
                                {p.guest_name}
                              </strong>
                              {p.table_no && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: '#fdf0f4',
                                  color: '#c46d82',
                                  padding: '2px 8px',
                                  borderRadius: '8px',
                                  fontWeight: 600
                                }}>
                                  {p.table_no}
                                </span>
                              )}
                              {p.is_winner && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #f59e0b',
                                  padding: '2px 8px',
                                  borderRadius: '8px',
                                  fontWeight: 700
                                }}>
                                  🏆 {p.win_code}
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '0.76rem', color: '#6b4f57', marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              <span>🕒 {formatThaiTime(p.created_at)}</span>
                              {p.client_ip && (
                                <span>
                                  🌐 {p.client_ip}
                                  {isDupIp && (
                                    <strong style={{ color: '#dc2626', marginLeft: '4px' }}>
                                      (IP ซ้ำ {sameIpTotal} ครั้ง)
                                    </strong>
                                  )}
                                </span>
                              )}
                              {p.device_info && <span>📱 {p.device_info}</span>}
                            </div>

                            <div style={{ fontSize: '0.76rem', marginTop: '2px', fontWeight: 600, color: p.revealed ? (p.is_winner ? '#b45309' : '#059669') : '#d97706' }}>
                              {!p.revealed
                                ? '⏳ กดเข้าเล่นแล้ว (กำลังขูดฟอยล์...)'
                                : p.is_winner
                                  ? '✅ ขูดเปิดเจอหน้าคู่แล้ว!'
                                  : '🍻 ขูดเปิดแล้ว (ได้ใบภารกิจ)'}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`ต้องการลบรายการของ "${p.guest_name}" เพื่อให้สามารถรับสิทธิ์ใหม่ได้ใช่ไหมครับ?`)) {
                                onDeletePlay(p.id);
                              }
                            }}
                            title="ลบรายการนี้ (ปลดล็อคสิทธิ์)"
                            aria-label={`ลบรายการของ ${p.guest_name}`}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#fff1f2',
                              color: '#e11d48',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* Settings Tab */
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#4a3038', marginBottom: '4px' }}>
                      🔒 การจำกัดสิทธิ์ต่อ 1 IP Address:
                    </label>
                    <select
                      value={draft.ip_limit ?? 1}
                      onChange={(e) => setDraft({ ...draft, ip_limit: Number(e.target.value) })}
                      style={{ width: '100%', minHeight: '44px', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f0c4cf', fontSize: '0.92rem', backgroundColor: '#fff' }}
                    >
                      <option value={1}>🔒 เข้มงวด: 1 IP ขูดได้ 1 ครั้งเท่านั้น (กันเปิด Incognito / สลับเบราว์เซอร์)</option>
                      <option value={2}>👥 1 IP ขูดได้สูงสุด 2 ครั้ง (กรณีมาเป็นคู่/ใช้ Wi-Fi ร่วมกัน)</option>
                      <option value={5}>👨‍👩‍👧‍👦 1 IP ขูดได้สูงสุด 5 ครั้ง (แชร์ Hotspot)</option>
                      <option value={0}>🌐 ไม่จำกัด IP (ใช้ล็อคเครื่องแทน — กรณีแขกทั้งงานใช้ Wi-Fi เดียวกัน)</option>
                    </select>
                    <p style={{ fontSize: '0.76rem', color: '#88686e', margin: '4px 0 0' }}>
                      💡 หากตั้งเป็น 1 ครั้งต่อ IP แนะนำให้แขกใช้เน็ตมือถือ 4G/5G ของตัวเองแทน Wi-Fi กลางของสถานที่ครับ
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#4a3038', marginBottom: '4px' }}>
                      🎁 ชื่อของรางวัลรอบนี้:
                    </label>
                    <input
                      type="text"
                      value={draft.prize_title}
                      onChange={(e) => setDraft({ ...draft, prize_title: e.target.value })}
                      style={{ width: '100%', minHeight: '44px', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f0c4cf', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a3038', marginBottom: '4px' }}>
                        จำนวนผู้ชนะสูงสุด (คน):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={draft.max_winners}
                        onChange={(e) => setDraft({ ...draft, max_winners: e.target.value })}
                        style={{ width: '100%', minHeight: '44px', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f0c4cf', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a3038', marginBottom: '4px' }}>
                        โอกาสออกหน้าคู่:
                      </label>
                      <select
                        value={draft.win_probability}
                        onChange={(e) => setDraft({ ...draft, win_probability: Number(e.target.value) })}
                        style={{ width: '100%', minHeight: '44px', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f0c4cf', fontSize: '0.95rem', backgroundColor: '#fff' }}
                      >
                        <option value={0.1}>10% (คนเยอะ ~100 คน)</option>
                        <option value={0.2}>20% (ปานกลาง)</option>
                        <option value={0.25}>25% (แนะนำ)</option>
                        <option value={0.5}>50% (ออกไว ลุ้นสนุก)</option>
                        <option value={1}>100% (แจกทันทีจนครบโควต้า)</option>
                      </select>
                    </div>
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: '44px',
                    padding: '8px 12px',
                    backgroundColor: '#fdf8fa',
                    borderRadius: '10px',
                    border: '1px solid #f0c4cf',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={Boolean(draft.is_open)}
                      onChange={(e) => setDraft({ ...draft, is_open: e.target.checked })}
                      style={{ width: '20px', height: '20px', accentColor: '#c46d82' }}
                    />
                    <span style={{ fontSize: '0.92rem', color: '#4a3038', fontWeight: 500 }}>
                      {draft.is_open ? '🟢 เปิดให้แขกเข้าขูดการ์ดได้ทันที' : '🟡 ล็อคชั่วคราว (ขึ้นข้อความรอพิธีกรนับ 3-2-1)'}
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={saving}
                    style={{
                      flex: '1 1 160px',
                      minHeight: '46px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextRound}
                    disabled={saving}
                    style={{
                      flex: '1 1 160px',
                      minHeight: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#fff',
                      color: '#c46d82',
                      border: '1.5px solid #c46d82',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={16} /> เริ่มรอบใหม่ (Round +1)
                  </button>
                </div>

                {/* Direct Link Box for QR Code / Sharing */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '14px',
                  borderTop: '1px solid #f5dce2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b4f57', wordBreak: 'break-all', flex: 1 }}>
                    <strong>ลิงก์สำหรับทำป้าย QR:</strong><br />
                    {scratchUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      minHeight: '44px',
                      padding: '0 16px',
                      borderRadius: '20px',
                      backgroundColor: copiedUrl ? '#10b981' : '#fdf0f4',
                      color: copiedUrl ? '#fff' : '#c46d82',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid #f0c4cf'
                    }}
                  >
                    {copiedUrl ? <Check size={15} /> : <Copy size={15} />}
                    {copiedUrl ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostScratchModal;
