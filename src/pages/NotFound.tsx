import { MoveLeft, Sparkles, RefreshCw } from 'lucide-react';
import '../landing.css';

export default function NotFound() {
  const handleGoHome = () => {
    window.location.hash = '';
  };

  const handleCreateNew = () => {
    window.location.hash = 'draw';
  };

  return (
    <div className="landing-body" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'space-between' }}>
      {/* Glow Backdrops */}
      <div className="glow-backdrop-1" style={{ top: '40%', left: '50%' }} />
      <div className="glow-backdrop-2" style={{ top: '30%', left: '30%', width: '300px', height: '300px' }} />

      <div className="landing-grid-bg" />

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', zIndex: 10, textAlign: 'center', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Sketchy Broken Pencil SVG */}
          <div className="hero-canvas-mockup" style={{ maxWidth: '400px', padding: '16px', marginBottom: '40px', background: 'rgba(18, 18, 20, 0.4)' }}>
            <div className="mock-canvas-area" style={{ background: '#0c0c0e', aspectRatio: '4/3' }}>
              <svg viewBox="0 0 400 300" className="mock-svg-canvas" style={{ width: '100%', height: '100%' }}>
                {/* Background Grid Pattern mock */}
                <path d="M 20,0 L 20,300 M 60,0 L 60,300 M 100,0 L 100,300 M 140,0 L 140,300 M 180,0 L 180,300 M 220,0 L 220,300 M 260,0 L 260,300 M 300,0 L 300,300 M 340,0 L 340,300 M 380,0 L 380,300" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <path d="M 0,20 L 400,20 M 0,60 L 400,60 M 0,100 L 400,100 M 0,140 L 400,140 M 0,180 L 400,180 M 0,220 L 400,220 M 0,260 L 400,260" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

                {/* Hand Drawn Question Mark */}
                <path
                  d="M 170,120 C 170,80 230,80 230,120 C 230,150 200,160 200,180"
                  stroke="var(--pink)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  style={{ strokeDasharray: '300', strokeDashoffset: '0' }}
                />
                <path
                  d="M 172,122 C 172,83 228,83 228,122 C 228,149 202,159 202,178"
                  stroke="var(--pink)"
                  strokeWidth="1.5"
                  opacity="0.6"
                  fill="none"
                  strokeLinecap="round"
                />
                
                {/* Dot for Question Mark */}
                <path
                  d="M 200,210 C 203,210 203,216 200,216 C 197,216 197,210 200,210 Z"
                  stroke="var(--pink)"
                  strokeWidth="3.5"
                  fill="var(--pink)"
                />

                {/* Broken Pencil Drawing */}
                {/* Pencil Main Body */}
                <path
                  d="M 60,200 L 150,110 L 170,130 L 80,220 Z"
                  stroke="var(--indigo)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 62,202 L 148,112 M 72,212 L 158,122"
                  stroke="var(--indigo)"
                  strokeWidth="1"
                  opacity="0.5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Eraser */}
                <path
                  d="M 60,200 L 45,215 L 60,230 L 80,220 Z"
                  stroke="var(--indigo)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Wood Tip (Shaved Part) */}
                <path
                  d="M 150,110 L 180,95 L 170,130"
                  stroke="var(--indigo)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Broken Tip Lead flying off */}
                <path
                  d="M 200,80 L 210,70 L 205,65 L 195,75 Z"
                  stroke="var(--amber)"
                  strokeWidth="2"
                  fill="var(--amber)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Radial action splash lines around broken lead */}
                <path d="M 188,88 L 182,92 M 190,75 L 185,70 M 215,75 L 222,78 M 205,60 L 205,52" stroke="var(--text-slate)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Badge */}
          <div className="hero-badge" style={{ animation: 'none' }}>
            <Sparkles className="w-3.5 h-3.5" /> 404 Error
          </div>

          {/* Title */}
          <h1 className="hero-title" style={{ opacity: 1, fontSize: '48px', marginBottom: '16px' }}>
            Page Out of{' '}
            <span className="hero-title-gradient">Canvas</span>
          </h1>

          {/* Description */}
          <p className="hero-subtext" style={{ opacity: 1, fontSize: '16px', marginBottom: '40px', maxWidth: '500px' }}>
            It seems you drifted off the infinite whiteboard grid. The link you followed doesn't exist, is incomplete, or has been cleared.
          </p>

          {/* Buttons Actions */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handleGoHome}
              className="hero-btn-large"
              style={{ opacity: 1, padding: '12px 28px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'none' }}
            >
              <span className="l-btn-primary-content" style={{ color: 'var(--text-slate)' }}>
                <MoveLeft className="w-4 h-4" /> Go Back Home
              </span>
              <div className="l-btn-primary-bg" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
            </button>
            <button
              onClick={handleCreateNew}
              className="hero-btn-large"
              style={{ opacity: 1, padding: '12px 28px' }}
            >
              <span className="l-btn-primary-content">
                Create New Canvas <RefreshCw className="w-4 h-4" />
              </span>
              <div className="l-btn-primary-bg" />
            </button>
          </div>

        </div>
      </main>

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
