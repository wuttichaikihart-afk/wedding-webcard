// ==========================================
// Guestbook.jsx — สมุดอวยพรออนไลน์
// ==========================================
// แก้ไขได้ที่ส่วนนี้:
//   - หัวข้อ: แก้ข้อความใน <h2> "Guestbook" และ <p> "สมุดอวยพรออนไลน์"
//   - ข้อความเชิญชวน: แก้ใน <h3> "ฝากคำอวยพรถึงบ่าวสาว"
//   - Placeholder ในช่องกรอก: แก้ค่า placeholder="..." ในแต่ละ input/textarea
//   - ข้อความเมื่อยังไม่มีข้อความ: แก้ใน <p> "ยังไม่มีข้อความอวยพร..."
//   - ข้อมูลจะถูกบันทึกและแสดงแบบ Realtime จากฐานข้อมูล Supabase ตาราง "guestbook"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleHeart } from 'lucide-react';
import { supabase } from '../supabaseClient'; // การเชื่อมต่อฐานข้อมูล

const Guestbook = () => {
  const [messages, setMessages] = useState([]);                       // รายการข้อความทั้งหมด
  const [newMessage, setNewMessage] = useState({ name: '', message: '' }); // ข้อความที่กำลังกรอก
  const [isSubmitting, setIsSubmitting] = useState(false);            // กำลังส่งข้อมูล?

  // โหลดข้อความทั้งหมดจาก Supabase (เรียงล่าสุดก่อน)
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching messages:", error);
    else setMessages(data || []);
  };

  useEffect(() => {
    fetchMessages(); // โหลดข้อความเดิมจากฐานข้อมูลเมื่อหน้าโหลด

    // ==========================================
    // Realtime Subscription
    // อัปเดตข้อความแบบเรียลไทม์เมื่อมีคนพิมพ์เข้ามาใหม่
    // ==========================================
    const subscription = supabase
      .channel('public:guestbook')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook' }, payload => {
        setMessages((current) => [payload.new, ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // ฟังก์ชันส่งข้อความอวยพรใหม่ไปยัง Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.name || !newMessage.message) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('guestbook')
      .insert([{ 
        name: newMessage.name, 
        message: newMessage.message 
      }]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error inserting message:", error);
      alert("เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
    } else {
      setNewMessage({ name: '', message: '' }); // ล้างฟอร์มหลังส่งสำเร็จ
    }
  };

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
            <span style={{ fontSize: '1.8rem', animation: 'pulse 2s infinite' }}>📖</span>
            <h2 className="section-title" style={{ margin: 0 }}>Guestbook</h2> 
            <span style={{ fontSize: '1.8rem', animation: 'pulse 2s infinite' }}>💖</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ height: '1px', width: '40px', backgroundColor: 'var(--primary)', opacity: 0.5 }}></span>
            <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>✧</span>
            <span style={{ height: '1px', width: '40px', backgroundColor: 'var(--primary)', opacity: 0.5 }}></span>
          </div>
          <p className="section-subtitle">สมุดอวยพรออนไลน์</p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* ==========================================
              ฟอร์มเขียนข้อความอวยพร
              แก้ข้อความ placeholder และหัวข้อได้ที่นี่
          ========================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel"
            style={{ padding: '30px' }}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageCircleHeart color="var(--primary)" />
              ฝากคำอวยพรถึงบ่าวสาว {/* ← แก้หัวข้อฟอร์ม */}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                {/* ช่องชื่อผู้อวยพร — แก้ข้อความ placeholder ได้ที่นี่ */}
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="ชื่อของคุณ (Your Name)"
                  value={newMessage.name}
                  onChange={e => setNewMessage({...newMessage, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                {/* ช่องข้อความอวยพร — แก้ข้อความ placeholder ได้ที่นี่ */}
                <textarea 
                  className="form-control" 
                  placeholder="ข้อความอวยพร (Your Message)"
                  rows="3"
                  value={newMessage.message}
                  onChange={e => setNewMessage({...newMessage, message: e.target.value})}
                  required
                ></textarea>
              </div>
              {/* ปุ่มส่งข้อความ */}
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังส่งข้อความ...' : 'ส่งคำอวยพร'} {/* ← แก้ข้อความปุ่ม */}
              </button>
            </form>
          </motion.div>

          {/* ==========================================
              รายการข้อความอวยพร
              แสดงอัตโนมัติจากฐานข้อมูล (Realtime)
              ข้อความใหม่จะแสดงบนสุดโดยไม่ต้อง Refresh
          ========================================== */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* ข้อความแสดงเมื่อยังไม่มีคำอวยพร */}
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>ยังไม่มีข้อความอวยพร มาร่วมเป็นคนแรกที่อวยพรกันเถอะ!</p>
            )}
            {/* การ์ดข้อความแต่ละรายการ */}
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index > 5 ? 0 : index * 0.1 }}
                style={{
                  backgroundColor: 'var(--white)',
                  padding: '20px',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid var(--primary)' // ← แถบสีซ้ายของการ์ด
                }}
              >
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>"{msg.message}"</p>
                <p style={{ color: 'var(--primary-dark)', fontWeight: 500, fontSize: '0.9rem' }}>— {msg.name}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Guestbook;
