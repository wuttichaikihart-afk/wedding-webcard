import React from 'react';
import { Printer, Download, ArrowLeft, Camera, Sparkles } from 'lucide-react';

const QRCodeStandee = () => {
  const qrImageUrl = '/Wedding_PhotoBooth_QRCode.png';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f0eb',
      fontFamily: "'Prompt', sans-serif",
      padding: '20px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Top Action Bar (Hidden on print) */}
      <div 
        className="no-print"
        style={{
          width: '100%',
          maxWidth: '650px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => window.location.href = '/photobooth'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: '#ffffff',
            border: '1px solid #d4c3b3',
            borderRadius: '25px',
            color: '#7a5948',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <ArrowLeft size={16} /> กลับหน้าถ่ายรูป
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={qrImageUrl}
            download="Wedding_PhotoBooth_QRCode.png"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #c5a57a',
              borderRadius: '25px',
              color: '#7a5948',
              fontSize: '0.9rem',
              textDecoration: 'none',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(122,89,72,0.1)'
            }}
          >
            <Download size={16} /> โหลดรูป HD
          </a>

          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              backgroundColor: '#7a5948',
              border: 'none',
              borderRadius: '25px',
              color: '#ffffff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 14px rgba(122,89,72,0.3)'
            }}
          >
            <Printer size={16} /> สั่งพิมพ์ป้ายนี้
          </button>
        </div>
      </div>

      {/* Printable Card Area */}
      <div 
        className="print-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 15px 45px rgba(122,89,72,0.18)',
          border: '1px solid #e8dec8',
          position: 'relative'
        }}
      >
        <img 
          src={qrImageUrl} 
          alt="Wedding PhotoBooth QR Code Standee" 
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </div>

      {/* Info note under card (Hidden on print) */}
      <p 
        className="no-print"
        style={{
          color: '#8c6b58',
          fontSize: '0.85rem',
          textAlign: 'center',
          marginTop: '18px',
          maxWidth: '480px',
          lineHeight: '1.5'
        }}
      >
        💡 <strong>คำแนะนำ:</strong> สามารถกด <strong>"โหลดรูป HD"</strong> เพื่อนำไฟล์ภาพไปสั่งพิมพ์ที่ร้านทำป้ายอะคริลิคตั้งโต๊ะ (A5 หรือ 4x6 / 5x7 นิ้ว) หรือกด <strong>"สั่งพิมพ์ป้ายนี้"</strong> เพื่อปริ้นท์ใส่กระดาษแข็งได้ทันทีครับ
      </p>

      {/* CSS for Print */}
      <style>{`
        @media print {
          body, html {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 auto !important;
          }
          @page {
            size: A5 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCodeStandee;
