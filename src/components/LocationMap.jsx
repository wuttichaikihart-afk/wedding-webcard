import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const LocationMap = () => {
  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--secondary)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="section-title">Location</h2>
          <p className="section-subtitle">สถานที่จัดงาน</p>
        </motion.div>

        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel"
            style={{ padding: '30px', textAlign: 'center', width: '100%', maxWidth: '500px' }}
          >
            <MapPin size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>อรัญประเทศ</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
              อำเภออรัญประเทศ<br/>
              จังหวัดสระแก้ว
            </p>
            
            <a 
              href="https://maps.app.goo.gl/Hi7p29TXgaLWmjQU8" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-secondary"
            >
              เปิดนำทางใน Google Maps
            </a>
          </motion.div>



        </div>
      </div>
    </section>
  );
};

export default LocationMap;
