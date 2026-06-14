import { useState, useEffect, useRef } from 'react';
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
  style: 'pill' | 'laser' | 'corner' | 'split-flap';
  onStartDrawing: () => void;
}

// Scramble text sub-component
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

  // States for scroll pill behavior
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // SVG Refs for laser border style
  const rectRef = useRef<SVGRectElement>(null);
  const glowRef = useRef<SVGRectElement>(null);
  const laserTweenRef = useRef<gsap.core.Tween | null>(null);

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
    }, 450); // wait for menu overlay close animation
  };

  // --- Pill Style Scroll Tracking ---
  useEffect(() => {
    if (style !== 'pill') {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [style]);

  // --- Pill Style Animating/Morphing ---
  useEffect(() => {
    if (style !== 'pill') return;

    const navbar = document.querySelector('.l-navbar');
    const links = document.querySelectorAll('.l-nav-menu .l-nav-link');
    const githubBtn = document.querySelector('.l-navbar .l-btn-github');
    const brandName = document.querySelector('.l-navbar .l-brand-name');
    const primaryBtn = document.querySelector('.l-navbar .l-btn-primary');

    if (!navbar) return;

    if (isScrolled && !isHovered) {
      // Shrink into a pill
      gsap.to(navbar, {
        maxWidth: '480px',
        borderRadius: '30px',
        padding: '6px 12px',
        background: 'rgba(10, 10, 12, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(links, {
        opacity: 0,
        scale: 0.8,
        display: 'none',
        duration: 0.2,
      });
      if (githubBtn) {
        gsap.to(githubBtn, {
          opacity: 0,
          display: 'none',
          duration: 0.2,
        });
      }
      if (brandName) {
        gsap.to(brandName, {
          fontSize: '16px',
          duration: 0.3,
        });
      }
      if (primaryBtn) {
        gsap.to(primaryBtn, {
          padding: '8px 16px',
          fontSize: '12px',
          duration: 0.4,
        });
      }
    } else {
      // Expand back out (scrolled + hovered, or not scrolled at all)
      gsap.to(navbar, {
        maxWidth: '1200px',
        borderRadius: '9999px',
        padding: '10px 24px',
        background: isScrolled ? 'rgba(10, 10, 12, 0.9)' : 'rgba(0, 0, 0, 0.4)',
        borderColor: isScrolled ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
        boxShadow: isScrolled ? '0 12px 40px rgba(0, 0, 0, 0.7)' : '0 8px 32px rgba(0, 0, 0, 0.5)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(links, {
        opacity: 1,
        scale: 1,
        display: 'inline-block',
        duration: 0.3,
        stagger: 0.02,
        delay: 0.05,
      });
      if (githubBtn) {
        gsap.to(githubBtn, {
          opacity: 1,
          display: 'flex',
          duration: 0.3,
          delay: 0.05,
        });
      }
      if (brandName) {
        gsap.to(brandName, {
          fontSize: '20px',
          duration: 0.3,
        });
      }
      if (primaryBtn) {
        gsap.to(primaryBtn, {
          padding: '10px 24px',
          fontSize: '14px',
          duration: 0.4,
        });
      }
    }
  }, [isScrolled, isHovered, style]);

  // --- Laser Style Path Tracing & Scroll Velocity ---
  useEffect(() => {
    if (style !== 'laser') return;

    const updatePathLength = () => {
      if (glowRef.current && rectRef.current) {
        const length = glowRef.current.getTotalLength();
        
        // Setup initial stroke attributes
        gsap.set([glowRef.current, rectRef.current], {
          strokeDasharray: length,
        });
        gsap.set(glowRef.current, {
          strokeDasharray: `110 ${length}`,
          strokeDashoffset: 0,
        });

        // Terminate active tweens
        if (laserTweenRef.current) {
          laserTweenRef.current.kill();
        }

        // Loop the laser dot infinitely
        laserTweenRef.current = gsap.to(glowRef.current, {
          strokeDashoffset: -length,
          duration: 4,
          ease: 'none',
          repeat: -1,
        });
      }
    };

    // Wait slightly for DOM to compute layout rect dimensions
    const timer = setTimeout(updatePathLength, 50);
    window.addEventListener('resize', updatePathLength);

    // Track scroll speed to scale loop speed
    let lastScrollY = window.scrollY;
    let velocityTween: gsap.core.Tween | null = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;

      if (laserTweenRef.current) {
        const targetScale = gsap.utils.clamp(1, 4.5, 1 + velocity * 0.06);
        
        if (velocityTween) velocityTween.kill();
        
        velocityTween = gsap.to(laserTweenRef.current, {
          timeScale: targetScale,
          duration: 0.15,
          overwrite: 'auto',
          onComplete: () => {
            gsap.to(laserTweenRef.current!, {
              timeScale: 1,
              duration: 0.6,
              delay: 0.1,
              overwrite: 'auto',
            });
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePathLength);
      window.removeEventListener('scroll', handleScroll);
      if (laserTweenRef.current) laserTweenRef.current.kill();
      if (velocityTween) velocityTween.kill();
    };
  }, [style]);

  // --- Corner Dock Convergence Animation ---
  useEffect(() => {
    // Reset standard layout inline styling initially
    const mainNavbar = document.querySelector('.l-navbar');
    gsap.set(mainNavbar, { clearProps: 'all' });

    if (style !== 'corner') return;

    const logo = document.querySelector('.l-corner-logo');
    const github = document.querySelector('.l-corner-github');
    const nav = document.querySelector('.l-corner-nav');
    const cta = document.querySelector('.l-corner-cta');

    if (!mainNavbar || !logo || !github || !nav || !cta) return;

    // Initially hide center top header and show corner docks
    gsap.set(mainNavbar, { opacity: 0, y: -20, pointerEvents: 'none' });
    gsap.set([logo, github, nav, cta], { opacity: 1, scale: 1 });

    // Scrub animations from corner positions merging into top center header
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

  // --- Split-Flap Slide Down Animation ---
  useEffect(() => {
    if (style !== 'split-flap') {
      setIsOverlayOpen(false);
      return;
    }

    if (isOverlayOpen) {
      // Prevent body scrolling when menu is full screen
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
      // Restore standard body scroll setting for landing
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
        <div
          className="l-navbar"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Logo */}
          <div className="l-logo-container" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="l-logo-box">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="l-brand-name">
              Sleek<span className="l-brand-gradient">Draw</span>
            </span>
          </div>

          {/* Desktop Nav - Hidden in split-flap / corner style at start */}
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
              className="l-btn-primary"
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <span className="l-btn-primary-content">
                Menu <MenuIcon className="w-4 h-4" />
              </span>
              <div className="l-btn-primary-bg" />
            </button>
          )}

          {/* SVG Laser Border */}
          {style === 'laser' && (
            <svg className="l-laser-svg">
              <rect
                ref={rectRef}
                className="l-laser-path"
                rx="9999"
                width="100%"
                height="100%"
              />
              <rect
                ref={glowRef}
                className="l-laser-glow"
                rx="9999"
                width="100%"
                height="100%"
              />
            </svg>
          )}

          {/* Mobile menu trigger */}
          {style !== 'split-flap' && style !== 'corner' && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="l-navbar-menu-trigger"
            >
              {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Standard Mobile Drawer */}
        {isOpen && style !== 'split-flap' && style !== 'corner' && (
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

      {/* --- Corner Docks Mode Widgets --- */}
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
