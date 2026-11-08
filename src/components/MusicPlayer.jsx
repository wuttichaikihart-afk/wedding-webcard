import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Disc3, Pause } from 'lucide-react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);

  // เริ่มเล่นเพลงเมื่อมีการคลิกครั้งแรกบนหน้าจอ
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(err => console.log("Autoplay prevented by browser", err));
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [hasInteracted]);

  const togglePlay = (e) => {
    e.stopPropagation(); // ป้องกันไม่ให้ trigger event ของ document
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setHasInteracted(true);
      }
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src="/bgmusic.mp3" 
        loop 
        preload="auto"
      />
      
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        onClick={togglePlay}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '20px',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #e8a8b8 0%, #c46d82 100%)',
          color: 'white',
          border: '2px solid #ffffff',
          boxShadow: '0 6px 20px rgba(196, 109, 130, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          overflow: 'hidden'
        }}
        title={isPlaying ? "หยุดเพลง" : "เล่นเพลง"}
      >
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isPlaying ? <Pause size={22} /> : <Disc3 size={22} />}
        </motion.div>
      </motion.button>
    </>
  );
};

export default MusicPlayer;
