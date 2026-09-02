import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, Mic, Square, Send, CheckCircle, ArrowLeft, Image as ImageIcon, Disc, Trash2, Download, QrCode, Printer, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import lamejs from 'lamejs';

const FILTERS = [
  { name: 'ปกติ (Normal)', value: 'none' },
  { name: 'ฟิล์ม (Film)', value: 'contrast(1.2) saturate(1.3) sepia(0.2)' },
  { name: 'วินเทจ (Vintage)', value: 'sepia(0.5) contrast(1.2) brightness(0.9) hue-rotate(-10deg)' },
  { name: 'ขาวดำ (B&W)', value: 'grayscale(100%) contrast(1.2)' },
  { name: 'ซีเปีย (Sepia)', value: 'sepia(100%)' }
];

const PhotoBooth = () => {
  const [step, setStep] = useState('name'); // 'name', 'select', 'photo', 'audio', 'uploading', 'success'
  const [name, setName] = useState('');
  const [insertedRecord, setInsertedRecord] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [selectedForPrint, setSelectedForPrint] = useState([]);
  
  // Camera state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]); // array of blob objects
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const MAX_PHOTOS = 5;

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Set default selected for print when entering success step
  useEffect(() => {
    if (step === 'success' && photos.length > 0) {
      setSelectedForPrint(photos.slice(0, 4).map((_, i) => i));
    }
  }, [step, photos]);

  const togglePrintSelection = (index) => {
    if (selectedForPrint.includes(index)) {
      setSelectedForPrint(prev => prev.filter(i => i !== index));
      setShowQR(false); // hide QR if they change selection
    } else {
      if (selectedForPrint.length >= 4) {
        alert("เลือกรูปสำหรับปริ้นท์ได้สูงสุด 4 รูปครับ");
        return;
      }
      setSelectedForPrint(prev => [...prev, index].sort());
      setShowQR(false);
    }
  };

  // ---- CAMERA LOGIC ----
  const startCamera = async (mode = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setStream(mediaStream);
      setFacingMode(mode);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("ไม่สามารถเข้าถึงกล้องได้ครับ");
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newMode);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (photos.length >= MAX_PHOTOS) {
      alert(`ถ่ายได้สูงสุด ${MAX_PHOTOS} รูปครับ`);
      return;
    }
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Apply CSS filter to canvas
      ctx.filter = activeFilter.value;
      
      // Mirror the image if it's a front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        setPhotos([...photos, { blob, preview: URL.createObjectURL(blob) }]);
      }, 'image/jpeg', 0.8);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  useEffect(() => {
    if (step === 'photo') {
      startCamera();
    } else {
      stopCamera();
    }
    
    // Stop recording if user leaves the audio step while recording
    if (step !== 'audio') {
      stopRecording();
    }

    return () => {
      stopCamera();
      stopRecording();
    };
  }, [step]);

  // ---- AUDIO LOGIC ----
  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorderRef.current ? mediaRecorderRef.current.mimeType : 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        audioStream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Audio error:", err);
      alert("ไม่สามารถเข้าถึงไมโครโฟนได้ครับ");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetAudio = () => {
    setAudioBlob(null);
    setAudioPreviewUrl(null);
  };

  // ---- UPLOAD LOGIC ----
  const convertToMp3 = async (webmBlob) => {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await webmBlob.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
        const mp3Data = [];
        
        const sampleBlockSize = 1152;
        const float32ToInt16 = (float32Array) => {
          const int16Array = new Int16Array(float32Array.length);
          for (let i = 0; i < float32Array.length; i++) {
            let s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          return int16Array;
        };

        if (channels === 1) {
          const left = audioBuffer.getChannelData(0);
          const leftInt16 = float32ToInt16(left);
          for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
            const sampleChunk = leftInt16.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
            if (mp3buf.length > 0) mp3Data.push(mp3buf);
          }
        } else {
          const left = audioBuffer.getChannelData(0);
          const right = audioBuffer.getChannelData(1);
          const leftInt16 = float32ToInt16(left);
          const rightInt16 = float32ToInt16(right);
          for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
            const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
            const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) mp3Data.push(mp3buf);
          }
        }
        
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
        
        resolve(new Blob(mp3Data, { type: 'audio/mpeg' }));
      } catch (e) {
        console.error("MP3 conversion failed:", e);
        reject(e);
      }
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (photos.length === 0 && !audioBlob) {
      alert("กรุณาถ่ายรูปหรืออัดเสียงอย่างน้อย 1 อย่างครับ");
      return;
    }

    setStep('uploading');
    const timestamp = Date.now();
    let photoUrls = [];
    let uploadedAudioUrl = null;

    try {
      // 1. Upload Photos
      for (let i = 0; i < photos.length; i++) {
        const photoName = `photo_${timestamp}_${i}.jpg`;
        const { error: photoError } = await supabase.storage
          .from('guest_media')
          .upload(photoName, photos[i].blob);
        
        if (photoError) throw photoError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('guest_media')
          .getPublicUrl(photoName);
        photoUrls.push(publicUrl);
      }

      // 2. Upload Audio
      if (audioBlob) {
        let finalAudioBlob = audioBlob;
        let ext = 'webm';
        
        try {
          // Convert to MP3
          finalAudioBlob = await convertToMp3(audioBlob);
          ext = 'mp3';
        } catch (convertErr) {
          console.warn("Falling back to native audio format", convertErr);
          ext = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
        }

        const audioName = `audio_${timestamp}.${ext}`;
        const { error: audioError } = await supabase.storage
          .from('guest_media')
          .upload(audioName, finalAudioBlob);
        
        if (audioError) throw audioError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('guest_media')
          .getPublicUrl(audioName);
        uploadedAudioUrl = publicUrl;
      }

      // 3. Save to database
      const { data: insertData, error: dbError } = await supabase
        .from('guestbook')
        .insert([
          { 
            name: name, 
            message: 'ส่งความทรงจำผ่าน Photo Booth',
            photo_url: photoUrls.join(','), // Store multiple urls as comma-separated string
            audio_url: uploadedAudioUrl
          }
        ])
        .select();

      if (dbError) throw dbError;

      setInsertedRecord(insertData[0]);
      setStep('success');

    } catch (err) {
      console.error("Upload error:", err);
      alert('เกิดข้อผิดพลาด: ' + err.message);
      setStep('select');
    }
  };

  // ---- RENDERERS ----
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdfbf7', fontFamily: 'var(--font-body)', padding: '20px', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', position: 'relative' }}>
        
        {/* Navigation Bar */}
        {(step === 'select' || step === 'photo' || step === 'audio') && (
          <button onClick={() => setStep(step === 'select' ? 'name' : 'select')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', color: '#888', cursor: 'pointer', marginBottom: '20px' }}>
            <ArrowLeft size={18} /> ย้อนกลับ
          </button>
        )}

        {/* STEP 1: NAME */}
        {step === 'name' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '40px 0' }}>
            <h1 style={{ fontFamily: 'var(--font-cursive)', fontSize: '3rem', color: 'var(--primary)', marginBottom: '10px' }}>Welcome</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>สมุดลงนามอินเทอร์แอกทีฟ</p>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="พิมพ์ชื่อของคุณตรงนี้..." 
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #eee', fontSize: '1.2rem', textAlign: 'center', marginBottom: '20px' }}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep('select')}
            />
            <button 
              onClick={() => name.trim() && setStep('select')}
              style={{ width: '100%', padding: '15px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer', opacity: name.trim() ? 1 : 0.5 }}
              disabled={!name.trim()}
            >
              เข้าสู่ระบบความทรงจำ
            </button>
          </motion.div>
        )}

        {/* STEP 2: SELECT */}
        {step === 'select' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>สวัสดีคุณ <span style={{ color: 'var(--primary)' }}>{name}</span><br/><span style={{fontSize:'1rem', color:'#666', fontWeight:'normal'}}>อยากฝากความทรงจำแบบไหนดีครับ?</span></h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button onClick={() => setStep('photo')} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '15px', border: '2px solid #eee', backgroundColor: '#fff', cursor: 'pointer', gap: '15px', transition: 'all 0.2s' }}>
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '15px', borderRadius: '50%', color: 'var(--primary)' }}><Camera size={30} /></div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>ถ่ายรูปโพลารอยด์</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{photos.length > 0 ? `ถ่ายแล้ว ${photos.length} รูป (กดเพื่อถ่ายเพิ่ม)` : 'ถ่ายได้สูงสุด 5 รูป พร้อมฟิลเตอร์'}</p>
                </div>
                {photos.length > 0 && <CheckCircle color="var(--primary)" size={24} />}
              </button>

              <button onClick={() => setStep('audio')} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '15px', border: '2px solid #eee', backgroundColor: '#fff', cursor: 'pointer', gap: '15px', transition: 'all 0.2s' }}>
                <div style={{ backgroundColor: '#e8f4f8', padding: '15px', borderRadius: '50%', color: '#0077b6' }}><Mic size={30} /></div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>อัดเสียงอวยพร</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{audioBlob ? 'บันทึกเสียงเรียบร้อยแล้ว (กดเพื่ออัดใหม่)' : 'ฝากข้อความเสียงผ่านเทปคาสเซ็ท'}</p>
                </div>
                {audioBlob && <CheckCircle color="#0077b6" size={24} />}
              </button>
            </div>

            {/* PREVIEW SECTION BEFORE SENDING */}
            {(photos.length > 0 || audioBlob) && (
              <div style={{ marginTop: '25px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '15px', border: '1px dashed #ccc' }}>
                <h4 style={{ margin: '0 0 15px 0', textAlign: 'center', color: '#555' }}>ความทรงจำของคุณที่พร้อมส่ง</h4>
                
                {photos.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: audioPreviewUrl ? '15px' : '0' }}>
                    {photos.map((p, idx) => (
                      <img key={idx} src={p.preview} alt={`preview-${idx}`} style={{ height: '70px', borderRadius: '5px', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                    ))}
                  </div>
                )}
                
                {audioPreviewUrl && (
                  <audio src={audioPreviewUrl} controls style={{ width: '100%', height: '35px' }}></audio>
                )}
              </div>
            )}

            {(photos.length > 0 || audioBlob) && (
              <button onClick={handleSubmit} style={{ width: '100%', padding: '15px', backgroundColor: '#2b2d42', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 5px 15px rgba(43,45,66,0.3)' }}>
                <Send size={20} /> ส่งข้อมูลทั้งหมดให้บ่าวสาว
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 3: PHOTO BOOTH */}
        {step === 'photo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>📸 โฟโต้บูธ</h3>
              <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '5px 10px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {photos.length} / {MAX_PHOTOS}
              </span>
            </div>

            {/* Polaroid UI */}
            <div style={{ backgroundColor: '#fff', padding: '15px 15px 40px 15px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', borderRadius: '5px', margin: '0 auto 20px', maxWidth: '300px', transform: 'rotate(-2deg)' }}>
              <div style={{ backgroundColor: '#000', borderRadius: '3px', overflow: 'hidden', position: 'relative', aspectRatio: '3/4' }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: activeFilter.value, transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                ></video>
                <button 
                  onClick={switchCamera}
                  style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                >
                  <RefreshCw size={20} color="#333" />
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '15px', fontFamily: 'var(--font-cursive)', fontSize: '1.5rem', color: '#555' }}>T&T Wedding</div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            {/* Filter Selector */}
            <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px', marginBottom: '20px', justifyContent: 'center' }}>
              {FILTERS.map(filter => (
                <button 
                  key={filter.name}
                  onClick={() => setActiveFilter(filter)}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '20px', 
                    border: '1px solid',
                    borderColor: activeFilter.name === filter.name ? 'var(--primary)' : '#ddd',
                    backgroundColor: activeFilter.name === filter.name ? 'var(--primary)' : '#fff',
                    color: activeFilter.name === filter.name ? '#fff' : '#666',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontSize: '0.8rem'
                  }}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {/* Camera Controls */}
            <button 
              onClick={takePhoto} 
              disabled={photos.length >= MAX_PHOTOS}
              style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: photos.length >= MAX_PHOTOS ? '#ccc' : 'var(--primary)', color: '#fff', border: '5px solid #f0f0f0', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', cursor: photos.length >= MAX_PHOTOS ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}
            >
              <Camera size={30} />
            </button>

            {/* Thumbnail Gallery */}
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', borderTop: '1px solid #eee' }}>
                {photos.map((p, idx) => (
                  <div key={idx} style={{ position: 'relative', minWidth: '60px' }}>
                    <img src={p.preview} alt={`pic-${idx}`} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '5px', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
                    <button onClick={() => removePhoto(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#e63946', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button onClick={() => setStep('select')} style={{ width: '100%', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '12px', marginTop: '10px', cursor: 'pointer' }}>
              เสร็จสิ้นการถ่ายรูป
            </button>
          </motion.div>
        )}

        {/* STEP 4: AUDIO TAPE */}
        {step === 'audio' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '30px' }}>📼 เทปเสียงอวยพร</h3>

            {/* Cassette Tape UI */}
            <div style={{ width: '100%', maxWidth: '300px', height: '180px', backgroundColor: '#d1d5db', borderRadius: '15px', position: 'relative', border: '2px solid #9ca3af', margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.1)' }}>
              {/* Tape Sticker */}
              <div style={{ width: '85%', height: '65%', backgroundColor: '#fef3c7', borderRadius: '8px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fbbf24' }}>
                <div style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', fontFamily: 'var(--font-cursive)', fontSize: '1.2rem', color: '#b45309' }}>Side A: {name}</div>
                {/* Reels Window */}
                <div style={{ width: '70%', height: '40px', backgroundColor: '#374151', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', padding: '0 15px', alignItems: 'center', marginTop: '10px' }}>
                  {/* Left Reel */}
                  <motion.div animate={{ rotate: isRecording ? 360 : 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ width: '30px', height: '30px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid #9ca3af', borderRadius: '50%' }}></div>
                  </motion.div>
                  {/* Right Reel */}
                  <motion.div animate={{ rotate: isRecording ? 360 : 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ width: '30px', height: '30px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid #9ca3af', borderRadius: '50%' }}></div>
                  </motion.div>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: '-2px', width: '60%', height: '20px', backgroundColor: '#9ca3af', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}></div>
            </div>

            {/* Audio Controls */}
            {!audioPreviewUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                {!isRecording ? (
                  <button onClick={startRecording} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px', backgroundColor: '#e63946', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(230,57,70,0.3)' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%' }}></div> กดเพื่อบันทึกเสียง
                  </button>
                ) : (
                  <motion.button animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1 }} onClick={stopRecording} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '1.1rem', cursor: 'pointer' }}>
                    <Square size={16} fill="#fff" /> หยุดบันทึก
                  </motion.button>
                )}
              </div>
            )}

            {audioPreviewUrl && (
              <div style={{ marginTop: '20px' }}>
                <audio src={audioPreviewUrl} controls style={{ width: '100%', marginBottom: '15px' }}></audio>
                <button onClick={resetAudio} style={{ padding: '10px 20px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <RefreshCw size={16} /> อัดใหม่
                </button>
              </div>
            )}

            <button onClick={() => setStep('select')} style={{ width: '100%', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '12px', marginTop: '30px', cursor: 'pointer' }}>
              เสร็จสิ้นการอัดเสียง
            </button>
          </motion.div>
        )}

        {/* STEP 5: UPLOADING & SUCCESS */}
        {step === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ margin: '0 auto 20px', width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid var(--primary)', borderRadius: '50%' }}></motion.div>
            <h3>กำลังส่งข้อมูลแห่งความทรงจำ...</h3>
            <p style={{ color: '#666' }}>กรุณารอสักครู่นะครับ</p>
          </div>
        )}

        {step === 'success' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={80} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: 'var(--primary-dark)' }}>ส่งเรียบร้อย!</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>ขอบคุณ <strong>{name}</strong> ที่ร่วมบันทึกความทรงจำกับเราครับ</p>
            
            {/* QR Code Section for Auto-Print */}
            {photos.length > 0 && insertedRecord && (
              <div style={{ marginBottom: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>📸 เลือกรูปที่ต้องการปริ้นท์ (สูงสุด 4 รูป)</h4>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: '#888' }}>กดที่รูปเพื่อเลือกรูปที่จะปรากฏใน Photo Booth Strip</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                  {photos.map((p, idx) => {
                    const isSelected = selectedForPrint.includes(idx);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => togglePrintSelection(idx)}
                        style={{ 
                          position: 'relative', 
                          cursor: 'pointer', 
                          border: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          opacity: isSelected ? 1 : 0.5,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <img src={p.preview} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '50%', padding: '2px' }}>
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!showQR ? (
                  <button 
                    onClick={() => setShowQR(true)}
                    disabled={selectedForPrint.length !== Math.min(4, photos.length)}
                    style={{ padding: '12px 20px', backgroundColor: selectedForPrint.length !== Math.min(4, photos.length) ? '#ccc' : '#fff', border: `2px solid ${selectedForPrint.length !== Math.min(4, photos.length) ? '#ccc' : 'var(--primary)'}`, color: selectedForPrint.length !== Math.min(4, photos.length) ? '#fff' : 'var(--primary)', borderRadius: '12px', fontSize: '1rem', cursor: selectedForPrint.length !== Math.min(4, photos.length) ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}
                  >
                    <QrCode size={18} /> สแกนเพื่อปริ้นท์รูป (ต้องเลือก {Math.min(4, photos.length)} รูป)
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#fdfbf7', padding: '20px', borderRadius: '15px', border: '2px dashed var(--primary)', display: 'inline-block' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Scan me at the Print Station</h4>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/print?id=${insertedRecord.id}&s=${selectedForPrint.join(',')}`)}`} 
                      alt="Print QR Code" 
                      style={{ width: '150px', height: '150px' }}
                    />
                    <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: '#888' }}>นำ QR Code นี้ไปสแกนที่หน้าคอมพิวเตอร์เพื่อปริ้นท์รูปอัตโนมัติ</p>
                  </motion.div>
                )}
              </div>
            )}

            {photos.length > 0 && (
              <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>ดาวน์โหลดรูปเก็บไว้เป็นที่ระลึก</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  {photos.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <img src={p.preview} alt={`dl-${idx}`} style={{ width: '100%', borderRadius: '8px', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                      <a 
                        href={p.preview} 
                        download={`T&T_Wedding_${idx + 1}.jpg`}
                        style={{ padding: '8px', backgroundColor: 'var(--primary)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <Download size={16} /> โหลดรูปนี้
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => { 
                setName(''); 
                setPhotos([]); 
                setAudioBlob(null); 
                setAudioPreviewUrl(null); 
                setInsertedRecord(null);
                setShowQR(false);
                setSelectedForPrint([]);
                setStep('name'); 
              }}
              style={{ width: '100%', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              เริ่มต้นใหม่
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default PhotoBooth;
