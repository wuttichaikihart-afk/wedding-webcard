// ==========================================
// LocationMap.jsx — สถานที่จัดงาน + ที่พักแนะนำ
// ==========================================
// แก้ไขได้ที่ส่วนนี้:
//   - ชื่อสถานที่จัดงาน: แก้ใน <h3> "อรัญประเทศ" และ <p> ที่อยู่
//   - ลิงก์แผนที่สถานที่จัดงาน: แก้ href ในปุ่ม "เปิดนำทางสถานที่จัดงาน"
//   - เพิ่ม/แก้/ลบที่พักแนะนำ: แก้ในส่วน <a href="..."> แต่ละรายการ
//   - หัวข้อ: แก้ข้อความใน <h2> "Location" และ <p> "สถานที่จัดงาน"

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const LocationMap = () => {
  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--secondary)' }}>
      <div className="container">

        {/* ==========================================
            หัวข้อและหัวข้อย่อย
            แก้ข้อความใน <h2> และ <p>
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.8rem', animation: 'bounce 2s infinite' }}>🏰</span>
            <h2 className="section-title" style={{ margin: 0 }}>Location</h2> 
            <span style={{ fontSize: '1.8rem', animation: 'bounce 2s infinite' }}>📍</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ height: '1px', width: '40px', backgroundColor: 'var(--primary)', opacity: 0.5 }}></span>
            <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>✧</span>
            <span style={{ height: '1px', width: '40px', backgroundColor: 'var(--primary)', opacity: 0.5 }}></span>
          </div>
          <p className="section-subtitle">สถานที่จัดงาน</p>
        </motion.div>

        {/* Layout 2 คอลัมน์: สถานที่จัดงาน (ซ้าย) + ที่พักแนะนำ (ขวา) */}
        <div className="location-grid" style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: '30px', alignItems: 'stretch' }}>
          
          {/* ==========================================
              กล่องซ้าย: สถานที่จัดงาน
              แก้ชื่อสถานที่, ที่อยู่, และลิงก์แผนที่ได้ที่นี่
          ========================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel"
            style={{ padding: '30px', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
          >
            <MapPin size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
            
            {/* ชื่อสถานที่จัดงาน — แก้ได้ที่นี่ */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>อรัญประเทศ</h3>
            
            {/* ที่อยู่ — แก้ได้ที่นี่ */}
            <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
              อำเภออรัญประเทศ<br/>
              จังหวัดสระแก้ว
            </p>
            
            {/* กลุ่มปุ่มเปิดแผนที่ Google Maps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
              <a 
                href="https://maps.app.goo.gl/Hi7p29TXgaLWmjQU8"  // ลิงก์งานเช้า
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                เปิดนำทางสถานที่จัดงาน
              </a>
              <a 
                href="https://maps.app.goo.gl/CdjJ9b8XqNmtYBpB8"  // ลิงก์ฉลองมงคลสมรส
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                ฉลองมงคลสมรส
              </a>
            </div>
          </motion.div>

          {/* ==========================================
              กล่องขวา: ที่พักแนะนำ
              เพิ่ม/ลบที่พักโดยเพิ่ม/ลบ <a href="..."> แต่ละรายการ
              แก้ชื่อที่พักใน <span> และลิงก์แผนที่ใน href
          ========================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-panel"
            style={{ padding: '30px', width: '100%', backgroundColor: 'var(--white)' }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.3rem', marginBottom: '20px', textAlign: 'center', color: 'var(--primary-dark)' }}>
              <span style={{ fontSize: '1.5rem' }}>🏨</span> ที่พักแนะนำ (Accommodations) <span style={{ fontSize: '1.5rem' }}>🛏️</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* ที่พักที่ 1 — แก้ชื่อใน <span> และลิงก์ใน href */}
              <a href="https://maps.app.goo.gl/tfx7gGVWdJR8RzuR7" target="_blank" rel="noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-color)' }}>
                <span style={{ fontWeight: 500 }}>1. เหมือนฝัน รีสอร์ท</span> {/* ← แก้ชื่อที่พัก */}
                <MapPin size={18} color="var(--primary)" />
              </a>
              
              {/* ที่พักที่ 2 */}
              <a href="https://maps.app.goo.gl/RQTr2sBLTKkY4GLi8" target="_blank" rel="noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-color)' }}>
                <span style={{ fontWeight: 500 }}>2. บ้านเรา รีสอร์ท</span> {/* ← แก้ชื่อที่พัก */}
                <MapPin size={18} color="var(--primary)" />
              </a>

              {/* ที่พักที่ 3 */}
              <a href="https://maps.app.goo.gl/BgUpPxkxupf4NM2QA" target="_blank" rel="noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-color)' }}>
                <span style={{ fontWeight: 500 }}>3. เรือนพักสุวรรณา รีสอร์ท</span> {/* ← แก้ชื่อที่พัก */}
                <MapPin size={18} color="var(--primary)" />
              </a>

              {/* ที่พักที่ 4 */}
              <a href="https://maps.app.goo.gl/Q8NKJZFWFp4SA6fu7" target="_blank" rel="noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-color)' }}>
                <span style={{ fontWeight: 500 }}>4. อัญชันรีสอร์ท</span> {/* ← แก้ชื่อที่พัก */}
                <MapPin size={18} color="var(--primary)" />
              </a>

              {/* เพิ่มที่พักใหม่ได้ที่นี่ โดยคัดลอก <a>...</a> ด้านบน */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* CSS Responsive: บนมือถือแสดงเป็น 1 คอลัมน์, บน Desktop แสดง 2 คอลัมน์ */}
      <style>{`
        .location-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .location-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default LocationMap;
