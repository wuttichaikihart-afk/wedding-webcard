import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../data/config.json';
import envelopeBg from '../assets/pic_no_112.jpg';

const EnvelopeOpener = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // ล็อคหน้าจอไม่ให้เลื่อนได้ตอนยังไม่เปิดการ์ด
    document.body.style.overflow = 'hidden';
    // เลื่อนกลับไปบนสุดเสมอเมื่อโหลดหน้าเว็บ
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    document.body.style.overflow = 'unset';
    if (onOpen) onOpen(); // เล่นเพลงหรือฟังก์ชันเพิ่มเติม
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.08, 
            filter: 'blur(10px)' 
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleOpen}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 99999, // ให้อยู่บนสุด
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.2) 100%), url(${envelopeBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 15%',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '50px 20px 35px',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
        >
          {/* ==========================================
              ส่วนบน: ข้อความเชิญ & ตราประทับ
          ========================================== */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px'
          }}>
            {/* ข้อความ YOU'RE INVITED */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <span style={{ height: '1px', width: '35px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8))' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>✦</span>
                <span style={{ height: '1px', width: '35px', background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.8))' }} />
              </div>

              <p style={{
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.1rem, 4vw, 1.35rem)',
                textTransform: 'uppercase',
                letterSpacing: '6px',
                textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)',
                fontWeight: 400,
                margin: 0
              }}>
                {config.envelope?.topText || "You're Invited"}
              </p>
            </motion.div>

            {/* ตราประทับคริสตัลโรสโกลด์ (Monogram Crest) */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* วงแหวนคริสตัลแก้วใสประกายทอง */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontFamily: 'var(--font-cursive)',
                  color: '#ffffff',
                  fontSize: 'clamp(3.5rem, 12vw, 4.5rem)',
                  fontWeight: '400',
                  textShadow: '0 4px 15px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.4)',
                  lineHeight: '1',
                }}>
                  {config.envelope?.sealText || 'T&T'}
                </span>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  letterSpacing: '6px',
                  fontWeight: '400',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  textTransform: 'uppercase'
                }}>
                  19.12.69
                </span>
              </div>
            </motion.div>
          </div>

          {/* ==========================================
              ส่วนล่าง: ปุ่มกดเปิดการ์ดพร้อมเอฟเฟกต์กระพริบ
          ========================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <div 
              style={{
                padding: '12px 28px',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '30px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
                fontSize: '0.95rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                animation: 'pulsePill 2s infinite ease-in-out'
              }}
            >
              <span>✉️</span>
              <span>{config.envelope?.bottomText || "แตะเพื่อเปิดการ์ด (Tap to Open)"}</span>
            </div>

            <style>{`
              @keyframes pulsePill {
                0%, 100% {
                  transform: translateY(0);
                  box-shadow: 0 8px 25px rgba(0,0,0,0.35);
                }
                50% {
                  transform: translateY(-4px);
                  box-shadow: 0 14px 30px rgba(232, 168, 184, 0.6);
                }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnvelopeOpener;
