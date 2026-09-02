import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mic, Image as ImageIcon, Heart, Download, Loader, Printer } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const HostGallery = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .or('photo_url.not.is.null,audio_url.not.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (err) {
      console.error("Error fetching memories:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadSingle = async (memo) => {
    try {
      setDownloadingId(memo.id);
      const zip = new JSZip();
      const safeName = (memo.name || 'Guest').replace(/[^a-zA-Z0-9ก-๙]/g, '_');
      const folderName = `${safeName}_${memo.id.substring(0, 4)}`;
      const folder = zip.folder(folderName);
      
      if (memo.photo_url) {
        const urls = memo.photo_url.split(',');
        for (let i = 0; i < urls.length; i++) {
          const response = await fetch(urls[i]);
          const blob = await response.blob();
          folder.file(`photo_${i + 1}.jpg`, blob);
        }
      }
      
      if (memo.audio_url) {
        const response = await fetch(memo.audio_url);
        const blob = await response.blob();
        const ext = memo.audio_url.split('.').pop().split('?')[0] || 'mp3';
        folder.file(`audio.${ext}`, blob);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
    } catch (error) {
      console.error("Download error:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด อาจเป็นเพราะไฟล์มีขนาดใหญ่เกินไป หรือเบราว์เซอร์บล็อกการโหลดข้ามโดเมนครับ");
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadAll = async () => {
    try {
      setDownloadingAll(true);
      const zip = new JSZip();
      
      for (const memo of memories) {
        const safeName = (memo.name || 'Guest').replace(/[^a-zA-Z0-9ก-๙]/g, '_');
        const folderName = `${safeName}_${memo.id.substring(0, 4)}`;
        const folder = zip.folder(folderName);
        
        if (memo.photo_url) {
          const urls = memo.photo_url.split(',');
          for (let i = 0; i < urls.length; i++) {
            const response = await fetch(urls[i]).catch(() => null);
            if (response && response.ok) {
              const blob = await response.blob();
              folder.file(`photo_${i + 1}.jpg`, blob);
            }
          }
        }
        
        if (memo.audio_url) {
          const response = await fetch(memo.audio_url).catch(() => null);
          if (response && response.ok) {
            const blob = await response.blob();
            const ext = memo.audio_url.split('.').pop().split('?')[0] || 'mp3';
            folder.file(`audio.${ext}`, blob);
          }
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `All_Memories_TandT_Wedding.zip`);
    } catch (error) {
      console.error("Download All error:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดทั้งหมดครับ");
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f6f0', padding: '40px 20px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-cursive)', fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '10px' }}>
            Memories Gallery
          </h1>
          <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '20px' }}>
            รวบรวมรูปภาพและเสียงอวยพรจากแขกคนสำคัญ
          </p>
          
          {memories.length > 0 && (
            <button 
              onClick={downloadAll}
              disabled={downloadingAll}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: 'var(--primary)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '30px', 
                fontSize: '1rem', 
                cursor: downloadingAll ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(229, 196, 196, 0.4)',
                opacity: downloadingAll ? 0.7 : 1
              }}
            >
              {downloadingAll ? <Loader className="animate-spin" size={18} /> : <Download size={18} />}
              {downloadingAll ? 'กำลังเตรียมไฟล์ทั้งหมด (อาจใช้เวลานาน)...' : 'ดาวน์โหลดทั้งหมด (.zip)'}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>กำลังโหลดความทรงจำ...</div>
        ) : memories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999', backgroundColor: '#fff', borderRadius: '15px' }}>
            ยังไม่มีรูปภาพหรือเสียงอวยพรในขณะนี้ครับ
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '30px',
            alignItems: 'start'
          }}>
            {memories.map((memo) => (
              <div key={memo.id} style={{ 
                backgroundColor: '#fff', 
                borderRadius: '15px', 
                padding: '20px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '1.2rem' }}>{memo.name}</h3>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {memo.photo_url && (
                      <button 
                        onClick={() => window.open(`/print?id=${memo.id}`, '_blank')}
                        title="ปริ้นท์รูปนี้"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--primary)', 
                          cursor: 'pointer',
                          padding: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Printer size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => downloadSingle(memo)}
                      disabled={downloadingId === memo.id}
                      title="ดาวน์โหลดของคนนี้"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: downloadingId === memo.id ? '#ccc' : 'var(--primary)', 
                        cursor: downloadingId === memo.id ? 'not-allowed' : 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {downloadingId === memo.id ? <Loader className="animate-spin" size={20} /> : <Download size={20} />}
                    </button>
                  </div>
                </div>
                
                {/* Render Photos */}
                {memo.photo_url && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
                    {memo.photo_url.split(',').map((url, idx) => (
                      <div key={idx} style={{ 
                        backgroundColor: '#fff', 
                        padding: '10px 10px 30px 10px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
                        transform: `rotate(${idx % 2 === 0 ? '-2deg' : '2deg'})`
                      }}>
                        <img src={url} alt={`photo-${idx}`} style={{ width: '100%', display: 'block', backgroundColor: '#f0f0f0' }} loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Audio */}
                {memo.audio_url && (
                  <div style={{ 
                    backgroundColor: '#f1f5f9', 
                    borderRadius: '10px', 
                    padding: '15px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#475569' }}>
                      <Mic size={16} /> 
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>เสียงอวยพร</span>
                    </div>
                    <audio src={memo.audio_url} controls style={{ width: '100%', height: '35px' }}></audio>
                  </div>
                )}

                {/* Optional Message */}
                {memo.message && memo.message !== 'ส่งความทรงจำผ่าน Photo Booth' && memo.message !== 'ส่งรูปภาพ/เสียงอวยพร' && (
                  <p style={{ marginTop: '15px', color: '#555', fontStyle: 'italic', fontSize: '0.95rem' }}>
                    "{memo.message}"
                  </p>
                )}

                <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '0.8rem', color: '#aaa' }}>
                  {new Date(memo.created_at).toLocaleString('th-TH')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostGallery;
