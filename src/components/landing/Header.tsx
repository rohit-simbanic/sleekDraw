import { useState, useEffect } from 'react';
import { Palette, Menu as MenuIcon, X, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
  style: 'corner' | 'split-flap';
  onStartDrawing: () => void;
}

// Scramble text sub-component for premium motion typography
function ScrambleText({ text, triggerScramble, isHovered }: { text: string; triggerScramble: boolean; isHovered: boolean }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 25);

    return () => clearInterval(interval);
  }, [text, triggerScramble, isHovered]);

  return <span className={`l-overlay-scramble-text ${isHovered ? 'l-overlay-scramble-text-hovered' : ''}`}>{displayText}</span>;
}

export default function Header({ style, onStartDrawing }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOverlayClick = (id: string) => {
    setIsOverlayOpen(false);
    setTimeout(() => {
      handleScrollTo(id);
    }, 450); // Wait for menu overlay slide-up animation
  };

  // --- Corner Dock Convergence Scroll Animation ---
  useEffect(() => {
    // Reset standard layout styling initially
    const mainNavbar = document.querySelector('.l-navbar');
    gsap.set(mainNavbar, { clearProps: 'all' });

    if (style !== 'corner') return;

    // Check screen size
    if (window.innerWidth < 768) {
      // Standard mobile navbar layout, fully interactive
      gsap.set(mainNavbar, { opacity: 1, y: 0, pointerEvents: 'auto' });
      return;
    }

    const logo = document.querySelector('.l-corner-logo');
    const github = document.querySelector('.l-corner-github');
    const nav = document.querySelector('.l-corner-nav');
    const cta = document.querySelector('.l-corner-cta');

    if (!mainNavbar || !logo || !github || !nav || !cta) return;

    // Initially hide center top header and show corner docks on desktop
    gsap.set(mainNavbar, { opacity: 0, y: -20, pointerEvents: 'none' });
    gsap.set([logo, github, nav, cta], { opacity: 1, scale: 1 });

    const scrubTl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: '+=160',
        scrub: 0.4,
      }
    });

    scrubTl.to(logo, { x: 80, y: -10, scale: 0.85, opacity: 0, duration: 1 }, 0)
           .to(github, { x: -80, y: -10, scale: 0.85, opacity: 0, duration: 1 }, 0)
           .to(nav, { x: 80, y: -60, scale: 0.85, opacity: 0, duration: 1 }, 0)
           .to(cta, { x: -80, y: -60, scale: 0.85, opacity: 0, duration: 1 }, 0)
           .to(mainNavbar, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 1 }, 0.2);

    return () => {
      scrubTl.scrollTrigger?.kill();
      scrubTl.kill();
      gsap.set(mainNavbar, { clearProps: 'all' });
    };
  }, [style]);

  // --- Split-Flap Overlay Slide-Down Animation ---
  useEffect(() => {
    if (style !== 'split-flap') {
      setIsOverlayOpen(false);
      return;
    }

    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';

      gsap.fromTo('.l-overlay-menu',
        { y: '-100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.45, ease: 'power4.out' }
      );

      gsap.fromTo('.l-overlay-link-btn',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 }
      );
    } else {
      document.body.style.overflow = 'auto';

      gsap.to('.l-overlay-menu', {
        y: '-100%',
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
      });
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOverlayOpen, style]);

  return (
    <>
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

          {/* Desktop Nav - Hidden in split-flap style */}
          {style !== 'split-flap' && (
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
          )}

          {/* Actions - Hidden in split-flap */}
          {style !== 'split-flap' && (
            <div className="l-nav-menu">
              <a
                href="https://github.com/rohit-simbanic/sleekDraw"
                target="_blank"
                rel="noreferrer"
                className="l-btn-github"
              >
                <GithubIcon className="w-5 h-5" />
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
          )}

          {/* Hamburger trigger for Split-Flap overlay */}
          {style === 'split-flap' && (
            <button
              onClick={() => setIsOverlayOpen(true)}
              className="l-btn-primary l-btn-split-flap-trigger"
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <span className="l-btn-primary-content">
                Menu <MenuIcon className="w-4 h-4" />
              </span>
              <div className="l-btn-primary-bg" />
            </button>
          )}

          {/* Standard Mobile menu trigger (for corner style on mobile view) */}
          {style !== 'split-flap' && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="l-navbar-menu-trigger"
            >
              {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Standard Mobile Drawer */}
        {isOpen && style !== 'split-flap' && (
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
                  <GithubIcon className="w-5 h-5" /> GitHub
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

      {/* --- Corner Docks Mode Widgets (Hidden in mobile view via media-query) --- */}
      {style === 'corner' && (
        <>
          {/* Top-Left Logo Box */}
          <div className="l-corner-widget l-corner-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="l-logo-box">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <span className="l-brand-name">
              Sleek<span className="l-brand-gradient">Draw</span>
            </span>
          </div>

          {/* Top-Right Github Link */}
          <a
            href="https://github.com/rohit-simbanic/sleekDraw"
            target="_blank"
            rel="noreferrer"
            className="l-corner-widget l-corner-github"
          >
            <GithubIcon />
          </a>

          {/* Bottom-Left Nav Links */}
          <nav className="l-corner-widget l-corner-nav">
            <button onClick={() => handleScrollTo('features')} className="l-nav-link">
              Features
            </button>
            <button onClick={() => handleScrollTo('collaboration')} className="l-nav-link">
              Collab
            </button>
            <button onClick={() => handleScrollTo('security')} className="l-nav-link">
              Security
            </button>
          </nav>

          {/* Bottom-Right Start Drawing CTA */}
          <div className="l-corner-widget l-corner-cta">
            <button onClick={onStartDrawing} className="l-btn-primary">
              <span className="l-btn-primary-content">
                Start Drawing <ArrowRight className="w-4 h-4" />
              </span>
              <div className="l-btn-primary-bg" />
            </button>
          </div>
        </>
      )}

      {/* --- Split-Flap Overlay Menu --- */}
      <div className={`l-overlay-menu ${isOverlayOpen ? 'open' : ''}`}>
        <button className="l-overlay-close-btn" onClick={() => setIsOverlayOpen(false)}>
          <X className="w-6 h-6" />
        </button>

        <div className="l-overlay-nav">
          <button
            onClick={() => handleOverlayClick('features')}
            className="l-overlay-link-btn"
            onMouseEnter={() => setHoveredLink('features')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <ScrambleText
              text="FEATURES"
              triggerScramble={isOverlayOpen}
              isHovered={hoveredLink === 'features'}
            />
          </button>
          
          <button
            onClick={() => handleOverlayClick('collaboration')}
            className="l-overlay-link-btn"
            onMouseEnter={() => setHoveredLink('collaboration')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <ScrambleText
              text="COLLABORATION"
              triggerScramble={isOverlayOpen}
              isHovered={hoveredLink === 'collaboration'}
            />
          </button>

          <button
            onClick={() => handleOverlayClick('security')}
            className="l-overlay-link-btn"
            onMouseEnter={() => setHoveredLink('security')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <ScrambleText
              text="SECURITY"
              triggerScramble={isOverlayOpen}
              isHovered={hoveredLink === 'security'}
            />
          </button>

          <div className="l-overlay-action-container">
            <button
              onClick={() => {
                setIsOverlayOpen(false);
                setTimeout(onStartDrawing, 450);
              }}
              className="l-btn-primary"
            >
              <span className="l-btn-primary-content">
                Start Drawing <ArrowRight className="w-4 h-4" />
              </span>
              <div className="l-btn-primary-bg" />
            </button>
            <a
              href="https://github.com/rohit-simbanic/sleekDraw"
              target="_blank"
              rel="noreferrer"
              className="l-btn-github"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '9999px',
                fontSize: '14px',
              }}
            >
              <GithubIcon className="w-5 h-5" /> GitHub
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
