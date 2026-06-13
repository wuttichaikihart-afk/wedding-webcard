import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Coffee, Heart, Utensils, Music } from 'lucide-react';

const schedule = [
  {
    time: "07:09",
    title: "พิธีแห่ขันหมาก",
    description: "ตั้งขบวนขันหมาก ณ บริเวณโถงหน้าห้องจัดเลี้ยง",
    icon: <Heart size={24} />
  },
  {
    time: "08:09",
    title: "พิธีหมั้น และสวมแหวน",
    description: "พิธีเจรจาสู่ขอ และสวมแหวนหมั้น",
    icon: <Clock size={24} />
  },
  {
    time: "09:09",
    title: "พิธีหลั่งน้ำพระพุทธมนต์",
    description: "พิธีหลั่งน้ำพระพุทธมนต์และประสาทพร",
    icon: <Heart size={24} />
  },
  {
    time: "10:30",
    title: "รับประทานอาหารว่าง",
    description: "เสิร์ฟชา กาแฟ และของว่าง",
    icon: <Coffee size={24} />
  },
  {
    time: "11:30",
    title: "งานเลี้ยงฉลองมงคลสมรส",
    description: "ร่วมรับประทานอาหารกลางวัน (โต๊ะจีน)",
    icon: <Utensils size={24} />
  },
  {
    time: "13:30",
    title: "After Party",
    description: "สนุกสนานกับวงดนตรีสด",
    icon: <Music size={24} />
  }
];

const Timeline = () => {
  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--secondary)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Schedule of Events</h2>
          <p className="section-subtitle">กำหนดการพิธีการ</p>
        </motion.div>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          {/* Vertical Line */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            backgroundColor: 'var(--border-color)',
            zIndex: 1
          }} className="timeline-line" />

          {schedule.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={index}
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
                {/* Center Icon */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '20px',
                  transform: 'translate(-50%, -50%)',
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'var(--white)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--primary)',
                  color: 'var(--primary)',
                  zIndex: 2,
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {item.icon}
                </div>

                <div style={{
                  width: 'calc(50% - 40px)',
                  textAlign: isLeft ? 'right' : 'left',
                  padding: '20px',
                  backgroundColor: 'var(--white)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '5px' }}>
                    {item.time}
                  </h3>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .timeline-line {
            left: 30px !important;
          }
          div[style*="calc(50% - 40px)"] {
            width: calc(100% - 70px) !important;
            margin-left: auto;
            text-align: left !important;
          }
          div[style*="left: 50%"] {
            left: 30px !important;
          }
          div[style*="justify-content: flex-start"] {
            justify-content: flex-end !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Timeline;
