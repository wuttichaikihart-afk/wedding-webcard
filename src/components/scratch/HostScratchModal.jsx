import React, { useState, useEffect } from 'react';
import { X, Trophy, RefreshCw, Copy, Check, Lock, Sparkles, Database } from 'lucide-react';
import { HOST_PIN } from './scratchUtils';

/**
 * Host & MC control modal for managing prizes, live rounds, and projecting winners.
 */
const HostScratchModal = ({
  isOpen,
  onClose,
  settings,
  plays,
  isCloudSynced,
  onUpdateSettings,
  onResetLocalTest
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [prevSettings, setPrevSettings] = useState(settings);
  const [draft, setDraft] = useState(settings);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saving, setSaving] = useState(false);

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

  if (!isOpen) return null;

  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    || window.location.hostname.startsWith('192.168.')
    || window.location.hostname.startsWith('172.');

  const winners = plays.filter((p) => p.is_winner);
  const revealedWinners = winners.filter((p) => p.revealed);
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
      is_open: Boolean(draft.is_open)
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
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '2px solid #f0c4cf',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          padding: '24px',
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
            top: '16px',
            right: '16px',
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
              ใส่รหัส PIN 4 หลักเพื่อดูรายชื่อผู้ชนะและตั้งค่ารางวัล
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Trophy size={24} color="#c46d82" />
              <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.35rem', color: '#4a3038', margin: 0 }}>
                กระดานผู้โชคดี (รอบที่ {settings.round_number})
              </h2>
            </div>

            {/* Sync Status Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '0.82rem',
              backgroundColor: isCloudSynced ? '#ecfdf5' : '#fff7ed',
              color: isCloudSynced ? '#065f46' : '#9a3412',
              border: `1px solid ${isCloudSynced ? '#a7f3d0' : '#fed7aa'}`
            }}>
              <Database size={16} />
              {isCloudSynced ? (
                <span>เชื่อมต่อ Supabase Realtime แล้ว — ซิงค์ผลผู้ชนะทุกเครื่องอัตโนมัติ</span>
              ) : (
                <span>โหมดทดสอบในเครื่อง (หากต้องการซิงค์หลายเครื่องจริง ให้รันไฟล์ <code>supabase_scratch_setup.sql</code> ใน Supabase)</span>
              )}
            </div>

            {/* Live Winner Board */}
            <div style={{
              backgroundColor: '#fff5f7',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #f0c4cf',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#c46d82', fontSize: '0.98rem' }}>
                  🏆 ผู้ชนะที่ขูดเจอแล้ว: {revealedWinners.length} / {settings.max_winners} รางวัล
                </span>
                <span style={{ fontSize: '0.82rem', color: '#6b4f57' }}>
                  เล่นแล้วทั้งหมด {plays.length} คน
                </span>
              </div>

              {winners.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9c7d85', fontSize: '0.9rem', padding: '14px 0', margin: 0 }}>
                  ยังไม่มีผู้ขูดเจอหน้าคู่ เต้ย &amp; ต่าย ในรอบนี้ ✨
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {winners.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: w.revealed ? '1.5px solid #d4af37' : '1px dashed #e8a8b8'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#4a3038', fontSize: '1rem' }}>{w.guest_name}</strong>
                        {w.table_no && (
                          <span style={{ marginLeft: '8px', fontSize: '0.82rem', color: '#88686e' }}>
                            (โต๊ะ/กลุ่ม: {w.table_no})
                          </span>
                        )}
                        <div style={{ fontSize: '0.78rem', color: w.revealed ? '#059669' : '#d97706' }}>
                          {w.revealed ? '✅ ขูดเปิดภาพคู่แล้ว!' : '⏳ รับบัตรแล้ว กำลังขูด...'}
                        </div>
                      </div>
                      <span style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        border: '1px solid #f59e0b'
                      }}>
                        {w.win_code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Control */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
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
                    <option value={0.3}>30% (แนะนำ)</option>
                    <option value={0.5}>50% (ออกไว ลุ้นสนุก)</option>
                    <option value={1}>100% (แจกทันทีทุกคนจนครบโควต้า)</option>
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
    </div>
  );
};

export default HostScratchModal;
