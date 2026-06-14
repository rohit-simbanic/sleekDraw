import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MousePointer, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartDrawing: () => void;
}

export default function Hero({ onStartDrawing }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<SVGSVGElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // SVG paths selectors
  const box1Path1Ref = useRef<SVGPathElement>(null);
  const box1Path2Ref = useRef<SVGPathElement>(null);
  const box1TextRef = useRef<SVGTextElement>(null);

  const arrow1PathRef = useRef<SVGPathElement>(null);
  const arrow1TipRef = useRef<SVGPathElement>(null);

  const serverCircleRef = useRef<SVGCircleElement>(null);
  const serverCircle2Ref = useRef<SVGCircleElement>(null);
  const serverTextRef = useRef<SVGTextElement>(null);

  const arrow2PathRef = useRef<SVGPathElement>(null);
  const arrow2TipRef = useRef<SVGPathElement>(null);

  const box2Path1Ref = useRef<SVGPathElement>(null);
  const box2Path2Ref = useRef<SVGPathElement>(null);
  const box2TextRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    // 1. Text reveals
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

    tl.fromTo(
      headlineRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, delay: 0.3 }
    )
      .fromTo(
        subheadlineRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1 },
        '-=0.9'
      )
      .fromTo(
        ctaBtnRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1 },
        '-=0.8'
      );
    // 2. SVG Path-drawing timeline with simulated cursor
    // Initialize all paths length and strokeDasharray
    const initializePath = (pathEl: SVGPathElement | SVGCircleElement | null) => {
      if (!pathEl) return 0;
      const length = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${length}`;
      pathEl.style.strokeDashoffset = `${length}`;
      return length;
    };

    const lenBox1_1 = initializePath(box1Path1Ref.current);
    const lenBox1_2 = initializePath(box1Path2Ref.current);
    const lenArrow1 = initializePath(arrow1PathRef.current);
    const lenArrow1Tip = initializePath(arrow1TipRef.current);
    const lenCircle = initializePath(serverCircleRef.current);
    const lenCircle2 = initializePath(serverCircle2Ref.current);
    const lenArrow2 = initializePath(arrow2PathRef.current);
    const lenArrow2Tip = initializePath(arrow2TipRef.current);
    const lenBox2_1 = initializePath(box2Path1Ref.current);
    const lenBox2_2 = initializePath(box2Path2Ref.current);

    if (box1TextRef.current) box1TextRef.current.style.opacity = '0';
    if (serverTextRef.current) serverTextRef.current.style.opacity = '0';
    if (box2TextRef.current) box2TextRef.current.style.opacity = '0';

    // Position initial cursor
    gsap.set(cursorRef.current, { x: 50, y: 80, opacity: 0 });

    const drawTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 1 });

    // Show cursor
    drawTl.to(cursorRef.current, { opacity: 1, duration: 0.3 });

    // Draw Box 1 (Path 1)
    drawTl.to(cursorRef.current, {
      x: 210,
      y: 80,
      duration: 0.8,
      ease: 'power1.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (box1Path1Ref.current) {
          box1Path1Ref.current.style.strokeDashoffset = `${lenBox1_1 * (1 - progress)}`;
        }
      },
    });

    // Draw Box 1 (Path 2)
    drawTl.to(cursorRef.current, {
      x: 210,
      y: 160,
      duration: 0.5,
      ease: 'power1.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (box1Path2Ref.current) {
          box1Path2Ref.current.style.strokeDashoffset = `${lenBox1_2 * (1 - progress)}`;
        }
      },
    });

    // Fade in Box 1 Text
    drawTl.to(box1TextRef.current, { opacity: 1, duration: 0.3 }, '-=0.1');

    // Move to Arrow 1 starting point
    drawTl.to(cursorRef.current, { x: 210, y: 120, duration: 0.4, ease: 'power2.inOut' });

    // Draw Arrow 1 Line
    drawTl.to(cursorRef.current, {
      x: 320,
      y: 120,
      duration: 0.6,
      ease: 'power1.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (arrow1PathRef.current) {
          arrow1PathRef.current.style.strokeDashoffset = `${lenArrow1 * (1 - progress)}`;
        }
      },
    });

    // Draw Arrow 1 Tip
    drawTl.to(cursorRef.current, {
      x: 310,
      y: 125,
      duration: 0.2,
      onUpdate: function () {
        const progress = this.progress();
        if (arrow1TipRef.current) {
          arrow1TipRef.current.style.strokeDashoffset = `${lenArrow1Tip * (1 - progress)}`;
        }
      },
    });

    // Move to Server Circle starting point
    drawTl.to(cursorRef.current, { x: 380, y: 80, duration: 0.4, ease: 'power2.inOut' });

    // Draw Server Circle
    drawTl.to(cursorRef.current, {
      x: 380,
      y: 160,
      duration: 0.7,
      ease: 'power1.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (serverCircleRef.current) {
          serverCircleRef.current.style.strokeDashoffset = `${lenCircle * (1 - progress)}`;
        }
        if (serverCircle2Ref.current) {
          serverCircle2Ref.current.style.strokeDashoffset = `${lenCircle2 * (1 - progress)}`;
        }
      },
    });

    // Fade in Server Text
    drawTl.to(serverTextRef.current, { opacity: 1, duration: 0.3 }, '-=0.1');

    // Move cursor to Arrow 2 start
    drawTl.to(cursorRef.current, { x: 440, y: 120, duration: 0.4, ease: 'power2.inOut' });

    // Draw Arrow 2 Line
    drawTl.to(cursorRef.current, {
      x: 550,
      y: 120,
      duration: 0.6,
      ease: 'power1.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (arrow2PathRef.current) {
          arrow2PathRef.current.style.strokeDashoffset = `${lenArrow2 * (1 - progress)}`;
        }
      },
    });

    // Draw Arrow 2 Tip
    drawTl.to(cursorRef.current, {
      x: 540,
      y: 125,
      duration: 0.2,
      onUpdate: function () {
        const progress = this.progress();
        if (arrow2TipRef.current) {
          arrow2TipRef.current.style.strokeDashoffset = `${lenArrow2Tip * (1 - progress)}`;
        }
      },
    });

    // Draw Box 2 (Path 1)
    drawTl.to(cursorRef.current, {
      x: 710,
      y: 80,
      duration: 0.8,
      ease: 'power1.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (box2Path1Ref.current) {
          box2Path1Ref.current.style.strokeDashoffset = `${lenBox2_1 * (1 - progress)}`;
        }
      },
    });

    // Draw Box 2 (Path 2)
    drawTl.to(cursorRef.current, {
      x: 710,
      y: 160,
      duration: 0.5,
      ease: 'power1.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (box2Path2Ref.current) {
          box2Path2Ref.current.style.strokeDashoffset = `${lenBox2_2 * (1 - progress)}`;
        }
      },
    });

    // Fade in Box 2 Text
    drawTl.to(box2TextRef.current, { opacity: 1, duration: 0.3 }, '-=0.1');

    // Fade out cursor at end
    drawTl.to(cursorRef.current, { opacity: 0, duration: 0.3 });

    return () => {
      tl.kill();
      drawTl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="hero-section">
      {/* Background Decorative Grid */}
      <div className="landing-grid-bg" />

      {/* Glow Effects */}
      <div className="glow-backdrop-1" />
      <div className="glow-backdrop-2" />

      <div className="hero-content">
        {/* Badge */}
        <div className="hero-badge">
          <Sparkles className="w-3.5 h-3.5" /> Real-Time E2EE Collaborative Canvas
        </div>

        {/* Headline */}
        <h1 ref={headlineRef} className="hero-title">
          Draw sketchy diagrams.{' '}
          <span className="hero-title-gradient">
            Collaborate securely.
          </span>
        </h1>

        {/* Subheading */}
        <p ref={subheadlineRef} className="hero-subtext">
          A premium, hand-drawn styled collaborative whiteboard. Fully E2E encrypted, responsive, and packed with customizable Excalidraw community templates.
        </p>

        {/* CTA Button */}
        <button
          ref={ctaBtnRef}
          onClick={onStartDrawing}
          className="hero-btn-large"
        >
          <span className="l-btn-primary-content">
            Launch Whiteboard Canvas
            <MousePointer className="w-5 h-5" />
          </span>
          <div className="l-btn-primary-bg" />
        </button>

        {/* Animated Sketch Canvas Board */}
        <div className="hero-canvas-mockup">
          {/* Top Panel Buttons Mock */}
          <div className="mock-window-dots">
            <div className="mock-dot mock-dot-red" />
            <div className="mock-dot mock-dot-yellow" />
            <div className="mock-dot mock-dot-green" />
            <span className="mock-window-title">demo_scene.sleekdraw</span>
          </div>

          <div className="mock-canvas-area">
            {/* SVG drawing content */}
            <svg ref={canvasRef} viewBox="0 0 800 240" className="mock-svg-canvas">
              {/* Box 1: Client A */}
              <path
                ref={box1Path1Ref}
                d="M 50,80 L 210,80 L 210,160 M 210,160 L 50,160 L 50,80"
                stroke="#6366f1"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                ref={box1Path2Ref}
                d="M 52,82 L 208,82 L 208,158 M 208,158 L 52,158 L 52,82"
                stroke="#6366f1"
                strokeWidth="1.5"
                opacity="0.7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                ref={box1TextRef}
                x="130"
                y="126"
                fill="#ffffff"
                fontFamily="Outfit, sans-serif"
                fontWeight="bold"
                fontSize="16px"
                textAnchor="middle"
              >
                Client A (Sender)
              </text>

              {/* Arrow 1 */}
              <path
                ref={arrow1PathRef}
                d="M 210,120 L 320,120"
                stroke="#a855f7"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                ref={arrow1TipRef}
                d="M 310,113 L 320,120 L 310,127"
                stroke="#a855f7"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Server Node (Circle) */}
              <path
                ref={serverCircleRef}
                d="M 380,80 C 424,80 424,160 380,160 C 336,160 336,80 380,80 Z"
                stroke="#ec4899"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                ref={serverCircle2Ref}
                d="M 379,81 C 422,81 422,159 379,159 C 337,159 337,81 379,81 Z"
                stroke="#ec4899"
                strokeWidth="1.5"
                opacity="0.6"
                fill="none"
                strokeLinecap="round"
              />
              <text
                ref={serverTextRef}
                x="380"
                y="126"
                fill="#ffffff"
                fontFamily="Outfit, sans-serif"
                fontWeight="bold"
                fontSize="16px"
                textAnchor="middle"
              >
                Relay Server
              </text>

              {/* Arrow 2 */}
              <path
                ref={arrow2PathRef}
                d="M 440,120 L 550,120"
                stroke="#a855f7"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                ref={arrow2TipRef}
                d="M 540,113 L 550,120 L 540,127"
                stroke="#a855f7"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Box 2: Client B */}
              <path
                ref={box2Path1Ref}
                d="M 550,80 L 710,80 L 710,160 M 710,160 L 550,160 L 550,80"
                stroke="#10b981"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                ref={box2Path2Ref}
                d="M 552,82 L 708,82 L 708,158 M 708,158 L 552,158 L 552,82"
                stroke="#10b981"
                strokeWidth="1.5"
                opacity="0.7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                ref={box2TextRef}
                x="630"
                y="126"
                fill="#ffffff"
                fontFamily="Outfit, sans-serif"
                fontWeight="bold"
                fontSize="16px"
                textAnchor="middle"
              >
                Client B (Peer)
              </text>
            </svg>

            {/* Flying Draw Cursor */}
            <div ref={cursorRef} className="ghost-cursor">
              <MousePointer className="w-5 h-5 fill-current rotate-90" />
              <div className="ghost-cursor-label">
                Drawing...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
