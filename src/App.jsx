import React from 'react';
import HeroSection from './components/HeroSection';
import Countdown from './components/Countdown';
import Timeline from './components/Timeline';
import RSVPForm from './components/RSVPForm';
import LocationMap from './components/LocationMap';
import Gallery from './components/Gallery';
import Guestbook from './components/Guestbook';
import GiftRegistry from './components/GiftRegistry';

function App() {
  return (
    <div className="app">
      <HeroSection />
      <Countdown />
      <Timeline />
      <Gallery />
      <RSVPForm />
      <LocationMap />
      <Guestbook />
      <GiftRegistry />
      
      <footer style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: 'var(--secondary-alt)',
        color: 'var(--text-light)',
        fontSize: '0.9rem'
      }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '10px' }}>T & T</p>
        <p>&copy; 2026 Toey & Kratai Wedding. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
