// ==========================================
// RSVPForm.jsx — ฟอร์มตอบรับเข้าร่วมงาน (R.S.V.P)
// ==========================================
// แก้ไขได้ที่ส่วนนี้:
//   - หัวข้อและวันตอบรับ: แก้ข้อความใน <h2> และ <p className="section-subtitle">
//   - เพิ่มตัวเลือกจำนวนผู้ติดตาม: เพิ่ม <option> ในส่วน "companions"
//   - ข้อความหลังส่งฟอร์มสำเร็จ: แก้ข้อความในส่วน isSuccess (Thank You!)
//   - ข้อมูลจะถูกบันทึกลงฐานข้อมูล Supabase ตาราง "rsvps" อัตโนมัติ

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient'; // การเชื่อมต่อฐานข้อมูล

const RSVPForm = () => {
  // ==========================================
  // State ของฟอร์ม — เก็บข้อมูลที่ผู้ใช้กรอก
  // ==========================================
  const [formData, setFormData] = useState({
    firstName: '',      // ชื่อจริง
    lastName: '',       // นามสกุล
    isAttending: 'true', // สถานะ: 'true' = ไปร่วม, 'false' = ไม่ไปร่วม
    companions: '0'     // จำนวนผู้ติดตาม
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // กำลังส่งข้อมูล?
  const [isSuccess, setIsSuccess] = useState(false);       // ส่งสำเร็จแล้ว?

  // ฟังก์ชันอัปเดตข้อมูลในฟอร์มเมื่อผู้ใช้กรอก
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // ฟังก์ชันส่งข้อมูล RSVP ไปยัง Supabase
  // ข้อมูลจะไปปรากฏในตาราง "rsvps" ของ Supabase
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // แปลงค่าตัวเลือกให้เป็นข้อความภาษาไทย
    const attendanceText = formData.isAttending === 'true' 
      ? (formData.companions === '0' ? 'ไปร่วมงาน (ไม่มีผู้ติดตาม)' : `ไปร่วมงาน (ผู้ติดตาม ${formData.companions} ท่าน)`) 
      : 'ไม่สามารถไปร่วมงานได้';

    // ส่งข้อมูลไปบันทึกที่ Supabase
    const { error } = await supabase
      .from('rsvps')
      .insert([{ 
        first_name: formData.firstName,
        last_name: formData.lastName,
        attendance: attendanceText
      }]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error inserting RSVP:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } else {
      setIsSuccess(true); // แสดงข้อความขอบคุณ
    }
  };

  return (
    // id="rsvp" ทำให้ปุ่ม "RSVP NOW" บนหน้าปกสามารถ scroll มาถึงส่วนนี้ได้
    <section id="rsvp" className="section-padding" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">

        {/* ==========================================
            หัวข้อและวันที่กำหนดตอบรับ
            แก้ข้อความได้ใน <h2> และ <p>
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.8rem', animation: 'pulse 2s infinite' }}>💌</span>
            <h2 className="section-title" style={{ margin: 0 }}>R.S.V.P</h2> 
            <span style={{ fontSize: '1.8rem', animation: 'pulse 2s infinite' }}>💌</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ height: '1px', width: '40px', backgroundColor: 'var(--primary)', opacity: 0.5 }}></span>
            <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>✧</span>
            <span style={{ height: '1px', width: '40px', backgroundColor: 'var(--primary)', opacity: 0.5 }}></span>
          </div>
          <p className="section-subtitle">กรุณาตอบรับการเข้าร่วมงานภายในวันที่ 1 พฤศจิกายน 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          {/* ==========================================
              หน้าขอบคุณ — แสดงหลังส่งฟอร์มสำเร็จ
              แก้ข้อความ "Thank You!" และข้อความด้านล่างได้ที่นี่
          ========================================== */}
          {isSuccess ? (
            <div className="glass-panel text-center" style={{ padding: '40px', backgroundColor: 'var(--secondary)' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.8rem' }}>Thank You!</h3> {/* ← แก้ได้ */}
              <p>เราได้รับข้อมูลของคุณเรียบร้อยแล้ว แล้วพบกันในวันงานนะครับ/ค่ะ</p> {/* ← แก้ได้ */}
            </div>
          ) : (
            // ==========================================
            // ฟอร์มกรอกข้อมูล RSVP
            // ==========================================
            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '40px', backgroundColor: 'var(--secondary-alt)' }}>
              
              {/* ช่องชื่อจริงและนามสกุล */}
              <div className="rsvp-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">ชื่อจริง (First Name) *</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">นามสกุล (Last Name) *</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ==========================================
                  ตัวเลือก: ไปร่วมงาน / ไม่ไปร่วมงาน
                  แก้ข้อความในแต่ละ <option> ได้เลย
              ========================================== */}
              <div className="form-group">
                <label className="form-label">สถานะการเข้าร่วม (Attending) *</label>
                <select 
                  name="isAttending" 
                  className="form-control" 
                  value={formData.isAttending}
                  onChange={handleChange}
                >
                  <option value="true">ไปร่วมงานด้วยความยินดี (Joyfully Accept)</option>
                  <option value="false">ไม่สามารถไปร่วมงานได้ (Regretfully Decline)</option>
                </select>
              </div>

              {/* ==========================================
                  จำนวนผู้ติดตาม (แสดงเฉพาะกรณีเลือก "ไปร่วมงาน")
                  เพิ่มตัวเลือกโดยเพิ่ม <option value="X">X ท่าน</option>
              ========================================== */}
              {formData.isAttending === 'true' && (
                <div className="form-group">
                  <label className="form-label">จำนวนผู้ติดตาม (Companions)</label>
                  <select 
                    name="companions" 
                    className="form-control"
                    value={formData.companions}
                    onChange={handleChange}
                  >
                    <option value="0">ไม่มีผู้ติดตาม</option>
                    <option value="1">1 ท่าน</option>
                    <option value="2">2 ท่าน</option>
                    <option value="3">3 ท่าน</option>
                    {/* เพิ่มตัวเลือกเพิ่มเติมได้ที่นี่ */}
                  </select>
                </div>
              )}

              {/* ปุ่มส่งฟอร์ม */}
              <div className="text-center" style={{ marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
                  {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำตอบ (Submit RSVP)'} {/* ← แก้ข้อความปุ่มได้ */}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default RSVPForm;
