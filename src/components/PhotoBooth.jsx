import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Camera, 
  Mic, 
  Square, 
  Send, 
  CheckCircle, 
  ArrowLeft, 
  Image as ImageIcon, 
  Disc, 
  Trash2, 
  Download, 
  RefreshCw,
  Share2,
  Timer,
  Sparkles,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import lamejs from 'lamejs';

// Wedding Theme Frames (1080x1920 PNG transparent)
const FRAMES = [
  { 
    id: 'arch', 
    name: '🌸 ซุ้มโค้ง (Romantic Arch)', 
    shortName: 'ซุ้มโค้ง', 
    src: '/frames/filter_1_romantic_arch.png',
    preview: '/frames/preview_1_romantic_arch.jpg',
    desc: 'เรียบหรู โรแมนติก'
  },
  { 
    id: 'studio', 
    name: '📸 โมเดิร์น (Modern Studio)', 
    shortName: 'โมเดิร์นสตูดิโอ', 
    src: '/frames/filter_2_modern_studio.png',
    preview: '/frames/preview_2_modern_studio.jpg',
    desc: 'เปิดโล่ง สไตล์สตูดิโอ'
  },
  { 
    id: 'none', 
    name: '🚫 ไม่ใส่กรอบ', 
    shortName: 'ไม่มีกรอบ', 
    src: null,
    preview: null,
    desc: 'ภาพต้นฉบับ'
  }
];

// Color & Camera Filters with Beauty Skin Smoothing (TikTok Style)
const FILTERS = [
  { 
    name: '🌸 หน้าใส TikTok', 
    value: 'brightness(1.10) contrast(0.96) saturate(1.08)',
    beauty: true,
    beautyAlpha: 0.38,
    beautyBlend: 'screen',
    beautyFilter: 'blur(12px) brightness(1.18) contrast(0.90) saturate(1.06)'
  },
  { 
    name: '✨ เนียนไร้สิว', 
    value: 'brightness(1.08) contrast(0.94) saturate(1.05)',
    beauty: true,
    beautyAlpha: 0.35,
    beautyBlend: 'source-over',
    beautyFilter: 'blur(10px) brightness(1.12) contrast(0.92)'
  },
  { 
    name: '🍑 ผิวอมชมพู', 
    value: 'brightness(1.09) contrast(0.97) saturate(1.14) sepia(0.06) hue-rotate(-8deg)',
    beauty: true,
    beautyAlpha: 0.36,
    beautyBlend: 'screen',
    beautyFilter: 'blur(12px) brightness(1.16) contrast(0.90) saturate(1.12) sepia(0.08) hue-rotate(-8deg)'
  },
  { name: '✨ ผิวผ่อง (Glow)', value: 'brightness(1.06) contrast(1.02) saturate(1.08)' },
  { name: '☕ โทนอุ่น (Warm)', value: 'sepia(0.18) saturate(1.15) brightness(1.02)' },
  { name: '🎞️ ฟิล์ม (Film)', value: 'contrast(1.15) saturate(1.2) sepia(0.15)' },
  { name: '🖤 ขาวดำ (B&W)', value: 'grayscale(100%) contrast(1.2)' },
  { name: 'ปกติ', value: 'none' }
];

const PhotoBooth = () => {
  const [step, setStep] = useState('name'); // 'name', 'select', 'photo', 'audio', 'uploading', 'success'
  const [name, setName] = useState('');
  const [insertedRecord, setInsertedRecord] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Camera state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]); // array of { blob, preview, frameName }
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [activeFrame, setActiveFrame] = useState(FRAMES[0]);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [timerSeconds, setTimerSeconds] = useState(0); // 0 = off, 3 = 3s
  const [countdown, setCountdown] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const MAX_PHOTOS = 5;

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Social Share Helpers
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/memories`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleLineShare = () => {
    const text = `ภาพความทรงจำงานแต่ง Taii & Toey 💍✨ #TAIITOEYWEDDING\nดูรูปภาพและคำอวยพรได้ที่: ${window.location.origin}/memories`;
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const shareUrl = `${window.location.origin}/memories`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const handleDownloadAll = () => {
    photos.forEach((p, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = p.preview;
        link.download = `Taii_Toey_Wedding_${idx + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 350);
    });
  };

  // ---- CAMERA LOGIC ----
  const startCamera = async (mode = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setFacingMode(mode);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Fallback to basic video constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (e) {
        alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์ครับ");
      }
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

  // Trigger Snap with Countdown
  const triggerCapture = () => {
    if (photos.length >= MAX_PHOTOS) {
      alert(`ถ่ายได้สูงสุด ${MAX_PHOTOS} รูปครับ`);
      return;
    }
    if (countdown !== null) return;

    if (timerSeconds > 0) {
      let count = timerSeconds;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          setCountdown(null);
          doSnap();
        }
      }, 1000);
    } else {
      doSnap();
    }
  };

  // Execute Photo Snap & Frame Composition
  const doSnap = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Standard 9:16 portrait dimensions for high resolution
    const targetWidth = 1080;
    const targetHeight = 1920;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Calculate crop to fill 9:16 without stretching
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = targetWidth / targetHeight;
    let sWidth, sHeight, sx, sy;

    if (videoRatio > targetRatio) {
      sHeight = video.videoHeight;
      sWidth = video.videoHeight * targetRatio;
      sx = (video.videoWidth - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = video.videoWidth;
      sHeight = video.videoWidth / targetRatio;
      sx = 0;
      sy = (video.videoHeight - sHeight) / 2;
    }

    // 1. Draw video feed
    ctx.save();
    ctx.filter = activeFilter.value;
    if (facingMode === 'user') {
      ctx.translate(targetWidth, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
    } else {
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
    }
    ctx.restore();

    // 1.5 Beauty Skin Smoothing & Acne Erasing Layer (TikTok / Smooth Skin)
    if (activeFilter.beauty) {
      ctx.save();
      ctx.globalAlpha = activeFilter.beautyAlpha || 0.36;
      ctx.globalCompositeOperation = activeFilter.beautyBlend || 'screen';
      ctx.filter = activeFilter.beautyFilter || 'blur(12px) brightness(1.16) contrast(0.90) saturate(1.06)';
      if (facingMode === 'user') {
        ctx.translate(targetWidth, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      } else {
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      }
      ctx.restore();
    }

    // 2. Composite Transparent Wedding Frame (Unmirrored)
    if (activeFrame && activeFrame.src) {
      try {
        const frameImg = new Image();
        frameImg.crossOrigin = 'anonymous';
        frameImg.src = activeFrame.src;
        await new Promise((resolve) => {
          if (frameImg.complete) resolve();
          else {
            frameImg.onload = resolve;
            frameImg.onerror = resolve;
          }
        });
        ctx.drawImage(frameImg, 0, 0, targetWidth, targetHeight);
      } catch (err) {
        console.warn("Could not draw frame overlay:", err);
      }
    }

    // 3. Export as JPEG blob
    canvas.toBlob((blob) => {
      if (blob) {
        setPhotos(prev => [...prev, { 
          blob, 
          preview: URL.createObjectURL(blob), 
          frameName: activeFrame?.shortName 
        }]);
      }
    }, 'image/jpeg', 0.9);
  };

  const fileInputRef = useRef(null);

  // เลือกรูปจากอัลบั้ม / แกลเลอรีในเครื่องมาใส่กรอบแต่งงาน
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const targetWidth = 1080;
      const targetHeight = 1920;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      const imgRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;
      let sWidth, sHeight, sx, sy;

      if (imgRatio > targetRatio) {
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }

      ctx.save();
      ctx.filter = activeFilter.value;
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      ctx.restore();

      // Beauty Skin Smoothing & Acne Erasing Layer for uploaded photo
      if (activeFilter.beauty) {
        ctx.save();
        ctx.globalAlpha = activeFilter.beautyAlpha || 0.36;
        ctx.globalCompositeOperation = activeFilter.beautyBlend || 'screen';
        ctx.filter = activeFilter.beautyFilter || 'blur(12px) brightness(1.16) contrast(0.90) saturate(1.06)';
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
        ctx.restore();
      }

      if (activeFrame && activeFrame.src) {
        try {
          const frameImg = new Image();
          frameImg.crossOrigin = 'anonymous';
          frameImg.src = activeFrame.src;
          await new Promise((resolve) => {
            if (frameImg.complete) resolve();
            else {
              frameImg.onload = resolve;
              frameImg.onerror = resolve;
            }
          });
          ctx.drawImage(frameImg, 0, 0, targetWidth, targetHeight);
        } catch (err) {
          console.warn("Could not draw frame overlay:", err);
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          setPhotos(prev => [...prev, { 
            blob, 
            preview: URL.createObjectURL(blob), 
            frameName: activeFrame?.shortName || 'อัปโหลด'
          }]);
        }
      }, 'image/jpeg', 0.9);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  // Native Web Share API
  const handleSharePhoto = async (photoItem, index) => {
    if (navigator.share && photoItem?.blob) {
      try {
        const file = new File([photoItem.blob], `Taii_Toey_Wedding_${index + 1}.jpg`, { type: 'image/jpeg' });
        await navigator.share({
          title: 'Taii & Toey Wedding',
          text: 'ภาพความทรงจำงานแต่ง Taii & Toey #TAIITOEYWEDDING',
          files: [file]
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log("Share failed:", err);
        }
      }
    } else {
      alert("เบราว์เซอร์นี้ไม่รองรับการแชร์โดยตรง สามารถกด 'ดาวน์โหลด' เพื่อบันทึกลงเครื่องและแชร์ได้เลยครับ");
    }
  };

  useEffect(() => {
    if (step === 'photo') {
      startCamera();
    } else {
      stopCamera();
    }
    
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

  // Convert to MP3
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

  // Submit to Supabase
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
            photo_url: photoUrls.join(','),
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff5f7', backgroundImage: 'linear-gradient(180deg, #fff7f9 0%, #fdf0f4 100%)', fontFamily: 'var(--font-body)', padding: '16px 10px', color: '#4a3038', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#fff', borderRadius: '24px', padding: '20px 14px', border: '1.5px solid #f0c4cf', boxShadow: '0 16px 45px rgba(196,109,130,0.12)', position: 'relative', boxSizing: 'border-box', overflow: 'hidden' }}>
        
        {/* Navigation Bar */}
        {(step === 'select' || step === 'photo' || step === 'audio') && (
          <button 
            onClick={() => setStep(step === 'select' ? 'name' : 'select')} 
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#c46d82', cursor: 'pointer', marginBottom: '16px', fontSize: '0.95rem', fontWeight: '600' }}
          >
            <ArrowLeft size={18} /> ย้อนกลับ
          </button>
        )}

        {/* STEP 1: NAME */}
        {step === 'name' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '30px', background: 'rgba(232,168,184,0.25)', border: '1px solid #f0c4cf', color: '#c46d82', fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', letterSpacing: '4px', fontWeight: '700', marginBottom: '16px' }}>
              PHOTO BOOTH &bull; LIVE
            </div>
            <h1 style={{ fontFamily: 'var(--font-cursive)', fontSize: '3.2rem', color: '#c46d82', margin: '0 0 10px 0', lineHeight: '1.1' }}>
              Taii &amp; Toey
            </h1>
            <p style={{ color: '#88686e', marginBottom: '20px', fontSize: '1rem' }}>
              กล้องโฟโต้บูธ &amp; สมุดบันทึกความทรงจำวันแต่งงาน
            </p>

            {/* พรีวิวเลือกกรอบฟิลเตอร์งานแต่งตั้งแต่หน้าแรก */}
            <div style={{ marginBottom: '22px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#c46d82', marginBottom: '10px', textAlign: 'center' }}>
                ✨ เลือกกรอบฟิลเตอร์งานแต่ง (เปลี่ยนเพิ่มในกล้องได้) ✨
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {FRAMES.map(f => {
                  const isActive = activeFrame.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setActiveFrame(f)}
                      style={{
                        borderRadius: '14px',
                        border: isActive ? '2.5px solid #c46d82' : '1.5px solid #f0c4cf',
                        backgroundColor: isActive ? '#fff0f3' : '#fafafa',
                        padding: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: isActive ? '0 4px 14px rgba(196,109,130,0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {f.preview ? (
                        <img
                          src={f.preview}
                          alt={f.shortName}
                          style={{
                            width: '100%',
                            aspectRatio: '9/16',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '6px',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          aspectRatio: '9/16',
                          borderRadius: '8px',
                          marginBottom: '6px',
                          backgroundColor: '#fce8ed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#c46d82',
                          fontSize: '0.8rem'
                        }}>
                          ภาพต้นฉบับ
                        </div>
                      )}
                      <div style={{ fontSize: '0.8rem', fontWeight: isActive ? '700' : '500', color: isActive ? '#c46d82' : '#666' }}>
                        {f.shortName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="พิมพ์ชื่อของคุณ..." 
              style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '2px solid #f0c4cf', fontSize: '1.1rem', textAlign: 'center', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep('select')}
            />
            <button 
              onClick={() => name.trim() && setStep('select')}
              style={{ 
                width: '100%', 
                padding: '16px', 
                background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '14px', 
                fontSize: '1.1rem', 
                fontWeight: '600',
                cursor: 'pointer', 
                opacity: name.trim() ? 1 : 0.5,
                boxShadow: '0 6px 20px rgba(196,109,130,0.3)',
                transition: 'all 0.2s'
              }}
              disabled={!name.trim()}
            >
              เปิดกล้องถ่ายรูปโฟโต้บูธ 📸
            </button>
          </motion.div>
        )}

        {/* STEP 2: SELECT */}
        {step === 'select' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4a3038' }}>
              สวัสดีคุณ <span style={{ color: '#c46d82' }}>{name}</span><br/>
              <span style={{ fontSize: '0.95rem', color: '#88686e', fontWeight: 'normal' }}>
                เลือกสิ่งที่คุณต้องการฝากไว้ให้บ่าวสาว
              </span>
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button 
                onClick={() => setStep('photo')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '2px solid #f0c4cf', 
                  backgroundColor: '#fff5f7', 
                  cursor: 'pointer', 
                  gap: '16px',
                  boxShadow: '0 4px 15px rgba(196,109,130,0.12)',
                  textAlign: 'left'
                }}
              >
                <div style={{ background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)', padding: '14px', borderRadius: '50%', color: '#fff' }}>
                  <Camera size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', color: '#c46d82', fontSize: '1.15rem' }}>
                    ถ่ายรูปพร้อมกรอบแต่งงาน
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                    {photos.length > 0 ? `ถ่ายแล้ว ${photos.length} รูป (กดเพื่อถ่ายเพิ่ม)` : 'เลือกกรอบซุ้มโค้ง หรือโมเดิร์นสตูดิโอได้'}
                  </p>
                </div>
                {photos.length > 0 && <CheckCircle color="#c46d82" size={24} />}
              </button>

              <button 
                onClick={() => setStep('audio')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '2px solid #eee', 
                  backgroundColor: '#fff', 
                  cursor: 'pointer', 
                  gap: '16px',
                  textAlign: 'left'
                }}
              >
                <div style={{ backgroundColor: '#fce8ed', padding: '14px', borderRadius: '50%', color: '#c46d82' }}>
                  <Mic size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', color: '#4a3038', fontSize: '1.15rem' }}>
                    อัดเสียงอวยพร (เทปคาสเซ็ท)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                    {audioBlob ? 'บันทึกเสียงเรียบร้อยแล้ว (กดเพื่ออัดใหม่)' : 'ฝากข้อความเสียงซึ้งๆ หรือคำอวยพร'}
                  </p>
                </div>
                {audioBlob && <CheckCircle color="#c46d82" size={24} />}
              </button>
            </div>

            {/* PREVIEW OF READY MEDIA */}
            {(photos.length > 0 || audioBlob) && (
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fff8fa', borderRadius: '16px', border: '1px dashed #f0c4cf' }}>
                <h4 style={{ margin: '0 0 12px 0', textAlign: 'center', color: '#c46d82', fontSize: '0.95rem' }}>
                  ความทรงจำของคุณที่พร้อมส่ง ({photos.length} รูป)
                </h4>
                
                {photos.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: audioPreviewUrl ? '12px' : '0' }}>
                    {photos.map((p, idx) => (
                      <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                        <img 
                          src={p.preview} 
                          alt={`preview-${idx}`} 
                          style={{ height: '90px', aspectRatio: '9/16', objectFit: 'cover', borderRadius: '8px', border: '2px solid #fff', boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }} 
                        />
                        <button 
                          onClick={() => removePhoto(idx)} 
                          style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#e11d48', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {audioPreviewUrl && (
                  <audio src={audioPreviewUrl} controls style={{ width: '100%', height: '36px' }}></audio>
                )}
              </div>
            )}

            {(photos.length > 0 || audioBlob) && (
              <button 
                onClick={handleSubmit} 
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '14px', 
                  fontSize: '1.1rem', 
                  fontWeight: '600',
                  cursor: 'pointer', 
                  marginTop: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px', 
                  boxShadow: '0 6px 20px rgba(196,109,130,0.3)' 
                }}
              >
                <Send size={20} /> ส่งความทรงจำให้บ่าวสาว &amp; บันทึกรูปภาพ
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 3: PHOTO BOOTH CAMERA */}
        {step === 'photo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#c46d82' }}>📸 ถ่ายรูปโฟโต้บูธ</h3>
                <span style={{ fontSize: '0.8rem', color: '#88686e' }}>เห็นกรอบรูปก่อนถ่ายจริง</span>
              </div>
              <span style={{ backgroundColor: '#fce8ed', color: '#c46d82', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #f0c4cf' }}>
                {photos.length} / {MAX_PHOTOS}
              </span>
            </div>

            {/* Frame Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {FRAMES.map(f => {
                const isActive = activeFrame.id === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFrame(f)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: isActive ? '2px solid #c46d82' : '1px solid #f0c4cf',
                      backgroundColor: isActive ? '#fff0f3' : '#fafafa',
                      color: isActive ? '#c46d82' : '#88686e',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {f.preview && (
                      <img 
                        src={f.preview} 
                        alt={f.shortName} 
                        style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #eee' }} 
                      />
                    )}
                    <span>{f.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Viewfinder: 9:16 Aspect Ratio with Live Frame Overlay */}
            <div 
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '340px', 
                aspectRatio: '9/16', 
                maxHeight: '62vh', 
                backgroundColor: '#000', 
                borderRadius: '20px', 
                overflow: 'hidden', 
                margin: '0 auto 14px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.25)' 
              }}
            >
              {/* Live Video Feed */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  filter: activeFilter.value, 
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' 
                }}
              />

              {/* Real-time Beauty Soft Glow Overlay (TikTok / Smooth Skin) */}
              {activeFilter.beauty && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 4,
                    background: activeFilter.name.includes('อมชมพู')
                      ? 'radial-gradient(ellipse at 50% 45%, rgba(255, 215, 225, 0.24) 0%, rgba(255, 235, 240, 0.12) 45%, rgba(255, 245, 248, 0.03) 75%, transparent 100%)'
                      : 'radial-gradient(ellipse at 50% 45%, rgba(255, 248, 250, 0.26) 0%, rgba(255, 238, 242, 0.12) 45%, rgba(255, 245, 248, 0.03) 75%, transparent 100%)',
                    backdropFilter: 'blur(0.8px) brightness(1.03) contrast(0.96)',
                    WebkitBackdropFilter: 'blur(0.8px) brightness(1.03) contrast(0.96)',
                    mixBlendMode: 'screen',
                    transition: 'all 0.3s ease'
                  }}
                />
              )}

              {/* Real-time Wedding Frame Overlay (Never Mirrored) */}
              {activeFrame && activeFrame.src && (
                <img 
                  src={activeFrame.src} 
                  alt="Wedding Frame" 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'fill', 
                    pointerEvents: 'none', 
                    zIndex: 5 
                  }} 
                />
              )}

              {/* Flash effect overlay */}
              <AnimatePresence>
                {isFlashing && (
                  <motion.div 
                    initial={{ opacity: 1 }} 
                    animate={{ opacity: 0 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ duration: 0.2 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 20 }}
                  />
                )}
              </AnimatePresence>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 15 }}>
                  <motion.div 
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1.2, opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    style={{ fontSize: '5rem', fontWeight: '800', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                  >
                    {countdown}
                  </motion.div>
                </div>
              )}

              {/* Top Control Buttons on Viewfinder */}
              <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10 }}>
                {/* Flip Camera */}
                <button 
                  onClick={switchCamera}
                  style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(5px)', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                  title="สลับกล้องหน้า/หลัง"
                >
                  <RefreshCw size={20} color="#333" />
                </button>

                {/* Timer Toggle */}
                <button 
                  onClick={() => setTimerSeconds(prev => prev === 0 ? 3 : 0)}
                  style={{ 
                    backgroundColor: timerSeconds > 0 ? '#c46d82' : 'rgba(255,255,255,0.85)', 
                    backdropFilter: 'blur(5px)', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '42px', 
                    height: '42px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    color: timerSeconds > 0 ? '#fff' : '#333',
                    fontWeight: '700',
                    fontSize: '0.85rem'
                  }}
                  title="ตั้งเวลาถ่ายภาพ"
                >
                  {timerSeconds > 0 ? '3s' : <Timer size={20} />}
                </button>
              </div>
            </div>

            {/* Hidden canvas for compositing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Color Filter Selector (Horizontal Scroll with TikTok Beauty Options) */}
            <div style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              gap: '8px', 
              padding: '4px 16px 10px', 
              marginBottom: '14px', 
              justifyContent: 'flex-start',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              maxWidth: '100%'
            }}>
              {FILTERS.map(filter => {
                const isSelected = activeFilter.name === filter.name;
                return (
                  <button 
                    key={filter.name}
                    onClick={() => setActiveFilter(filter)}
                    style={{ 
                      padding: '7px 14px', 
                      borderRadius: '20px', 
                      border: '1px solid',
                      borderColor: isSelected ? '#c46d82' : '#f0c4cf',
                      backgroundColor: isSelected ? '#c46d82' : '#fff',
                      color: isSelected ? '#fff' : '#666',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? '600' : '400',
                      boxShadow: isSelected ? '0 4px 12px rgba(196, 109, 130, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    {filter.name}
                  </button>
                );
              })}
            </div>

            {/* Big Shutter Button + Upload from Gallery */}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '0 auto 16px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= MAX_PHOTOS}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  border: '1.5px solid #f0c4cf',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: photos.length >= MAX_PHOTOS ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(196,109,130,0.12)',
                  transition: 'transform 0.1s'
                }}
                title="เลือกรูปจากเครื่อง/อัลบั้มมาใส่กรอบ"
              >
                <ImageIcon size={22} color="#c46d82" />
              </button>

              <button 
                onClick={triggerCapture} 
                disabled={photos.length >= MAX_PHOTOS || countdown !== null}
                style={{ 
                  width: '76px', 
                  height: '76px', 
                  borderRadius: '50%', 
                  background: photos.length >= MAX_PHOTOS ? '#ccc' : 'linear-gradient(135deg, #f0a8b8 0%, #c46d82 100%)', 
                  color: '#fff', 
                  border: '6px solid #fdf0f4', 
                  boxShadow: '0 6px 20px rgba(196,109,130,0.38)', 
                  cursor: photos.length >= MAX_PHOTOS ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  transition: 'transform 0.1s'
                }}
              >
                <Camera size={34} />
              </button>

              <div style={{ width: '50px' }} /> {/* Spacer to keep Shutter centered */}
            </div>

            {/* Thumbnails of taken photos */}
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0', borderTop: '1px solid #f0c4cf', marginBottom: '10px' }}>
                {photos.map((p, idx) => (
                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                    <img 
                      src={p.preview} 
                      alt={`pic-${idx}`} 
                      style={{ width: '56px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #fff', boxShadow: '0 3px 8px rgba(0,0,0,0.2)' }} 
                    />
                    <button 
                      onClick={() => removePhoto(idx)} 
                      style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#e11d48', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => setStep('select')} 
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', boxShadow: '0 4px 14px rgba(196,109,130,0.25)' }}
            >
              เสร็จสิ้นการถ่ายรูป ({photos.length} รูป)
            </button>
          </motion.div>
        )}

        {/* STEP 4: AUDIO TAPE */}
        {step === 'audio' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '24px', color: '#c46d82' }}>📼 เทปเสียงอวยพร</h3>

            {/* Cassette Tape UI */}
            <div style={{ width: '100%', maxWidth: '300px', height: '180px', backgroundColor: '#d1d5db', borderRadius: '15px', position: 'relative', border: '2px solid #9ca3af', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '85%', height: '65%', backgroundColor: '#fef3c7', borderRadius: '8px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fbbf24' }}>
                <div style={{ position: 'absolute', top: '5px', width: '100%', textAlign: 'center', fontFamily: 'var(--font-cursive)', fontSize: '1.2rem', color: '#b45309' }}>Side A: {name}</div>
                <div style={{ width: '70%', height: '40px', backgroundColor: '#374151', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', padding: '0 15px', alignItems: 'center', marginTop: '10px' }}>
                  <motion.div animate={{ rotate: isRecording ? 360 : 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ width: '30px', height: '30px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid #9ca3af', borderRadius: '50%' }}></div>
                  </motion.div>
                  <motion.div animate={{ rotate: isRecording ? 360 : 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ width: '30px', height: '30px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid #9ca3af', borderRadius: '50%' }}></div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            {!audioPreviewUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                {!isRecording ? (
                  <button onClick={startRecording} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px', backgroundColor: '#c46d82', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(196,109,130,0.3)' }}>
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

            <button onClick={() => setStep('select')} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)', color: '#fff', border: 'none', borderRadius: '12px', marginTop: '24px', cursor: 'pointer', fontWeight: '600' }}>
              เสร็จสิ้นการอัดเสียง
            </button>
          </motion.div>
        )}

        {/* STEP 5: UPLOADING */}
        {step === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ margin: '0 auto 20px', width: '50px', height: '50px', border: '5px solid #fce8ed', borderTop: '5px solid #c46d82', borderRadius: '50%' }}></motion.div>
            <h3 style={{ color: '#c46d82' }}>กำลังส่งข้อมูลแห่งความทรงจำ...</h3>
            <p style={{ color: '#88686e' }}>กรุณารอสักครู่นะครับ</p>
          </div>
        )}

        {/* STEP 6: SUCCESS & SOCIAL SHARE */}
        {step === 'success' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '6px 0', boxSizing: 'border-box' }}>
            <div style={{
              width: '68px',
              height: '68px',
              margin: '0 auto 14px',
              borderRadius: '50%',
              backgroundColor: '#fdf0f4',
              border: '2px solid #f0c4cf',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(196,109,130,0.18)'
            }}>
              <CheckCircle size={38} color="#c46d82" />
            </div>
            <h2 style={{ color: '#c46d82', margin: '0 0 6px 0', fontSize: '1.45rem', fontWeight: '700' }}>
              ส่งความทรงจำเรียบร้อยแล้ว!
            </h2>
            <p style={{ color: '#88686e', margin: '0 0 18px 0', fontSize: '0.92rem' }}>
              ขอบคุณ <strong style={{ color: '#c46d82' }}>{name}</strong> ที่มาร่วมแชร์โมเมนต์พิเศษกับเราครับ 💖
            </p>
            
            {/* DOWNLOAD & SHARE CARDS */}
            {photos.length > 0 && (
              <div style={{ backgroundColor: '#fff8fa', border: '1.5px solid #f0c4cf', padding: '14px 10px', borderRadius: '18px', marginBottom: '18px', textAlign: 'center', boxSizing: 'border-box' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(232,168,184,0.25)',
                    color: '#c46d82',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    marginBottom: '6px'
                  }}>
                    <span>📸</span> รูปถ่ายพร้อมกรอบ ({photos.length} รูป)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#88686e', letterSpacing: '0.3px' }}>
                    แชร์โมเมนต์พิเศษพร้อมติดแท็ก <strong style={{ color: '#c46d82' }}>#TAIITOEYWEDDING</strong> ✨
                  </div>
                </div>

                {/* Batch Download Button if multiple photos */}
                {photos.length > 1 && (
                  <button
                    onClick={handleDownloadAll}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#ffffff',
                      color: '#c46d82',
                      border: '1.5px solid #c46d82',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      boxShadow: '0 2px 6px rgba(196,109,130,0.15)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Download size={15} /> บันทึกรูปทั้งหมด ({photos.length} รูป)
                  </button>
                )}

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: photos.length === 1 ? '1fr' : 'repeat(2, 1fr)', 
                  gap: '10px',
                  maxWidth: photos.length === 1 ? '260px' : '100%',
                  margin: '0 auto',
                  boxSizing: 'border-box'
                }}>
                  {photos.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '7px', minWidth: 0, boxSizing: 'border-box' }}>
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '9/16', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(196,109,130,0.12)', border: '2px solid #fff' }}>
                        <img 
                          src={p.preview} 
                          alt={`dl-${idx}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                        />
                        <div style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: 'rgba(74,48,56,0.65)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.68rem', fontWeight: '600', padding: '2px 7px', borderRadius: '8px' }}>
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Primary Button: บันทึกรูป */}
                      <a 
                        href={p.preview} 
                        download={`Taii_Toey_Wedding_${idx + 1}.jpg`}
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box',
                          padding: '9px 0', 
                          background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)', 
                          color: '#fff', 
                          textDecoration: 'none', 
                          borderRadius: '10px', 
                          fontSize: '0.8rem', 
                          fontWeight: '600', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(196,109,130,0.28)'
                        }}
                        title="บันทึกรูปภาพนี้"
                      >
                        <Download size={14} />
                        <span>บันทึกรูป</span>
                      </a>

                      {/* Social Share Icons Row (IG / LINE / FB) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '100%', boxSizing: 'border-box' }}>
                        {/* Instagram Story / Web Share */}
                        <button 
                          onClick={() => handleSharePhoto(p, idx)}
                          style={{ 
                            height: '34px', 
                            padding: 0, 
                            background: 'linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(220,39,67,0.2)'
                          }}
                          title="แชร์ลง Instagram Story / โซเชียล"
                        >
                          <Share2 size={15} />
                        </button>

                        {/* LINE */}
                        <button 
                          onClick={handleLineShare}
                          style={{ 
                            height: '34px', 
                            padding: 0, 
                            backgroundColor: '#06c755', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(6,199,85,0.2)'
                          }}
                          title="ส่งต่อทาง LINE"
                        >
                          <MessageCircle size={15} />
                        </button>

                        {/* Facebook */}
                        <button 
                          onClick={handleFacebookShare}
                          style={{ 
                            height: '34px', 
                            padding: 0, 
                            backgroundColor: '#1877f2', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(24,119,242,0.2)'
                          }}
                          title="แชร์ลง Facebook"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </button>
                      </div>
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
                setStep('name'); 
              }}
              style={{ 
                width: '100%', 
                padding: '14px', 
                backgroundColor: '#ffffff', 
                color: '#c46d82', 
                border: '1.5px solid #f0c4cf', 
                borderRadius: '14px', 
                fontSize: '0.95rem', 
                cursor: 'pointer', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(196,109,130,0.06)',
                boxSizing: 'border-box'
              }}
            >
              <span>📸</span> ถ่ายรูปใหม่อีกครั้ง
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default PhotoBooth;
