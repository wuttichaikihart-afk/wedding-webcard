// ==========================================
// HeroSection.jsx — ส่วนหน้าปก (ส่วนแรกสุดของเว็บ)
// ==========================================
// แก้ไขได้ที่ส่วนนี้:
//   - รูปภาพพื้นหลัง: เปลี่ยนไฟล์รูปในโฟลเดอร์ src/assets/ แล้วเปลี่ยนชื่อไฟล์ในบรรทัด import ด้านล่าง
//   - ข้อความหน้าปก: ชื่อบ่าวสาว / วันที่ / สถานที่ — ค้นหา "Toey & Kratai" และ "19 ธันวาคม" เพื่อแก้ไข
//   - ความสว่างของภาพพื้นหลัง: ปรับค่า filter: brightness(0.65) — 0 = มืดสุด, 1 = สว่างสุด
//   - ปุ่ม RSVP NOW: แก้ข้อความได้ในส่วน <a href="#rsvp">

import React from 'react';
import { motion } from 'framer-motion';
import config from '../data/config.json'; // ดึงข้อมูลจากระบบหลังบ้าน
import heroBg from '../assets/main_cover.JPG'; // ใช้ static import เพื่อป้องกันบั๊กโหลดภาพไม่ได้

const HeroSection = () => {
  const { hero } = config;

  return (
    <section
      className="hero-section"
      style={{
        position: 'relative',
        height: '100vh',       // ความสูง 100% ของหน้าจอ
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#fff'
      }}
    >
      {/* ==========================================
          รูปภาพพื้นหลัง (Background Image)
          แก้ค่า brightness เพื่อปรับความสว่าง
      ========================================== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 15%',
          zIndex: -1
        }}
      />
      
      {/* เลเยอร์สีดำโปร่งแสง ทำให้ตัวหนังสืออ่านง่ายขึ้น ปรับให้สว่างขึ้นแล้ว */}
      <div className="hero-overlay" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)', 
        zIndex: 0 
      }} />
      {/* เนื้อหาด้านใน */}
      <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 10px', 
            background: 'transparent',
            maxWidth: '100%',
            margin: '0 auto',
            marginBottom: '15px'
          }}
        >
          {/* ข้อความบรรทัดบน */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(8px, 2vw, 15px)',
            marginBottom: '12px',
            width: '100%',
            maxWidth: '600px'
          }}>
            <span style={{ height: '1px', flex: '1', maxWidth: '40px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8))' }} />
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(0.75rem, 3vw, 1.05rem)',
              letterSpacing: 'clamp(2px, 1vw, 6px)',
              textTransform: 'uppercase',
              color: '#ffffff',
              margin: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 0 15px rgba(0,0,0,0.4)',
              fontWeight: '400',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              {hero.subtitle}
            </p>
            <span style={{ height: '1px', flex: '1', maxWidth: '40px', background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.8))' }} />
          </div>

          {/* ชื่อย่อ T&T แบบอลังการ (เปลี่ยนฟอนต์เป็นสไตล์เขียนสวยงาม) */}
          <h1 style={{
            fontFamily: 'var(--font-cursive)',
            fontSize: 'clamp(4.5rem, 15vw, 7.5rem)',
            color: '#ffffff',
            lineHeight: '1.1',
            marginBottom: '0',
            fontWeight: '400',
            textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 80px rgba(232, 168, 184, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(10px, 3vw, 25px)'
          }}>
            <span>{hero.logoChar1 || hero.name1.charAt(0)}</span>
            <span style={{ fontSize: '0.8em' }}>{hero.logoSymbol || '&'}</span>
            <span>{hero.logoChar2 || hero.name2.charAt(0)}</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          {/* ไอคอนหัวใจคั่นกลาง */}
          <div className="divider" style={{ justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '2rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}>&hearts;</span>
          </div>

          {/* ==========================================
              วันที่และสถานที่ด้านล่างชื่อ
              แก้ข้อความวันที่และชื่อจังหวัดได้ที่นี่
          ========================================== */}
          <div className="hero-meta" style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.25rem',
            fontWeight: 300,
            marginBottom: '35px',
            letterSpacing: '1px',
            textShadow: '0 2px 6px rgba(0,0,0,0.6)'
          }}>
            <span style={{ flex: 1, textAlign: 'right', paddingRight: '15px', whiteSpace: 'nowrap' }}>{hero.date}</span>
            <span className="separator" style={{ opacity: 0.8 }}>|</span>
            <span style={{ flex: 1, textAlign: 'left', paddingLeft: '15px', whiteSpace: 'nowrap' }}>{hero.location}</span>
          </div>

          {/* ==========================================
              ปุ่ม RSVP NOW
              href="#rsvp" หมายถึงเลื่อนไปที่ส่วน RSVP อัตโนมัติ
          ========================================== */}
          <button 
            onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })} 
            className="btn btn-primary glow-btn-pulse" 
            style={{
              padding: '16px 45px',
              fontSize: '1.2rem',
              letterSpacing: '2px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            RSVP NOW
          </button>
        </motion.div>
      </div>

      {/* ==========================================
          ลูกศรชี้ลง "Scroll" ที่ด้านล่างหน้าจอ
          แสดงอัตโนมัติ เป็นแค่ตัวบอกให้เลื่อนลง
      ========================================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '30px',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginRight: '-2px' }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            width: '1px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.5)'
          }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
