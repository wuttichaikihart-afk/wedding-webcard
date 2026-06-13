import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleHeart } from 'lucide-react';

const MOCK_MESSAGES = [
  { id: 1, name: "Aunt Sarah", message: "ขอให้หลานทั้งสองมีความสุขมากๆ นะจ๊ะ" },
  { id: 2, name: "Mike & Jane", message: "Congratulations on your wedding! Wishing you a lifetime of love and happiness." },
  { id: 3, name: "พี่เอก", message: "ยินดีด้วยครับ น้องรัก ขอให้มีความสุขในชีวิตคู่ครับ" }
];

const Guestbook = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.name || !newMessage.message) return;
    
    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setMessages([{ id: Date.now(), ...newMessage }, ...messages]);
      setNewMessage({ name: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--secondary)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="section-title">Guestbook</h2>
          <p className="section-subtitle">สมุดอวยพรออนไลน์</p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Write Message Form */}
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
              ฝากคำอวยพรถึงบ่าวสาว
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
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
                <textarea 
                  className="form-control" 
                  placeholder="ข้อความอวยพร (Your Message)" 
                  rows="3"
                  value={newMessage.message}
                  onChange={e => setNewMessage({...newMessage, message: e.target.value})}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังส่งข้อความ...' : 'ส่งคำอวยพร'}
              </button>
            </form>
          </motion.div>

          {/* Messages Display */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  backgroundColor: 'var(--white)',
                  padding: '20px',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid var(--primary)'
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
