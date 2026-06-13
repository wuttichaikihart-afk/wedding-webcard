import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, CheckCircle, QrCode, Download, X } from 'lucide-react';
import qrCodeImg from '../assets/IMG_9342.JPG';

const GiftRegistry = () => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const accountNumber = "281-1137864-8";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="section-title">Gift Registry</h2>
          <p className="section-subtitle">ร่วมแสดงความยินดี (ช่องทางมอบของขวัญ)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-panel"
          style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center' }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--secondary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Gift size={40} color="var(--primary)" />
          </div>
          
          <p style={{ marginBottom: '30px', color: 'var(--text-main)' }}>
            การแสดงความยินดีของทุกท่านคือของขวัญที่ดีที่สุดสำหรับเราสองคน<br/>
            แต่สำหรับท่านที่ประสงค์จะมอบของขวัญเพื่อเป็นทุนเริ่มต้นชีวิตคู่<br/>
            สามารถร่วมแสดงความยินดีได้ตามช่องทางด้านล่างนี้ครับ/ค่ะ
          </p>

          <div style={{
            backgroundColor: 'var(--white)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>ธนาคารกรุงศรี (Krungsri)</h4>
            <p style={{ fontSize: '1.3rem', letterSpacing: '1px', marginBottom: '10px', fontWeight: 500, color: 'var(--primary-dark)' }}>
              {accountNumber}
            </p>
            <p style={{ color: 'var(--text-light)', marginBottom: '25px', fontSize: '0.95rem' }}>
              ชื่อบัญชี: นาย วุฒิชัย เจิมเกาะ
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{ padding: '10px', fontSize: '0.9rem' }}
              >
                {copied ? (
                  <><CheckCircle size={18} /> คัดลอกแล้ว</>
                ) : (
                  <><Copy size={18} /> คัดลอกเลขบัญชี</>
                )}
              </button>

              <button 
                onClick={() => setShowQR(true)}
                className="btn btn-primary"
                style={{ padding: '10px', fontSize: '0.9rem' }}
              >
                <QrCode size={18} /> แสดง QR Code
              </button>
            </div>
          </div>
        </motion.div>

        {/* QR Code Popup */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  maxWidth: '400px',
                  width: '100%',
                  position: 'relative'
                }}
              >
                <button 
                  onClick={() => setShowQR(false)}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-light)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={24} />
                </button>

                <h3 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>สแกน QR เพื่อโอนเงิน</h3>
                
                <img 
                  src={qrCodeImg} 
                  alt="QR Code" 
                  style={{
                    width: '100%',
                    maxWidth: '250px',
                    height: 'auto',
                    marginBottom: '20px',
                    borderRadius: '10px'
                  }}
                />
                
                <p style={{ fontWeight: 500, marginBottom: '5px' }}>นาย วุฒิชัย เจิมเกาะ</p>
                <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>ธนาคารกรุงศรี: {accountNumber}</p>

                <a 
                  href={qrCodeImg} 
                  download="QR_Wedding.jpg"
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                  <Download size={18} /> บันทึกภาพ QR Code
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GiftRegistry;
