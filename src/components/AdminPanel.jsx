import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const API_BASE = `http://${window.location.hostname}:3005`;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('config'); // config, rsvp, guestbook
  const [rsvps, setRsvps] = useState([]);
  const [guestbook, setGuestbook] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [building, setBuilding] = useState(false);
  const [message, setMessage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);

  const fetchRsvps = async () => {
    const { data, error } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
    if (!error && data) setRsvps(data);
  };

  const fetchGuestbook = async () => {
    const { data, error } = await supabase.from('guestbook').select('*').order('created_at', { ascending: false });
    if (!error && data) setGuestbook(data);
  };

  useEffect(() => {
    if (activeTab === 'rsvp') fetchRsvps();
    if (activeTab === 'guestbook') fetchGuestbook();
  }, [activeTab]);

  const fetchGalleryImages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/gallery`);
      if (res.ok) {
        const data = await res.json();
        setGalleryImages(data);
      }
    } catch (err) {
      console.error('Failed to fetch gallery images');
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback to imported config on live site
        import('../data/config.json').then(module => {
          setConfig(module.default);
          setMessage('💡 โหมดดูข้อมูลแบบอ่านอย่างเดียว (สำหรับเว็บจริง)');
          setLoading(false);
        });
      });
      
    fetchGalleryImages();
  }, []);

  useEffect(() => {
    if (config) {
      document.title = '⚙️ Admin | ' + (config.siteTitle || 'Wedding');
    } else {
      document.title = '⚙️ Admin Panel';
    }
  }, [config?.siteTitle]);

  useEffect(() => {
    if (config?.theme?.colors) {
      const root = document.documentElement;
      root.style.setProperty('--primary', config.theme.colors.primary);
      root.style.setProperty('--primary-light', config.theme.colors.primaryLight);
      root.style.setProperty('--primary-dark', config.theme.colors.primaryDark);
      root.style.setProperty('--secondary', config.theme.colors.secondary);
      root.style.setProperty('--secondary-alt', config.theme.colors.secondaryAlt);
      root.style.setProperty('--text-main', config.theme.colors.textMain);
      root.style.setProperty('--text-light', config.theme.colors.textLight);
      root.style.setProperty('--bg-color', config.theme.colors.bgColor);
      root.style.setProperty('--border-color', config.theme.colors.borderColor);
    }
    if (config?.theme?.fonts) {
      const root = document.documentElement;
      root.style.setProperty('--font-heading', config.theme.fonts.heading);
      root.style.setProperty('--font-body', config.theme.fonts.body);
      root.style.setProperty('--font-cursive', config.theme.fonts.cursive);
    }
  }, [config?.theme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setMessage('✅ บันทึกข้อมูลสำเร็จ! กรุณารีเฟรชหน้าเว็บเพื่อดูผลลัพธ์');
      } else {
        setMessage('❌ เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (err) {
      setMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleBuild = async () => {
    setBuilding(true);
    setMessage('⏳ กำลังเตรียมไฟล์ (Building)... กรุณารอประมาณ 10-30 วินาที');
    try {
      const res = await fetch(`${API_BASE}/api/build`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ เตรียมไฟล์เสร็จสมบูรณ์! ไฟล์ทั้งหมดพร้อมใช้งานในโฟลเดอร์ "dist"');
      } else {
        setMessage('❌ เกิดข้อผิดพลาดในการเตรียมไฟล์: ' + (data.details || data.error));
      }
    } catch (err) {
      setMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
    setBuilding(false);
    setTimeout(() => setMessage(''), 10000);
  };

  const handleTextChange = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleColorChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          [key]: value
        }
      }
    }));
  };

  const handleFontChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        fonts: {
          ...prev.theme.fonts,
          [key]: value
        }
      }
    }));
  };

  const handleTimelineChange = (index, key, value) => {
    setConfig(prev => {
      const newTimeline = [...prev.timeline];
      newTimeline[index] = { ...newTimeline[index], [key]: value };
      return { ...prev, timeline: newTimeline };
    });
  };

  const handleAddTimeline = () => {
    setConfig(prev => ({
      ...prev,
      timeline: [...prev.timeline, { time: '00:00', title: 'กิจกรรมใหม่', description: '', icon: 'Heart' }]
    }));
  };

  const handleRemoveTimeline = (index) => {
    setConfig(prev => {
      const newTimeline = [...prev.timeline];
      newTimeline.splice(index, 1);
      return { ...prev, timeline: newTimeline };
    });
  };

  const handleDressCodeChange = (index, key, value) => {
    setConfig(prev => {
      const newColors = [...(prev.dressCode?.colors || [])];
      newColors[index] = { ...newColors[index], [key]: value };
      return {
        ...prev,
        dressCode: {
          ...prev.dressCode,
          colors: newColors
        }
      };
    });
  };

  const handleImageUpload = async (e, targetFilename) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('filename', targetFilename);

    setMessage('⏳ กำลังอัปโหลดและบีบอัดรูปภาพ...');
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setMessage('✅ อัปโหลดรูปภาพสำเร็จแล้ว! รูปจะเปลี่ยนไปอัตโนมัติ (อาจต้องเคลียร์แคชเบราว์เซอร์)');
        fetchGalleryImages(); // Refresh the list
      } else {
        setMessage('❌ อัปโหลดรูปภาพไม่สำเร็จ');
      }
    } catch (err) {
      setMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  const handleDeleteImage = async (filename) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพ ${filename}?`)) return;
    
    setMessage(`⏳ กำลังลบรูปภาพ ${filename}...`);
    try {
      const res = await fetch(`${API_BASE}/api/gallery/${filename}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessage(`✅ ลบรูปภาพ ${filename} สำเร็จแล้ว! (อาจต้องรีเฟรชหน้าเว็บหลัก)`);
        fetchGalleryImages(); // Refresh the list
      } else {
        setMessage('❌ ลบรูปภาพไม่สำเร็จ');
      }
    } catch (err) {
      setMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  const handleMusicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('music', file);

    setMessage('⏳ กำลังอัปโหลดไฟล์เพลง...');
    try {
      const res = await fetch(`${API_BASE}/api/upload-music`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setMessage('✅ อัปโหลดเพลงสำเร็จแล้ว! เพลงพื้นหลังจะเปลี่ยนไป (อาจต้องเคลียร์แคชเบราว์เซอร์)');
      } else {
        setMessage('❌ อัปโหลดเพลงไม่สำเร็จ');
      }
    } catch (err) {
      setMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>กำลังโหลดระบบหลังบ้าน...</div>;
  if (!config) return <div style={{ padding: '50px', color: 'red', textAlign: 'center' }}>{message}</div>;

  return (
    <div className="admin-container" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>⚙️ ระบบจัดการเว็บไซต์ (Admin Panel)</h1>
      
      {message && <div style={{ padding: '15px', backgroundColor: '#e2f0e5', color: '#2d6a4f', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>{message}</div>}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('config')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'config' ? 'var(--primary)' : '#eee', color: activeTab === 'config' ? 'white' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>⚙️ ตั้งค่าเว็บไซต์</button>
        <button onClick={() => setActiveTab('rsvp')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'rsvp' ? 'var(--primary)' : '#eee', color: activeTab === 'rsvp' ? 'white' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>💌 ข้อมูลผู้ตอบรับ (RSVP)</button>
        <button onClick={() => setActiveTab('guestbook')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'guestbook' ? 'var(--primary)' : '#eee', color: activeTab === 'guestbook' ? 'white' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>📖 สมุดอวยพร</button>
      </div>

      {activeTab === 'rsvp' && (
        <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2>💌 ข้อมูลผู้ตอบรับเข้าร่วมงาน (RSVP)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>ชื่อ (First Name)</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>นามสกุล (Last Name)</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>สถานะ (Attendance)</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>เวลาที่ตอบ (Time)</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#888' }}>ยังไม่มีข้อมูล</td></tr>
                ) : (
                  rsvps.map((rsvp) => (
                    <tr key={rsvp.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{rsvp.first_name}</td>
                      <td style={{ padding: '10px' }}>{rsvp.last_name}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', backgroundColor: rsvp.attendance.includes('ไปร่วมงาน') ? '#d4edda' : '#f8d7da', color: rsvp.attendance.includes('ไปร่วมงาน') ? '#155724' : '#721c24' }}>
                          {rsvp.attendance}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontSize: '0.85rem', color: '#666' }}>{new Date(rsvp.created_at).toLocaleString('th-TH')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'guestbook' && (
        <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2>📖 สมุดอวยพรออนไลน์ (Guestbook)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {guestbook.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>ยังไม่มีข้อความอวยพร</p>
            ) : (
              guestbook.map((msg) => (
                <div key={msg.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--primary-dark)', fontSize: '1.1rem' }}>{msg.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(msg.created_at).toLocaleString('th-TH')}</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', color: '#333', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                  
                  {msg.photo_url && (
                    <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                      {msg.photo_url.split(',').map((url, idx) => (
                        <img key={idx} src={url} alt={`Guest Photo ${idx}`} style={{ height: '150px', borderRadius: '8px', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                      ))}
                    </div>
                  )}
                  
                  {msg.audio_url && (
                    <div>
                      <audio src={msg.audio_url} controls style={{ width: '100%', height: '40px' }}></audio>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <div style={{ display: activeTab === 'config' ? 'block' : 'none' }}>
        {/* ตั้งค่าทั่วไป (General) */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>🌐 ตั้งค่าทั่วไป (General)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>ชื่อแท็บเว็บไซต์ (Site Title):</label>
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>ชื่อที่จะไปปรากฏอยู่บนแท็บของเบราว์เซอร์ (ตัวอย่าง: Wedding Toey & Taii)</p>
            <input type="text" value={config.siteTitle || ''} onChange={(e) => setConfig(prev => ({ ...prev, siteTitle: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving || building} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการข้อความเปิดซองจดหมาย */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>✉️ ข้อความหน้าเปิดซอง (Envelope)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>ข้อความด้านบน (Top Text):</label>
            <input type="text" value={config.envelope?.topText || ''} onChange={(e) => handleTextChange('envelope', 'topText', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>ตัวอักษรในตราประทับ (Seal Text):</label>
            <input type="text" value={config.envelope?.sealText || ''} onChange={(e) => handleTextChange('envelope', 'sealText', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>ข้อความด้านล่าง (Bottom Text):</label>
            <input type="text" value={config.envelope?.bottomText || ''} onChange={(e) => handleTextChange('envelope', 'bottomText', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving || building} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* 1. จัดการสีธีม */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>🎨 จัดการสี (Colors)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '180px' }}>สีหลัก (Primary): </label>
            <input type="color" value={config.theme.colors.primary} onChange={(e) => handleColorChange('primary', e.target.value)} />
            <input type="text" value={config.theme.colors.primary} onChange={(e) => handleColorChange('primary', e.target.value)} style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="#e8c8c8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '180px' }}>สีพื้นหลัง (Background): </label>
            <input type="color" value={config.theme.colors.bgColor} onChange={(e) => handleColorChange('bgColor', e.target.value)} />
            <input type="text" value={config.theme.colors.bgColor} onChange={(e) => handleColorChange('bgColor', e.target.value)} style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="#fdfaf5" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '180px' }}>สีพื้นหลังส่วนสลับ (Secondary BG): </label>
            <input type="color" value={config.theme.colors.secondary || '#fbf4e8'} onChange={(e) => handleColorChange('secondary', e.target.value)} />
            <input type="text" value={config.theme.colors.secondary || '#fbf4e8'} onChange={(e) => handleColorChange('secondary', e.target.value)} style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="#fbf4e8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '180px' }}>สีกล่อง/การ์ด (Card BG): </label>
            <input type="color" value={config.theme.colors.secondaryAlt || '#ffffff'} onChange={(e) => handleColorChange('secondaryAlt', e.target.value)} />
            <input type="text" value={config.theme.colors.secondaryAlt || '#ffffff'} onChange={(e) => handleColorChange('secondaryAlt', e.target.value)} style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="#ffffff" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '180px' }}>สีหัวข้อ/เข้มสุด (Heading/Dark): </label>
            <input type="color" value={config.theme.colors.primaryDark || '#c59797'} onChange={(e) => handleColorChange('primaryDark', e.target.value)} />
            <input type="text" value={config.theme.colors.primaryDark || '#c59797'} onChange={(e) => handleColorChange('primaryDark', e.target.value)} style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="#c59797" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '180px' }}>สีรองสว่าง (Primary Light): </label>
            <input type="color" value={config.theme.colors.primaryLight || '#f5e1e1'} onChange={(e) => handleColorChange('primaryLight', e.target.value)} />
            <input type="text" value={config.theme.colors.primaryLight || '#f5e1e1'} onChange={(e) => handleColorChange('primaryLight', e.target.value)} style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="#f5e1e1" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '180px' }}>สีข้อความหลัก (Text Main): </label>
            <input type="color" value={config.theme.colors.textMain} onChange={(e) => handleColorChange('textMain', e.target.value)} />
            <input type="text" value={config.theme.colors.textMain} onChange={(e) => handleColorChange('textMain', e.target.value)} style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="#b88686" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '180px' }}>สีข้อความรอง (Text Light): </label>
            <input type="color" value={config.theme.colors.textLight} onChange={(e) => handleColorChange('textLight', e.target.value)} />
            <input type="text" value={config.theme.colors.textLight} onChange={(e) => handleColorChange('textLight', e.target.value)} style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="#d4a3a3" />
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการฟอนต์ */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>🔤 จัดการฟอนต์ (Fonts)</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          ฟอนต์ถูกโหลดมาจาก Google Fonts แบบฟรี คุณสามารถเลือกฟอนต์สวยๆ สำหรับส่วนต่างๆ และดูตัวอย่างได้จากกล่องด้านขวาครับ
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ฟอนต์หัวข้อทั่วไป (Heading):</label>
              <select 
                value={config.theme.fonts.heading} 
                onChange={(e) => handleFontChange('heading', e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
              >
                <option value="'Playfair Display', serif">Playfair Display (หรูหรา คลาสสิก)</option>
                <option value="'Cormorant Garamond', serif">Cormorant Garamond (สไตล์โรแมนติก)</option>
                <option value="'Cinzel', serif">Cinzel (ทางการ สง่างาม)</option>
                <option value="'Prompt', sans-serif">Prompt (เรียบง่าย ทันสมัย)</option>
                <option value="'Kanit', sans-serif">Kanit (วัยรุ่น สไตล์โมเดิร์น)</option>
                <option value="'Sarabun', sans-serif">Sarabun (ทางการ อ่านสบาย)</option>
                <option value="'Mali', cursive">Mali (น่ารัก เป็นกันเอง)</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ฟอนต์ข้อความทั่วไป (Body):</label>
              <select 
                value={config.theme.fonts.body} 
                onChange={(e) => handleFontChange('body', e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
              >
                <option value="'Prompt', sans-serif">Prompt (อ่านง่าย นิยมสุด)</option>
                <option value="'Kanit', sans-serif">Kanit (วัยรุ่น ทันสมัย)</option>
                <option value="'Sarabun', sans-serif">Sarabun (ทางการ อ่านสบาย)</option>
                <option value="'Mali', cursive">Mali (น่ารัก เป็นกันเอง)</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ฟอนต์ตัวอักษรวิจิตร (Cursive - สำหรับตัวย่อชื่อ/โลโก้):</label>
              <select 
                value={config.theme.fonts.cursive} 
                onChange={(e) => handleFontChange('cursive', e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
              >
                <option value="'Great Vibes', cursive">Great Vibes (ตัวเขียนภาษาอังกฤษ พริ้วไหว)</option>
                <option value="'Charm', cursive">Charm (ตัวเขียนรองรับภาษาไทย)</option>
                <option value="'Playfair Display', serif">Playfair Display (ตัวพิมพ์ใหญ่ หรูหรา)</option>
                <option value="'Cinzel', serif">Cinzel (ตัวพิมพ์ใหญ่ สง่างาม)</option>
              </select>
            </div>
          </div>

          {/* กล่อง Preview */}
          <div style={{ backgroundColor: '#fcfcfc', padding: '20px', borderRadius: '8px', border: '2px dashed #ddd', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '200px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#999', fontSize: '14px', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>👀 Live Preview</h3>
            
            <div style={{ fontFamily: config.theme.fonts.cursive, fontSize: '3.5rem', color: config.theme.colors.primary, marginBottom: '15px', lineHeight: '1' }}>
              T & T
            </div>
            
            <div style={{ fontFamily: config.theme.fonts.heading, fontSize: '1.8rem', color: config.theme.colors.textMain, marginBottom: '15px' }}>
              ขอเชิญร่วมงานมงคลสมรส
            </div>
            
            <div style={{ fontFamily: config.theme.fonts.body, fontSize: '1rem', color: config.theme.colors.textLight, lineHeight: '1.6' }}>
              วันที่ 19 ธันวาคม 2569<br/>
              ณ อำเภออรัญประเทศ จังหวัดสระแก้ว<br/>
              You are invited to our wedding
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving || building} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* 2. จัดการข้อมูลหน้าแรก */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>📝 ข้อความหน้าแรก (Hero Section)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>หัวข้อย่อย:</label>
            <input type="text" value={config.hero.subtitle} onChange={(e) => handleTextChange('hero', 'subtitle', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ชื่อเจ้าสาว (เต็ม):</label>
              <input type="text" value={config.hero.name1} onChange={(e) => handleTextChange('hero', 'name1', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ชื่อเจ้าบ่าว (เต็ม):</label>
              <input type="text" value={config.hero.name2} onChange={(e) => handleTextChange('hero', 'name2', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>โลโก้ - อักษรซ้าย:</label>
              <input type="text" value={config.hero.logoChar1 || config.hero.name1.charAt(0)} onChange={(e) => handleTextChange('hero', 'logoChar1', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>โลโก้ - สัญลักษณ์ตรงกลาง:</label>
              <input type="text" value={config.hero.logoSymbol || '&'} onChange={(e) => handleTextChange('hero', 'logoSymbol', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>โลโก้ - อักษรขวา:</label>
              <input type="text" value={config.hero.logoChar2 || config.hero.name2.charAt(0)} onChange={(e) => handleTextChange('hero', 'logoChar2', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>วันที่ (Date):</label>
            <input type="text" value={config.hero.date} onChange={(e) => handleTextChange('hero', 'date', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>สถานที่ (ใต้ชื่อ):</label>
            <input type="text" value={config.hero.location} onChange={(e) => handleTextChange('hero', 'location', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>เปลี่ยนภาพพื้นหลังหน้าแรก (Background Image):</label>
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>ระบบจะนำรูปนี้ไปทับไฟล์เดิม (main_cover.JPG) และบีบอัดให้อัตโนมัติ</p>
            <input type="file" accept="image/jpeg, image/png" onChange={(e) => handleImageUpload(e, 'main_cover.JPG')} />
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการข้อความส่วนนับถอยหลัง */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>⏳ จัดการเวลานับถอยหลัง (Countdown)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>หัวข้อ (Title):</label>
            <input type="text" value={config.countdown?.title || ''} onChange={(e) => handleTextChange('countdown', 'title', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>วันที่แบบข้อความ (แสดงใต้หัวข้อ):</label>
            <input type="text" value={config.countdown?.dateText || ''} onChange={(e) => handleTextChange('countdown', 'dateText', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>วันที่ระบบใช้นับถอยหลังจริง (รูปแบบ: YYYY-MM-DDTHH:MM:SS):</label>
            <input type="text" value={config.countdown?.targetDate || ''} onChange={(e) => handleTextChange('countdown', 'targetDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>ตัวอย่าง: 2026-12-19T00:00:00 (หมายถึง เที่ยงคืนของวันที่ 19 ธันวาคม 2026)</p>
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการ Dress Code */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>👗 จัดการธีมสีเสื้อผ้า (Dress Code)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>หัวข้อ (Title):</label>
              <input type="text" value={config.dressCode?.title || ''} onChange={(e) => handleTextChange('dressCode', 'title', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>หัวข้อย่อย (Subtitle):</label>
              <input type="text" value={config.dressCode?.subtitle || ''} onChange={(e) => handleTextChange('dressCode', 'subtitle', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          
          <label style={{ display: 'block', fontWeight: 'bold', marginTop: '10px' }}>กำหนดสี (Colors):</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {(config.dressCode?.colors || []).map((item, index) => (
              <div key={index} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={item.color} 
                  onChange={(e) => handleDressCodeChange(index, 'color', e.target.value)} 
                  style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>โค้ดสี (HEX):</label>
                    <input 
                      type="text" 
                      value={item.color} 
                      onChange={(e) => handleDressCodeChange(index, 'color', e.target.value)} 
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} 
                      placeholder="#000000"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>ชื่อสี:</label>
                    <input 
                      type="text" 
                      value={item.label} 
                      onChange={(e) => handleDressCodeChange(index, 'label', e.target.value)} 
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการสถานที่จัดงาน */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>📍 จัดการสถานที่จัดงาน (Location)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>หัวข้อ (Title):</label>
              <input type="text" value={config.location.title} onChange={(e) => handleTextChange('location', 'title', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>หัวข้อย่อย (Subtitle):</label>
              <input type="text" value={config.location.subtitle} onChange={(e) => handleTextChange('location', 'subtitle', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>ชื่อสถานที่จัดงาน:</label>
            <input type="text" value={config.location.venueName} onChange={(e) => handleTextChange('location', 'venueName', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>รายละเอียดที่อยู่ (ใช้ &lt;br/&gt; เพื่อขึ้นบรรทัดใหม่):</label>
            <input type="text" value={config.location.venueAddress} onChange={(e) => handleTextChange('location', 'venueAddress', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ลิงก์แผนที่หลัก:</label>
              <input type="text" value={config.location.mapLink1} onChange={(e) => handleTextChange('location', 'mapLink1', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ชื่อปุ่มแผนที่หลัก:</label>
              <input type="text" value={config.location.mapLabel1} onChange={(e) => handleTextChange('location', 'mapLabel1', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ลิงก์แผนที่รอง (ปาร์ตี้/ฉลอง):</label>
              <input type="text" value={config.location.mapLink2} onChange={(e) => handleTextChange('location', 'mapLink2', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ชื่อปุ่มแผนที่รอง:</label>
              <input type="text" value={config.location.mapLabel2} onChange={(e) => handleTextChange('location', 'mapLabel2', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการกำหนดการ */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>⏱️ จัดการกำหนดการ (Timeline)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {config.timeline.map((item, index) => (
            <div key={index} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>เวลา:</label>
                  <input type="text" value={item.time} onChange={(e) => handleTimelineChange(index, 'time', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>ชื่อพิธี:</label>
                  <input type="text" value={item.title} onChange={(e) => handleTimelineChange(index, 'title', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>รายละเอียด (ถ้ามี):</label>
                  <input type="text" value={item.description} onChange={(e) => handleTimelineChange(index, 'description', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px' }}>ไอคอน (Clock/Heart/Music):</label>
                  <select 
                    value={item.icon} 
                    onChange={(e) => handleTimelineChange(index, 'icon', e.target.value)} 
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="Heart">❤️ หัวใจ (Heart)</option>
                    <option value="Clock">⏰ นาฬิกา (Clock)</option>
                    <option value="Coffee">☕ กาแฟ/ของว่าง (Coffee)</option>
                    <option value="Utensils">🍽️ อาหาร/จัดเลี้ยง (Utensils)</option>
                    <option value="Music">🎵 ดนตรี/ปาร์ตี้ (Music)</option>
                    <option value="Camera">📸 ถ่ายรูป (Camera)</option>
                    <option value="GlassWater">🥂 ดื่มฉลอง (GlassWater)</option>
                    <option value="PartyPopper">🎉 ปาร์ตี้ฉลอง (PartyPopper)</option>
                    <option value="Gift">🎁 มอบของขวัญ (Gift)</option>
                    <option value="Gem">แหวนเพชร (Gem)</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '10px', textAlign: 'right' }}>
                <button onClick={() => handleRemoveTimeline(index)} style={{ padding: '5px 10px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  🗑️ ลบกิจกรรมนี้
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '15px' }}>
          <button onClick={handleAddTimeline} style={{ padding: '8px 15px', backgroundColor: '#e2f0e5', color: '#2d6a4f', border: '1px solid #2d6a4f', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ เพิ่มกิจกรรมใหม่
          </button>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการของขวัญ / โอนเงิน */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>🎁 จัดการของขวัญ (Gift Registry)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>เงื่อนไขการแสดงผลหน้านี้ (Display Mode):</label>
            <select
              value={config.gift?.displayMode || 'auto'}
              onChange={(e) => handleTextChange('gift', 'displayMode', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }}
            >
              <option value="auto">📅 แสดงอัตโนมัติเมื่อถึงวันงาน (วันที่ 19 ธ.ค. 2569 เป็นต้นไป)</option>
              <option value="always">👁️ แสดงตลอดเวลา (เปิดให้เห็นทันที / สำหรับทดสอบ)</option>
              <option value="hidden">🚫 ซ่อนส่วนนี้ทั้งหมด</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>ชื่อธนาคาร:</label>
            <input type="text" value={config.gift?.bankName || ''} onChange={(e) => handleTextChange('gift', 'bankName', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>เลขบัญชี (รูปแบบ: xxx-x-xxxxx-x):</label>
              <input type="text" value={config.gift?.accountNumber || ''} onChange={(e) => handleTextChange('gift', 'accountNumber', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>ชื่อบัญชี:</label>
              <input type="text" value={config.gift?.accountName || ''} onChange={(e) => handleTextChange('gift', 'accountName', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>อัปโหลดภาพ QR Code ใหม่ (.jpg/.png):</label>
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>อัปโหลดเพื่อไปทับไฟล์เดิม (IMG_9342.JPG)</p>
            <input type="file" accept="image/jpeg, image/png" onChange={(e) => handleImageUpload(e, 'IMG_9342.JPG')} />
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการ Footer */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>📝 ข้อความส่วนท้าย (Footer)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>ข้อความลิขสิทธิ์ (Copyright):</label>
            <input type="text" value={config.footer?.copyrightText || ''} onChange={(e) => handleTextChange('footer', 'copyrightText', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการฐานข้อมูล */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '2px solid #e2f0e5' }}>
        <h2 style={{ color: '#2d6a4f' }}>🗄️ เชื่อมต่อฐานข้อมูล (Supabase Database)</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>ใช้สำหรับเก็บข้อมูลการตอบรับเข้าร่วมงาน (RSVP) และสมุดอวยพร (Guestbook)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Supabase Project URL:</label>
            <input type="text" value={config.database?.supabaseUrl || ''} onChange={(e) => handleTextChange('database', 'supabaseUrl', e.target.value)} placeholder="https://xxxx.supabase.co" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Supabase Anon Key:</label>
            <input type="text" value={config.database?.supabaseAnonKey || ''} onChange={(e) => handleTextChange('database', 'supabaseAnonKey', e.target.value)} placeholder="eyJh..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace' }} />
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกส่วนนี้'}
          </button>
        </div>
      </section>

      {/* จัดการเพลงพื้นหลัง */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>🎵 เปลี่ยนเพลงพื้นหลัง (Background Music)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>อัปโหลดไฟล์เพลงใหม่ (.mp3):</label>
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>ระบบจะนำไฟล์ไปทับเพลงเดิม (bgmusic.mp3) อัตโนมัติ ควรใช้ไฟล์ mp3 ที่มีขนาดไม่ใหญ่เกินไป</p>
            <input type="file" accept="audio/mpeg, audio/mp3" onChange={handleMusicUpload} />
          </div>
        </div>
      </section>

      {/* 3. คำแนะนำเพิ่มเติม */}
      <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2>🖼️ การจัดการรูปภาพแกลเลอรี</h2>
        <p>คุณสามารถอัปโหลดรูปภาพใหม่ไปทับไฟล์เดิม หรืออัปโหลดรูปใหม่ (เช่น pic21.jpg) เพื่อเพิ่มในแกลเลอรีได้</p>
        
        <div style={{ marginTop: '10px', padding: '15px', border: '1px dashed #ccc', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>อัปโหลดภาพแกลเลอรี (เช่น pic1.jpg, pic2.jpg):</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input type="text" placeholder="ชื่อไฟล์ปลายทาง เช่น pic1.jpg" id="galleryFileName" style={{ padding: '8px' }} defaultValue={`pic${galleryImages.length > 0 ? parseInt(galleryImages[galleryImages.length - 1].replace(/[^0-9]/g, '')) + 1 : 1}.jpg`} />
            <input type="file" accept="image/jpeg, image/png" onChange={(e) => {
              const filename = document.getElementById('galleryFileName').value;
              if (filename) handleImageUpload(e, filename);
            }} />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--primary-dark)' }}>รูปภาพที่มีในระบบ ({galleryImages.length} รูป)</h3>
          {galleryImages.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {galleryImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f9f9f9', padding: '5px' }}>
                  <img src={`/src/assets/${img}`} alt={img} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{img}</span>
                    <button 
                      onClick={() => handleDeleteImage(img)}
                      style={{ background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic' }}>ไม่พบรูปภาพในแกลเลอรี</p>
          )}
        </div>
      </section>

      </div> {/* Close config tab div */}

      <div style={{ display: activeTab === 'config' ? 'flex' : 'none', justifyContent: 'center', gap: '20px', marginTop: '40px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleSave} 
          disabled={saving || building}
          style={{ padding: '15px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', fontWeight: 'bold' }}
        >
          {saving ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลทั้งหมด'}
        </button>
        
        <button 
          onClick={handleBuild} 
          disabled={saving || building}
          style={{ padding: '15px 30px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', fontWeight: 'bold' }}
        >
          {building ? 'กำลังเตรียมไฟล์...' : '🚀 เตรียมไฟล์ไปขึ้นเว็บจริง'}
        </button>
      </div>

    </div>
  );
};

export default AdminPanel;
