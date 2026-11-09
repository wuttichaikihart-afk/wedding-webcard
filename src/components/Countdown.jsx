// ==========================================
// Countdown.jsx — นับถอยหลังวันงาน + ธีมสีเสื้อผ้า (Dress Code)
// ==========================================
// แก้ไขได้ที่ส่วนนี้:
//   - วันที่นับถอยหลัง: แก้ค่า targetDate (บรรทัด new Date(...))
//   - ข้อความหัวข้อ "Countdown to Our Big Day": แก้ใน <h2> ด้านล่าง
//   - วันที่แสดงใต้หัวข้อ "19 ธันวาคม 2569": แก้ใน <p> ด้านล่าง
//   - ธีมสีวงกลม Dress Code: แก้ค่า color: '#FADCDC' ฯลฯ ในส่วน Dress Code

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import config from '../data/config.json';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // ==========================================
    // กำหนดวันที่งาน (Target Date)
    // ==========================================
    const targetDate = new Date(config.countdown.targetDate).getTime(); // ← แก้วันงานที่ Admin Panel

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // ถ้าถึงวันงานแล้ว ให้หยุดนับ
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // คำนวณเวลาที่เหลือ
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // ป้ายกำกับใต้ตัวเลข (ภาษาอังกฤษ + ภาษาไทย)
  // แก้คำภาษาไทยในช่อง labelTh ได้เลย
  // ==========================================
  const timeUnits = [
    { label: 'Days',  value: timeLeft.days,    labelTh: 'วัน' },
    { label: 'Hours', value: timeLeft.hours,   labelTh: 'ชั่วโมง' },
    { label: 'Mins',  value: timeLeft.minutes, labelTh: 'นาที' },
    { label: 'Secs',  value: timeLeft.seconds, labelTh: 'วินาที' }
  ];

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--secondary)' }}>
      <div className="container text-center">

        {/* ==========================================
            หัวข้อและวันที่
            แก้ข้อความในแท็ก <h2> และ <p> ด้านล่าง
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">
            {config.countdown.title}
          </h2>
          <p className="section-subtitle" style={{ marginBottom: '40px' }}>
            {config.countdown.dateText}
          </p>
        </motion.div>

        {/* ==========================================
            กล่องตัวเลขนับถอยหลัง (Days / Hours / Mins / Secs)
            ระบบจะนับค่าอัตโนมัติจาก targetDate ด้านบน
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}
        >
          {timeUnits.map((unit, index) => (
            <div 
              key={index} 
              className="wedding-frame"
              style={{
                width: '100px',
                height: '110px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px'
              }}
            >
              {/* ตัวเลข */}
              <span style={{ fontSize: '2.2rem', fontWeight: '600', color: 'var(--primary-dark)', lineHeight: '1.1', textShadow: '0 2px 4px rgba(196, 109, 130, 0.15)' }}>
                {String(unit.value).padStart(2, '0')}
              </span>
              {/* ป้ายกำกับภาษาอังกฤษ */}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px', fontWeight: '600' }}>
                {unit.label}
              </span>
              {/* ป้ายกำกับภาษาไทย */}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', marginTop: '1px', opacity: 0.8 }}>
                {unit.labelTh}
              </span>
            </div>
          ))}
        </motion.div>



        {/* ==========================================
            ส่วน Dress Code — ธีมสีเสื้อผ้า
            แก้สีวงกลมได้ในรายการ { color: '#...' } ด้านล่าง
            เพิ่มหรือลดจำนวนสีโดยเพิ่ม/ลบ { color: '#XXXXXX' } ในอาร์เรย์
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ marginTop: '60px' }}
        >
          {/* หัวข้อ Dress Code */}
          <h2 className="section-title">
            {config.dressCode?.title || 'Dress Code'}
          </h2>
          <p className="section-subtitle" style={{ marginBottom: '30px' }}>
            {config.dressCode?.subtitle || 'โทนสีเสื้อผ้า'}
          </p>

          {/* วงกลมสี — ดึงจาก config.json */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}>
            {(config.dressCode?.colors || []).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    boxShadow: '0 8px 20px rgba(196, 109, 130, 0.22), inset 0 2px 4px rgba(255,255,255,0.6)',
                    border: '4px solid #ffffff',
                    outline: '1px solid var(--border-color)',
                    transition: 'var(--transition-smooth)'
                  }} 
                  className="color-circle"
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Countdown;
