import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// โหลดรูปภาพทั้งหมดที่ชื่อขึ้นต้นด้วย pic และเป็นไฟล์ .jpg จากโฟลเดอร์ assets อัตโนมัติ
const modules = import.meta.glob('../assets/pic*.jpg', { eager: true, import: 'default' });

// นำมาจัดเรียงลำดับตามตัวเลข 1, 2, 3... 25
const images = Object.keys(modules)
  .sort((a, b) => {
    const matchA = a.match(/pic(\d+)\.jpg/i);
    const matchB = b.match(/pic(\d+)\.jpg/i);
    const numA = matchA ? parseInt(matchA[1], 10) : 0;
    const numB = matchB ? parseInt(matchB[1], 10) : 0;
    return numA - numB;
  })
  .map(key => modules[key]);

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft' && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight' && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    if (selectedIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
          style={{ position: 'relative', marginBottom: '40px' }}
        >
          <h2 className="section-title">Our Memories</h2>
          <p className="section-subtitle">แกลเลอรีภาพถ่ายของเรา</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
            <button 
              onClick={scrollLeft}
              className="btn btn-secondary"
              style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft />
            </button>
            <button 
              onClick={scrollRight}
              className="btn btn-secondary"
              style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        ref={carouselRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: '20px',
          padding: '20px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="hide-scrollbar"
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        
        {images.map((img, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            style={{
              flex: '0 0 auto',
              width: '300px',
              height: '400px',
              scrollSnapAlign: 'center',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedIndex(index)}
          >
            <img 
              src={img} 
              alt={`Gallery ${index + 1}`} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '10px',
                zIndex: 10000
              }}
            >
              <X size={36} />
            </button>

            {/* Prev Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }}
              style={{
                position: 'absolute',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                padding: '15px',
                borderRadius: '50%',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <ChevronLeft size={32} />
            </button>
            
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={images[selectedIndex]}
              alt={`Popup Fullsize ${selectedIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxHeight: '90vh',
                maxWidth: '85vw',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            />

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }}
              style={{
                position: 'absolute',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                padding: '15px',
                borderRadius: '50%',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <ChevronRight size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
