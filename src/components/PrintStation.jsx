import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Printer, Camera, QrCode, X } from 'lucide-react';

const PrintStation = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);
  
  // Scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const keysRef = useRef('');
  const lastKeyTime = useRef(0);
  const scannerRef = useRef(null);

  // 1. Keyboard Scanner Listener (For USB-C Scanner Gun)
  useEffect(() => {
    if (id) return; // Don't listen if we're already printing

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field (just in case)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      
      // If time between keystrokes is too long (> 100ms), it's likely a human typing, reset the buffer
      if (currentTime - lastKeyTime.current > 100) {
        keysRef.current = '';
      }
      lastKeyTime.current = currentTime;

      if (e.key === 'Enter') {
        const text = keysRef.current;
        keysRef.current = ''; // clear buffer
        
        // Extract ID from scanned text
        if (text) {
          const match = text.match(/id=([^&]+)/);
          if (match && match[1]) {
            window.location.href = `/print?id=${match[1]}`;
          } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text)) {
            // Direct UUID fallback
            window.location.href = `/print?id=${text}`;
          } else {
            console.log("Scanned text does not contain a valid ID:", text);
          }
        }
      } else if (e.key.length === 1) {
        keysRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [id]);

  // 2. Camera Scanner (For USB-C Webcam)
  useEffect(() => {
    if (cameraActive && !id) {
      // Initialize only if it doesn't exist
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }
      
      scannerRef.current.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
              setCameraActive(false);
              const match = decodedText.match(/id=([^&]+)/);
              if (match && match[1]) {
                 window.location.href = `/print?id=${match[1]}`;
              } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedText)) {
                 window.location.href = `/print?id=${decodedText}`;
              } else {
                 alert("QR Code ไม่ถูกต้อง: " + decodedText);
              }
            }).catch(e => console.error(e));
          }
        },
        (err) => {
          // ignore frame scan errors
        }
      ).catch((err) => {
        console.error("Camera start error:", err);
        alert("เกิดข้อผิดพลาดในการเปิดกล้อง: " + err);
        setCameraActive(false);
      });
    }

    return () => {
      // Cleanup on unmount or when camera turns off
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
            scannerRef.current = null;
          }).catch(console.error);
        } else {
          scannerRef.current.clear();
          scannerRef.current = null;
        }
      }
    };
  }, [cameraActive, id]);

  // 3. Fetch Print Record
  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }
  }, [id]);

  const fetchRecord = async (recordId) => {
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) throw error;
      
      if (!data.photo_url) {
        throw new Error("ไม่พบรูปภาพในรหัสนี้");
      }

      setRecord(data);
      
      // Give images a second to load before opening print dialog
      setTimeout(() => {
        window.print();
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // ---- RENDER LOGIC ----

  if (!id) {
    // READY TO SCAN UI
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfbf7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#fff', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          
          <Printer size={60} color="var(--primary)" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontFamily: 'var(--font-cursive)', fontSize: '2.5rem', color: 'var(--primary-dark)', marginBottom: '10px', marginTop: 0 }}>Smart Print Station</h1>
          <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '40px' }}>
            พร้อมใช้งาน! สามารถใช้ <strong style={{color: 'var(--primary)'}}>เครื่องสแกนบาร์โค้ด (USB)</strong> สแกน QR Code จากจอมือถือของแขกได้เลยทันที (ไม่ต้องกดปุ่มใดๆ)
          </p>

          <div style={{ position: 'relative', borderTop: '2px dashed #eee', paddingTop: '30px', marginTop: '10px' }}>
            <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '0 15px', color: '#999', fontSize: '0.9rem' }}>หรือ</span>
            
            {!cameraActive ? (
              <button 
                onClick={() => setCameraActive(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                <Camera size={20} /> เปิดกล้องเพื่อสแกน QR Code (Webcam)
              </button>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: '#333' }}>กำลังเปิดกล้อง...</h4>
                  <button onClick={() => setCameraActive(false)} style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <X size={18} /> ปิดกล้อง
                  </button>
                </div>
                <div id="qr-reader" style={{ width: '100%', borderRadius: '15px', overflow: 'hidden', border: '2px solid #eee' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PRINTING UI (Has ID)
  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}><h2>เกิดข้อผิดพลาด</h2><p>{error}</p><button onClick={() => window.location.href='/print'} style={{marginTop:'20px', padding:'10px 20px'}}>กลับไปหน้าสแกน</button></div>;
  }

  if (!record) {
    return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>กำลังดึงข้อมูลเพื่อเตรียมปริ้นท์...</div>;
  }

  const allPhotos = record.photo_url.split(',');
  const sParam = searchParams.get('s');
  
  let printPhotos = allPhotos;
  if (sParam) {
    const indices = sParam.split(',').map(Number).filter(n => !isNaN(n) && n >= 0 && n < allPhotos.length);
    if (indices.length > 0) {
      printPhotos = indices.map(i => allPhotos[i]);
    }
  }

  return (
    <div className="print-container" style={{ backgroundColor: '#ccc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      {/* Print Layout Styling */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { background: #fff; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { background: #fff !important; padding: 0 !important; align-items: flex-start !important; }
        }
        
        .print-page {
          width: 2.2in;
          height: auto;
          min-height: 6.5in;
          background: #fff;
          display: flex;
          flex-direction: column;
          padding: 0.15in;
          gap: 0.1in;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          box-sizing: border-box;
          margin: 0 auto;
        }
        
        @media print {
          .print-page { box-shadow: none; margin: 0.2in auto; }
        }

        .photo-wrapper {
          width: 100%;
          aspect-ratio: 4/3;
          background-color: #f0f0f0;
          overflow: hidden;
          border-radius: 6px;
        }
        
        .photo-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .strip-footer {
          text-align: center;
          margin-top: 0.1in;
          padding-bottom: 0.05in;
        }
        
        .strip-footer h2 {
          margin: 0;
          font-family: var(--font-cursive), 'Brush Script MT', cursive;
          font-size: 1.4rem;
          color: #000;
          line-height: 1.2;
        }
        
        .strip-footer p {
          margin: 4px 0 0 0;
          font-size: 0.55rem;
          color: #555;
          font-family: sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      {/* Action Button (Hidden on Print) */}
      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 100 }}>
        <button onClick={() => window.location.href='/print'} style={{ padding: '10px 20px', backgroundColor: '#e63946', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <X size={16} /> กลับไปหน้าสแกน
        </button>
        <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <Printer size={16} /> สั่งปริ้นท์อีกครั้ง
        </button>
      </div>

      <div className="print-page">
        {/* Render exactly 4 photos as a single strip */}
        {printPhotos.slice(0, 4).map((url, idx) => (
          <div key={idx} className="photo-wrapper">
            <img src={url} alt={`print-${idx}`} />
          </div>
        ))}
        
        {/* Footer Text / Logo */}
        <div className="strip-footer">
          <h2>T&T Wedding</h2>
          <p>{new Date(record.created_at).toLocaleDateString('th-TH')} • {record.name}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintStation;
