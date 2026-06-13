import React from 'react';
import { motion } from 'framer-motion';
import heroBg from '../assets/main_cover.jpg';

const HeroSection = () => {
  return (
    <section
      className="hero-section"
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#fff'
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.65)',
          zIndex: -1
        }}
      />

      <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            letterSpacing: '3px',
            marginBottom: '20px',
            textTransform: 'uppercase',
            color: '#fdfaf5'
          }}>
            We Are Getting Married
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: '#fff',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            marginBottom: '10px',
            lineHeight: '1.1'
          }}
        >
          Toey & Kratai
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="divider" style={{ justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '2rem' }}>&hearts;</span>
          </div>

          <p style={{
            fontSize: '1.2rem',
            fontWeight: 300,
            marginBottom: '40px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            19 ธันวาคม 2569 | อรัญประเทศ, สระแก้ว
          </p>

          <a href="#rsvp" className="btn btn-primary" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'var(--primary-dark)',
            padding: '15px 40px',
            fontSize: '1.1rem',
            letterSpacing: '1px'
          }}>
            RSVP NOW
          </a>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            width: '1px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.5)'
          }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
