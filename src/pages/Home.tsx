import { useState } from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import CollabSimulator from '../components/landing/CollabSimulator';
import E2EEVisualizer from '../components/landing/E2EEVisualizer';
import BentoGrid from '../components/landing/BentoGrid';
import LandingCTA from '../components/landing/LandingCTA';
import '../landing.css';

interface HomeProps {
  onStartDrawing: () => void;
}

type HeaderStyleType = 'pill' | 'laser' | 'corner' | 'split-flap';

export default function Home({ onStartDrawing }: HomeProps) {
  const [headerStyle, setHeaderStyle] = useState<HeaderStyleType>('laser');

  return (
    <div className="landing-body">
      {/* Navbar Header */}
      <Header style={headerStyle} onStartDrawing={onStartDrawing} />

      {/* Hero Drawing Simulation */}
      <Hero onStartDrawing={onStartDrawing} />

      {/* Bento Feature Grid */}
      <BentoGrid />

      {/* Collaboration Live Cursor Sim */}
      <CollabSimulator />

      {/* E2EE Data Packet Visualizer */}
      <E2EEVisualizer />

      {/* Immersive CTA Footer */}
      <LandingCTA onStartDrawing={onStartDrawing} />

      {/* Header Style Switcher Widget */}
      <div className="l-switcher-container">
        <div className="l-switcher-title">
          <div className="l-switcher-title-dot" />
          Header Animation Switcher
        </div>
        <div className="l-switcher-buttons">
          <button
            onClick={() => setHeaderStyle('laser')}
            className={`l-switcher-btn ${headerStyle === 'laser' ? 'active' : ''}`}
          >
            Laser Trail
          </button>
          <button
            onClick={() => setHeaderStyle('pill')}
            className={`l-switcher-btn ${headerStyle === 'pill' ? 'active' : ''}`}
          >
            Scroll Pill
          </button>
          <button
            onClick={() => setHeaderStyle('corner')}
            className={`l-switcher-btn ${headerStyle === 'corner' ? 'active' : ''}`}
          >
            Corner Docks
          </button>
          <button
            onClick={() => setHeaderStyle('split-flap')}
            className={`l-switcher-btn ${headerStyle === 'split-flap' ? 'active' : ''}`}
          >
            Split-Flap
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="l-footer">
        <div className="l-footer-container">
          <span>&copy; {new Date().getFullYear()} SleekDraw. Open source MIT License.</span>
          <div className="l-footer-links">
            <a href="https://github.com/rohit-simbanic/sleekDraw" target="_blank" rel="noreferrer">GitHub</a>
            <span>E2E Encrypted (AES-GCM)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
