// ==========================================
// GiftRegistry.jsx — ของขวัญ / โอนเงิน / QR Code
// ==========================================
// แก้ไขได้ที่ส่วนนี้:
//   - เลขบัญชีธนาคาร: แก้ค่า accountNumber ด้านล่าง
//   - ชื่อธนาคาร: แก้ข้อความใน <h4> "ธนาคารกรุงศรี"
//   - ชื่อเจ้าของบัญชี: แก้ข้อความ "นาย วุฒิชัย เจิมเกาะ" (มีอยู่ 2 จุด)
//   - รูป QR Code: เปลี่ยนไฟล์รูปในโฟลเดอร์ src/assets/ แล้วแก้ชื่อไฟล์ในบรรทัด import
//   - ข้อความเกริ่นนำ: แก้ใน <p> ด้านล่างไอคอน Gift
//   - หัวข้อ: แก้ข้อความใน <h2> "Gift Registry" และ <p> "ร่วมแสดงความยินดี"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, CheckCircle, QrCode, Download, X } from 'lucide-react';
import qrCodeImg from '../assets/IMG_9342.JPG'; // ← เปลี่ยนชื่อไฟล์รูป QR Code ที่นี่
import config from '../data/config.json';

const GiftRegistry = () => {
  const [copied, setCopied] = useState(false);   // สถานะ "คัดลอกแล้ว"
  const [showQR, setShowQR] = useState(false);   // สถานะเปิด/ปิด Popup QR

  // ==========================================
  // เลขบัญชีธนาคาร
  // ==========================================
  const accountNumber = config.gift?.accountNumber || "281-1-37864-8";

  // ฟังก์ชันคัดลอกเลขบัญชี (ลบขีด - ออกอัตโนมัติ)
  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // รีเซ็ตหลัง 2 วินาที
  };

  // ==========================================
  // กำหนดเงื่อนไขการแสดงผล: แสดงเมื่อถึงวันงานแล้วเท่านั้น (หรือตั้งค่าแสดงตลอดเวลา)
  // ==========================================
  const targetDateStr = config.countdown?.targetDate || '2026-12-19T00:00:00';
  const targetDate = new Date(targetDateStr);
  const isWeddingDayReached = new Date().getTime() >= targetDate.getTime();
  
  const displayMode = config.gift?.displayMode || 'auto'; // 'auto' (ถึงวันงาน) | 'always' (แสดงตลอด) | 'hidden' (ซ่อน)
  const shouldShow = displayMode === 'always' || (displayMode === 'auto' && isWeddingDayReached);

  // ถ้ายังไม่ถึงวันงาน และตั้งค่าเป็น auto ให้ซ่อนส่วนนี้
  if (!shouldShow) {
    return null;
  }

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-color)' }}>
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
          <h2 className="section-title">Gift Registry</h2>                        {/* ← แก้หัวข้อ */}
          <p className="section-subtitle">ร่วมแสดงความยินดี (ช่องทางมอบของขวัญ)</p> {/* ← แก้หัวข้อย่อย */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-panel"
          style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center' }}
        >
          {/* ไอคอนของขวัญ */}
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

          {/* ==========================================
              ข้อความเกริ่นนำ — แก้ได้ที่นี่
          ========================================== */}
          <p style={{ marginBottom: '30px', color: 'var(--text-main)' }}>
            การแสดงความยินดีของทุกท่านคือของขวัญที่ดีที่สุดสำหรับเราสองคน<br />
            แต่สำหรับท่านที่ประสงค์จะมอบของขวัญเพื่อเป็นทุนเริ่มต้นชีวิตคู่<br />
            สามารถร่วมแสดงความยินดีได้ตามช่องทางด้านล่างนี้ครับ/ค่ะ
          </p>

          {/* ==========================================
              กล่องข้อมูลบัญชีธนาคาร
              แก้ชื่อธนาคาร, เลขบัญชี, ชื่อบัญชีได้ที่นี่
          ========================================== */}
          <div 
            className="wedding-frame"
            style={{
              padding: '28px'
            }}
          >
            {/* ชื่อธนาคาร — แก้ได้ */}
            <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{config.gift?.bankName || "ธนาคารกรุงศรี (Krungsri)"}</h4>
            
            {/* เลขบัญชี (ดึงจากตัวแปร accountNumber ด้านบน) */}
            <p style={{ fontSize: '1.3rem', letterSpacing: '1px', marginBottom: '10px', fontWeight: 500, color: 'var(--primary-dark)' }}>
              {accountNumber}
            </p>
            
            {/* ชื่อเจ้าของบัญชี — แก้ได้ที่นี่ */}
            <p style={{ color: 'var(--text-light)', marginBottom: '25px', fontSize: '0.95rem' }}>
              ชื่อบัญชี: {config.gift?.accountName || "นาย วุฒิชัย เจิมเกาะ"}
            </p>

            {/* ปุ่มคัดลอกเลขบัญชี และแสดง QR Code */}
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

        {/* ==========================================
            Popup แสดง QR Code
            กดปุ่ม X หรือคลิกพื้นหลังเพื่อปิด
            มีปุ่มบันทึกรูป QR Code ลงเครื่อง
        ========================================== */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)} // คลิกพื้นหลังเพื่อปิด
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
                {/* ปุ่มปิด */}
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

                {/* รูป QR Code */}
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

                {/* ชื่อและเลขบัญชีในหน้าต่าง Popup */}
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{config.gift?.bankName || "ธนาคารกรุงศรี (Krungsri)"}</p>
                <p style={{ fontWeight: 500, marginBottom: '5px' }}>ชื่อบัญชี: {config.gift?.accountName || "นาย วุฒิชัย เจิมเกาะ"}</p>
                <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>เลขบัญชี: {accountNumber}</p>

                {/* ปุ่มบันทึกรูป QR Code */}
                <a
                  href={qrCodeImg}
                  download="QR_Wedding.jpg" // ← แก้ชื่อไฟล์ที่บันทึกได้
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
