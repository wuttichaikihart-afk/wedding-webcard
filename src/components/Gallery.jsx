// ==========================================
// Gallery.jsx — แกลเลอรีรูปภาพ (Masonry Grid Layout)
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

// ==========================================
// โหลดรูปภาพอัตโนมัติจากโฟลเดอร์ assets/
// ==========================================
const modules = import.meta.glob(['../assets/pic*.jpg', '../assets/pic*.JPG', '../assets/pic*.png', '../assets/pic*.PNG', '../assets/gallery/*.*'], { eager: true, import: 'default' });

// จัดเรียงรูปตามตัวเลข (1, 2, 3, ... 28)
const images = Object.keys(modules)
  .filter(key => !key.includes('MacBook') && !key.includes('conflict'))
  .sort((a, b) => {
    const matchA = a.match(/(?:pic|\/)?(\d+)\.(jpg|png|jpeg|webp)/i);
    const matchB = b.match(/(?:pic|\/)?(\d+)\.(jpg|png|jpeg|webp)/i);
    const numA = matchA ? parseInt(matchA[1], 10) : 0;
    const numB = matchB ? parseInt(matchB[1], 10) : 0;
    return numA - numB;
  })
  .map((key) => {
    const match = key.match(/(?:pic|\/)?(\d+)\.(jpg|png|jpeg|webp)/i);
    const num = match ? parseInt(match[1], 10) : 0;
    return {
      id: num,
      src: modules[key],
      num: num
    };
  });

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState(null); // รูปที่เลือกดูแบบเต็มจอ

  // Keyboard Navigation ใน Lightbox (Escape / ลูกศรซ้าย-ขวา)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft' && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight' && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    if (selectedIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  // หากไม่มีรูปภาพในแกลเลอรีเลย ให้ซ่อนส่วนนี้ชั่วคราว
  if (images.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="section-padding" style={{ backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>

        {/* ==========================================
            หัวข้อแกลเลอรี
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
          style={{ marginBottom: '35px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', opacity: 0.8 }}>📷</span>
            <h2 className="section-title" style={{ margin: 0 }}>Our Memories</h2>
            <span style={{ fontSize: '1.6rem', opacity: 0.8 }}>📷</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ height: '1px', width: '40px', backgroundColor: 'var(--primary)', opacity: 0.4 }}></span>
            <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>✧</span>
            <span style={{ height: '1px', width: '40px', backgroundColor: 'var(--primary)', opacity: 0.4 }}></span>
          </div>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>แกลเลอรีภาพถ่ายของเรา</p>
        </motion.div>

        {/* ==========================================
            MASONRY GRID LAYOUT
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: '100%' }}
        >
          {/* สไตล์ CSS สำหรับ Masonry Columns แบบ Responsive */}
          <style>{`
            .wedding-masonry-container {
              column-count: 4;
              column-gap: 16px;
              width: 100%;
            }
            @media (max-width: 1100px) {
              .wedding-masonry-container {
                column-count: 3;
                column-gap: 14px;
              }
            }
            @media (max-width: 680px) {
              .wedding-masonry-container {
                column-count: 2;
                column-gap: 10px;
              }
            }
            .wedding-masonry-item {
              break-inside: avoid;
              margin-bottom: 16px;
              border-radius: 14px;
              overflow: hidden;
              position: relative;
              cursor: pointer;
              background-color: #ffffff;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
              border: 1px solid rgba(232, 168, 184, 0.35);
              transition: transform 0.35s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.35s ease;
              display: block;
            }
            @media (max-width: 680px) {
              .wedding-masonry-item {
                margin-bottom: 10px;
                border-radius: 10px;
              }
            }
            .wedding-masonry-item:hover {
              transform: translateY(-5px);
              box-shadow: 0 12px 28px rgba(196, 109, 130, 0.25);
              border-color: var(--primary);
            }
            .wedding-masonry-img {
              width: 100%;
              height: auto;
              display: block;
              transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1);
            }
            .wedding-masonry-item:hover .wedding-masonry-img {
              transform: scale(1.04);
            }
            .wedding-masonry-overlay {
              position: absolute;
              inset: 0;
              background: linear-gradient(to top, rgba(74, 48, 56, 0.7) 0%, rgba(74, 48, 56, 0.1) 50%, transparent 100%);
              opacity: 0;
              transition: opacity 0.3s ease;
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              padding: 12px 14px;
              color: #ffffff;
              pointer-events: none;
            }
            .wedding-masonry-item:hover .wedding-masonry-overlay {
              opacity: 1;
            }
          `}</style>

          <div className="wedding-masonry-container">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="wedding-masonry-item"
                onClick={() => setSelectedIndex(index)}
                title={`คลิกเพื่อดูรูปภาพขนาดใหญ่ (ภาพที่ ${index + 1})`}
              >
                <img
                  src={img.src}
                  alt={`Wedding memory ${img.id}`}
                  className="wedding-masonry-img"
                  loading="lazy"
                />
                <div className="wedding-masonry-overlay">
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', letterSpacing: '0.5px' }}>
                    Toey &amp; Taii #{img.num}
                  </span>
                  <span style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Maximize2 size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* ==========================================
          Popup แสดงรูปเต็มจอ (Lightbox)
      ========================================== */}
      <AnimatePresence>
        {selectedIndex !== null && images[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(20, 10, 15, 0.94)',
              backdropFilter: 'blur(8px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            {/* แถบหัวด้านบน: แสดงลำดับภาพ */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '24px',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.95rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 14px',
                borderRadius: '20px',
                backdropFilter: 'blur(6px)'
              }}
            >
              <span>📷 ภาพที่ {selectedIndex + 1} จาก {images.length}</span>
            </div>

            {/* ปุ่มปิด X */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '10px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000,
                transition: 'background 0.2s ease',
                backdropFilter: 'blur(6px)'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              aria-label="ปิดหน้าต่างรูปภาพ"
            >
              <X size={24} />
            </button>

            {/* ปุ่มรูปก่อนหน้า */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }}
              style={{
                position: 'absolute',
                left: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                cursor: 'pointer',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              aria-label="ดูรูปก่อนหน้า"
            >
              <ChevronLeft size={30} />
            </button>
            
            {/* รูปขยายเต็มจอ */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '90vw',
                maxHeight: '88vh'
              }}
            >
              <img
                src={images[selectedIndex].src}
                alt={`Wedding memory fullsize ${selectedIndex + 1}`}
                style={{
                  maxHeight: '82vh',
                  maxWidth: '88vw',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)'
                }}
              />
            </motion.div>

            {/* ปุ่มรูปถัดไป */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }}
              style={{
                position: 'absolute',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                cursor: 'pointer',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              aria-label="ดูรูปถัดไป"
            >
              <ChevronRight size={30} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
