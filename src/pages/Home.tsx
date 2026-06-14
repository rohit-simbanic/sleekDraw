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

export default function Home({ onStartDrawing }: HomeProps) {
  return (
    <div className="landing-body">
      {/* Navbar Header */}
      <Header onStartDrawing={onStartDrawing} />

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
