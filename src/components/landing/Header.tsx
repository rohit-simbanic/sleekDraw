import { useState } from 'react';
import { Palette, Menu, X, ArrowRight } from 'lucide-react';

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface HeaderProps {
  onStartDrawing: () => void;
}

export default function Header({ onStartDrawing }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="l-header">
      <div className="l-navbar">
        {/* Logo */}
        <div className="l-logo-container" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="l-logo-box">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <span className="l-brand-name">
            Sleek<span className="l-brand-gradient">Draw</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="l-nav-menu">
          <button onClick={() => handleScrollTo('features')} className="l-nav-link">
            Features
          </button>
          <button onClick={() => handleScrollTo('collaboration')} className="l-nav-link">
            Collaboration
          </button>
          <button onClick={() => handleScrollTo('security')} className="l-nav-link">
            Security
          </button>
        </nav>

        {/* Actions */}
        <div className="l-nav-menu">
          <a
            href="https://github.com/rohit-simbanic/sleekDraw"
            target="_blank"
            rel="noreferrer"
            className="l-btn-github"
          >
            <Github className="w-5 h-5" />
          </a>
          <button
            onClick={onStartDrawing}
            className="l-btn-primary"
          >
            <span className="l-btn-primary-content">
              Start Drawing <ArrowRight className="w-4 h-4" />
            </span>
            <div className="l-btn-primary-bg" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="l-navbar-menu-trigger"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="l-mobile-drawer">
          <nav className="l-mobile-nav">
            <button
              onClick={() => handleScrollTo('features')}
              className="l-mobile-link"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('collaboration')}
              className="l-mobile-link"
            >
              Collaboration
            </button>
            <button
              onClick={() => handleScrollTo('security')}
              className="l-mobile-link"
            >
              Security
            </button>
            <div className="l-mobile-actions">
              <a
                href="https://github.com/rohit-simbanic/sleekDraw"
                target="_blank"
                rel="noreferrer"
                className="l-mobile-link"
                style={{ border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Github className="w-5 h-5" /> GitHub
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onStartDrawing();
                }}
                className="l-btn-primary"
              >
                <span className="l-btn-primary-content">
                  Start Drawing <ArrowRight className="w-4 h-4" />
                </span>
                <div className="l-btn-primary-bg" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
