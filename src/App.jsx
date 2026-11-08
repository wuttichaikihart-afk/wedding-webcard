// ==========================================
// App.jsx — ไฟล์หลักของเว็บไซต์
// ==========================================
// ไฟล์นี้คือ "โครงสร้างหลัก" ของหน้าเว็บทั้งหมด
// ทุก section ที่เห็นบนหน้าเว็บถูกจัดลำดับไว้ที่นี่
// ถ้าต้องการเรียงลำดับส่วนต่างๆ ใหม่ หรือซ่อน/เพิ่ม section ให้แก้ที่ไฟล์นี้

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './components/HeroSection';    // ส่วนหน้าปก (ภาพใหญ่บนสุด)
import Countdown from './components/Countdown';        // นับถอยหลังวันงาน + Dress Code
import Timeline from './components/Timeline';          // กำหนดการ / Schedule of Events
import RSVPForm from './components/RSVPForm';          // ฟอร์มตอบรับเข้าร่วมงาน
import LocationMap from './components/LocationMap';    // สถานที่จัดงาน + ที่พักแนะนำ
import Gallery from './components/Gallery';            // แกลเลอรีรูปภาพ
import Guestbook from './components/Guestbook';        // สมุดอวยพรออนไลน์
import GiftRegistry from './components/GiftRegistry';  // ข้อมูลโอนเงิน / QR Code
import MusicPlayer from './components/MusicPlayer';    // เครื่องเล่นเพลงพื้นหลัง
import EnvelopeOpener from './components/EnvelopeOpener'; // ม่านเปิดหน้าเว็บ (ครั่ง)
import AdminPanel from './components/AdminPanel';      // ระบบจัดการหลังบ้าน
import PhotoBooth from './components/PhotoBooth';
import HostGallery from './components/HostGallery';
import PrintStation from './components/PrintStation';
import QRCodeStandee from './components/QRCodeStandee';
import configData from './data/config.json';               // ข้อมูลและสีธีมจากระบบหลังบ้าน

// คอมโพเนนต์หน้าเว็บหลัก
const MainSite = () => {
  const [config, setConfig] = useState(configData);
  const [showPhotoBoothBtn, setShowPhotoBoothBtn] = useState(false);

  useEffect(() => {
    document.title = config.siteTitle || "Wedding";
  }, []);

  // ตรวจสอบวันงาน (19 ธันวาคม 2569 / 2026-12-19) เพื่อแสดงปุ่มทางลัดโฟโต้บูธ
  useEffect(() => {
    const weddingDay = new Date('2026-12-19T00:00:00+07:00');
    const now = new Date();
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('photobooth') === 'true';
    if (now >= weddingDay || forceShow) {
      setShowPhotoBoothBtn(true);
    }
  }, []);

  // ดึงค่าสีและฟอนต์จาก config มาตั้งเป็น CSS Variables ให้ทั่วทั้งเว็บ (ระดับ Global)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', config.theme.colors.primary);
    root.style.setProperty('--primary-light', config.theme.colors.primaryLight);
    root.style.setProperty('--primary-dark', config.theme.colors.primaryDark);
    root.style.setProperty('--bg-light', config.theme.colors.bgLight);
    root.style.setProperty('--bg-accent', config.theme.colors.bgAccent);
    root.style.setProperty('--text-dark', config.theme.colors.textDark);
    root.style.setProperty('--text-muted', config.theme.colors.textMuted);
    root.style.setProperty('--border-color', config.theme.colors.borderColor);
    root.style.setProperty('--font-heading', config.theme.fonts.heading);
    root.style.setProperty('--font-body', config.theme.fonts.body);
    root.style.setProperty('--font-cursive', config.theme.fonts.cursive);
  }, []);

  return (
    <div className="app">
      <EnvelopeOpener />

      <HeroSection />   
      <Countdown />     
      <Timeline />      
      <Gallery />       
      <RSVPForm />      
      <LocationMap />   
      <Guestbook />     
      <GiftRegistry />  
      <MusicPlayer />   
      
      {/* ปุ่มทางลัดเปิดโฟโต้บูธถ่ายรูป (จะแสดงอัตโนมัติในวันงาน 19/12/2569 เป็นต้นไป) */}
      {showPhotoBoothBtn && (
        <a 
          href="/photobooth"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '20px',
            background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)',
            color: '#ffffff',
            padding: '11px 20px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(196, 109, 130, 0.35)',
            zIndex: 999,
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.92rem',
            border: '2px solid #ffffff',
            transition: 'transform 0.2s',
            whiteSpace: 'nowrap'
          }}
          title="เปิดกล้องโฟโต้บูธถ่ายรูป"
        >
          <span style={{ fontSize: '1.1rem' }}>📸</span> โฟโต้บูธถ่ายรูป
        </a>
      )}   
      
      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        backgroundColor: 'var(--bg-accent)',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        <p style={{ fontFamily: 'var(--font-cursive)', fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }}>
          {config.hero.logoChar1 || config.hero.name1.charAt(0)} {config.hero.logoSymbol || '&'} {config.hero.logoChar2 || config.hero.name2.charAt(0)}
        </p>
        <p>{config.footer?.copyrightText || `© 2026 ${config.hero.name1} & ${config.hero.name2} Wedding. All rights reserved.`}</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/photobooth" element={<PhotoBooth />} />
        <Route path="/memories" element={<HostGallery />} />
        <Route path="/print" element={<PrintStation />} />
        <Route path="/qrcode" element={<QRCodeStandee />} />
        <Route path="/" element={<MainSite />} />
      </Routes>
    </Router>
  );
}

export default App;
