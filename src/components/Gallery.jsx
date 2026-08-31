// ==========================================
// Gallery.jsx — แกลเลอรีรูปภาพ (Our Memories)
// ==========================================
// แก้ไขได้ที่ส่วนนี้:
//   - เพิ่มรูปภาพ: ใส่ไฟล์รูปชื่อขึ้นต้นด้วย "pic" (เช่น pic21.jpg, pic22.jpg)
//                  ลงในโฟลเดอร์ src/assets/ ระบบจะโหลดอัตโนมัติโดยไม่ต้องแก้โค้ด
//   - ลบรูปภาพ: ลบไฟล์รูปออกจากโฟลเดอร์ src/assets/ ได้เลย
//   - หัวข้อ: แก้ข้อความใน <h2> "Our Memories" และ <p> "แกลเลอรีภาพถ่ายของเรา"
//   - ขนาดการ์ดรูป: แก้ width/height ในส่วน style ของ motion.div ที่ครอบรูป

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// ==========================================
// โหลดรูปภาพอัตโนมัติจากโฟลเดอร์ assets/
// ทุกไฟล์ที่ชื่อขึ้นต้นด้วย "pic" และนามสกุล .jpg
// จะถูกโหลดและแสดงในแกลเลอรีโดยอัตโนมัติ
// เช่น: pic1.jpg, pic2.jpg, ..., pic99.jpg
// ==========================================
const modules = import.meta.glob(['../assets/pic*.jpg', '../assets/pic*.JPG', '../assets/pic*.png', '../assets/pic*.PNG'], { eager: true, import: 'default' });

// จัดเรียงรูปตามตัวเลข (1, 2, 3, ...)
const images = Object.keys(modules)
  .sort((a, b) => {
    const matchA = a.match(/pic(\d+)\.(jpg|png)/i);
    const matchB = b.match(/pic(\d+)\.(jpg|png)/i);
    const numA = matchA ? parseInt(matchA[1], 10) : 0;
    const numB = matchB ? parseInt(matchB[1], 10) : 0;
    return numA - numB;
  })
  .map(key => modules[key]);

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState(null); // รูปที่เลือกดูแบบเต็มจอ
  const carouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false); // เก็บสถานะว่าเมาส์ชี้อยู่หรือไม่ เพื่อหยุดเลื่อน

  // ==========================================
  // Keyboard Navigation
  // กด Escape เพื่อปิด Popup
  // กดลูกศรซ้าย/ขวาเพื่อดูรูปก่อนหน้า/ถัดไป
  // ==========================================
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
      document.body.style.overflow = 'hidden'; // ล็อคการเลื่อนหน้าขณะดู Popup
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  // ==========================================
  // Auto-scroll (เลื่อนรูปภาพอัตโนมัติ)
  // แก้ไขให้เลื่อนทีละรูปอย่างนุ่มนวลเพื่อลดอาการกระตุกและขัดแย้งกับระบบ Snap
  // ==========================================
  useEffect(() => {
    // ถ้าเปิดรูปดูเต็มจออยู่ หรือเอาเมาส์ชี้ที่รูปภาพ ให้หยุดเลื่อนชั่วคราว
    if (selectedIndex !== null || isHovered) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        
        // เช็คว่าเลื่อนไปจนสุดหรือยัง (เผื่อระยะบัฟเฟอร์ไว้เล็กน้อย)
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
          // ถ้าสุดแล้ว ให้เลื่อนกลับไปภาพแรกสุดอย่างนุ่มนวล
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // ถ้ายังไม่สุด ให้เลื่อนไปทางขวาทีละ 1 รูป (ความกว้างรูป 300px + gap 20px = 320px)
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000); // ระยะเวลาหน่วงก่อนจะเลื่อนรูปถัดไป (ปรับเป็น 4 วินาที ให้อ่าน/ดูรูปได้นานขึ้น)

    return () => clearInterval(interval);
  }, [selectedIndex, isHovered]);

  // ฟังก์ชันเลื่อน Carousel ซ้าย/ขวา
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
      <div className="container">

        {/* ==========================================
            หัวข้อและปุ่มเลื่อนรูป
            แก้ข้อความหัวข้อได้ใน <h2> และ <p>
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
          style={{ position: 'relative', marginBottom: '40px' }}
        >
          <h2 className="section-title">Our Memories</h2>         {/* ← แก้หัวข้อ */}
          <p className="section-subtitle">แกลเลอรีภาพถ่ายของเรา</p> {/* ← แก้หัวข้อย่อย */}
          
          {/* ปุ่มเลื่อนซ้าย/ขวา */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
            <button 
              onClick={scrollLeft}
              className="btn btn-secondary"
              style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft />
            </button>
            <button 
              onClick={scrollRight}
              className="btn btn-secondary"
              style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ==========================================
          Carousel รูปภาพ
          เลื่อนซ้าย-ขวาได้ด้วยปุ่ม หรือสัมผัสบนมือถือ
          คลิกที่รูปเพื่อดูแบบเต็มจอ
          ขนาดการ์ด: width='300px', height='400px' — แก้ได้ที่นี่
      ========================================== */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        ref={carouselRef}
        onMouseEnter={() => setIsHovered(true)}   /* หยุดเลื่อนเมื่อเมาส์ชี้ */
        onMouseLeave={() => setIsHovered(false)}  /* เลื่อนต่อเมื่อเอาเมาส์ออก */
        onTouchStart={() => setIsHovered(true)}   /* สำหรับมือถือตอนกำลังปัด */
        onTouchEnd={() => setIsHovered(false)}    /* สำหรับมือถือตอนปัดเสร็จ */
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: '20px',
          padding: '20px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="hide-scrollbar"
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        
        {images.map((img, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            style={{
              flex: '0 0 auto',
              width: '300px',   // ← ความกว้างการ์ดรูป
              height: '400px',  // ← ความสูงการ์ดรูป
              scrollSnapAlign: 'center',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedIndex(index)} // คลิกเพื่อเปิด Popup
          >
            <img 
              src={img} 
              alt={`Gallery ${index + 1}`} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ==========================================
          Popup แสดงรูปเต็มจอ (Lightbox)
          กด Escape หรือคลิกพื้นหลังเพื่อปิด
          ใช้ปุ่มลูกศรซ้าย/ขวาเพื่อเปลี่ยนรูป
      ========================================== */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)} // คลิกพื้นหลังเพื่อปิด
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            {/* ปุ่มปิด X */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '10px',
                zIndex: 10000
              }}
            >
              <X size={36} />
            </button>

            {/* ปุ่มรูปก่อนหน้า */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }}
              style={{
                position: 'absolute',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                padding: '15px',
                borderRadius: '50%',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <ChevronLeft size={32} />
            </button>
            
            {/* รูปขยายเต็มจอ */}
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={images[selectedIndex]}
              alt={`Popup Fullsize ${selectedIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxHeight: '90vh',
                maxWidth: '85vw',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            />

            {/* ปุ่มรูปถัดไป */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }}
              style={{
                position: 'absolute',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                padding: '15px',
                borderRadius: '50%',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <ChevronRight size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
