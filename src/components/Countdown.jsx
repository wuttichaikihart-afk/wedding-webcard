import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // 19 December 2026 (Midnight)
    const targetDate = new Date('2026-12-19T00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days, labelTh: 'วัน' },
    { label: 'Hours', value: timeLeft.hours, labelTh: 'ชั่วโมง' },
    { label: 'Mins', value: timeLeft.minutes, labelTh: 'นาที' },
    { label: 'Secs', value: timeLeft.seconds, labelTh: 'วินาที' }
  ];

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--secondary)' }}>
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '10px', fontSize: '2rem' }}>
            Countdown to Our Big Day
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '40px', fontSize: '1.1rem' }}>
            19 ธันวาคม 2569
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}
        >
          {timeUnits.map((unit, index) => (
            <div 
              key={index} 
              className="glass-panel"
              style={{
                width: '90px',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: '500', color: 'var(--primary-dark)', lineHeight: '1.2' }}>
                {String(unit.value).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {unit.label}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {unit.labelTh}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Countdown;
