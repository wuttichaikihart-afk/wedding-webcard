// ==========================================
// Timeline.jsx — กำหนดการงาน (Schedule of Events)
// ==========================================
// แก้ไขได้ที่ส่วนนี้:
//   - เพิ่ม/ลด/แก้รายการกำหนดการ: แก้ในอาร์เรย์ "schedule" ด้านล่าง
//   - แต่ละรายการมี: time (เวลา), title (ชื่อกิจกรรม), description (รายละเอียด), icon (ไอคอน)
//   - ไอคอนที่ใช้ได้: Heart, Clock, Coffee, Utensils, Music (นำเข้าจาก lucide-react)
//   - หัวข้อหน้า: แก้ข้อความใน <h2> และ <p> ด้านล่าง

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Coffee, Heart, Utensils, Music, Camera, GlassWater, PartyPopper, Gift, Gem } from 'lucide-react';
import config from '../data/config.json';

// Helper function to render the correct icon based on string name
const renderIcon = (iconName) => {
  switch (iconName) {
    case 'Clock': return <Clock size={24} />;
    case 'Coffee': return <Coffee size={24} />;
    case 'Utensils': return <Utensils size={24} />;
    case 'Music': return <Music size={24} />;
    case 'Camera': return <Camera size={24} />;
    case 'GlassWater': return <GlassWater size={24} />;
    case 'PartyPopper': return <PartyPopper size={24} />;
    case 'Gift': return <Gift size={24} />;
    case 'Gem': return <Gem size={24} />;
    case 'Heart':
    default:
      return <Heart size={24} />;
  }
};

const Timeline = () => {
  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--secondary)' }}>
      <div className="container">

        {/* ==========================================
            หัวข้อและหัวข้อย่อยของส่วนนี้
            แก้ข้อความใน <h2> และ <p> ได้เลย
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Schedule of Events</h2> {/* ← แก้หัวข้อ */}
          <p className="section-subtitle">กำหนดการพิธีการ</p>   {/* ← แก้หัวข้อย่อย */}
        </motion.div>

        {/* ==========================================
            Timeline แนวตั้ง
            ระบบสร้างการ์ดจาก schedule[] อัตโนมัติ
            การ์ดคู่จะสลับซ้าย-ขวา
        ========================================== */}
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          {/* เส้นแนวตั้งกลาง */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '2px', backgroundColor: 'var(--border-color)', zIndex: 1 }} className="timeline-line" />

          {config.timeline.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={index}
                className={`timeline-item ${isLeft ? 'is-left' : 'is-right'}`}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  justifyContent: isLeft ? 'flex-start' : 'flex-end',
                  marginBottom: '40px',
                  position: 'relative',
                  width: '100%'
                }}
              >
                {/* ไอคอนวงกลมกลาง Timeline */}
                <div className="timeline-icon" style={{
                  position: 'absolute',
                  left: '50%',
                  top: '20px',
                  transform: 'translate(-50%, -50%)',
                  width: '56px',
                  height: '56px',
                  backgroundColor: 'var(--white)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--primary-dark)',
                  color: 'var(--primary-dark)',
                  zIndex: 2,
                  boxShadow: '0 8px 25px rgba(196, 109, 130, 0.35), 0 0 0 6px rgba(232, 168, 184, 0.25)'
                }}>
                  {renderIcon(item.icon)}
                </div>

                {/* การ์ดข้อมูลกิจกรรม */}
                <div 
                  className={`wedding-frame timeline-content ${isLeft ? 'align-right' : 'align-left'}`}
                  style={{
                    width: 'calc(50% - 45px)',
                    textAlign: isLeft ? 'right' : 'left',
                    padding: '24px',
                    position: 'relative'
                  }}
                >
                  <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--primary-dark)', fontSize: '1.6rem', fontWeight: 600, marginBottom: '5px', textShadow: '0 1px 2px rgba(196, 109, 130, 0.1)' }}>
                    {item.time}
                  </h3>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '8px' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CSS สำหรับหน้าจอมือถือ (Responsive) */}
      <style>{`
        @media (max-width: 768px) {
          .timeline-line {
            left: 35px !important;
          }
          .timeline-item {
            justify-content: flex-end !important;
          }
          .timeline-icon {
            left: 35px !important;
          }
          .timeline-content {
            width: calc(100% - 85px) !important;
            margin-left: auto;
            text-align: left !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Timeline;
