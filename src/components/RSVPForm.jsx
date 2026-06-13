import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RSVPForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    isAttending: 'true',
    companions: '0',
    dietaryNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to Supabase
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <section id="rsvp" className="section-padding" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="section-title">R.S.V.P</h2>
          <p className="section-subtitle">กรุณาตอบรับการเข้าร่วมงานภายในวันที่ 1 พฤศจิกายน 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          {isSuccess ? (
            <div className="glass-panel text-center" style={{ padding: '40px', backgroundColor: 'var(--secondary)' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.8rem' }}>Thank You!</h3>
              <p>เราได้รับข้อมูลของคุณเรียบร้อยแล้ว แล้วพบกันในวันงานนะครับ/ค่ะ</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '40px', backgroundColor: 'var(--secondary-alt)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                  </select>
                </div>
              )}



              <div className="text-center" style={{ marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
                  {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำตอบ (Submit RSVP)'}
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
