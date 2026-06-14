import { useRef } from 'react';
import { gsap } from 'gsap';
import { Pencil, Library, Download, Move, Palette } from 'lucide-react';

export default function BentoGrid() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // mouse x inside card
    const y = e.clientY - rect.top;  // mouse y inside card

    // Get offset from center (-0.5 to 0.5)
    const xc = (x / rect.width) - 0.5;
    const yc = (y / rect.height) - 0.5;

    // Rotate card (max 8 degrees)
    gsap.to(card, {
      rotateY: xc * 16,
      rotateX: -yc * 16,
      transformPerspective: 600,
      ease: 'power1.out',
      duration: 0.3,
      shadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    });
  };

  const handleMouseLeave = (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    // Reset card rotation
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      ease: 'power2.out',
      duration: 0.5,
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    });
  };

  return (
    <section id="features" className="bento-section">
      {/* Decorative background glow */}
      <div className="glow-backdrop-2" style={{ top: '50%', left: '10%' }} />
      <div className="glow-backdrop-1" style={{ top: '30%', left: '80%' }} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="section-header">
          <div className="section-badge">
            <Pencil className="w-3.5 h-3.5" /> High-Performance Features
          </div>
          <h2 className="section-title">
            A Workspace Built For Speed
          </h2>
          <p className="section-subtext">
            Packed with all the tools you need to sketch, compile, and present your ideas instantly.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Card 1: Rough.js sketch style (Double wide) */}
          <div
            ref={(el) => { cardRefs.current[0] = el; }}
            onMouseMove={(e) => handleMouseMove(e, 0)}
            onMouseLeave={() => handleMouseLeave(0)}
            className="bento-card bento-card-2col"
          >
            {/* Background elements */}
            <div className="bento-bg-graphic">
              <svg>
                <path d="M 10,10 L 80,10 L 80,80 L 10,80 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5" />
              </svg>
            </div>

            <div>
              <div className="bento-icon-box icon-box-indigo">
                <Pencil className="w-6 h-6" />
              </div>
              <h3 className="bento-card-title">Rough.js Sketchy Style</h3>
              <p className="bento-card-desc">
                Bring your diagrams and wireframes to life with a beautiful, custom hand-drawn aesthetic. SleekDraw uses procedural math to sketch strokes, lines, and text notes.
              </p>
            </div>
            <span className="bento-card-action action-indigo">
              Procedural sketch engine &rarr;
            </span>
          </div>

          {/* Card 2: Excalidraw templates */}
          <div
            ref={(el) => { cardRefs.current[1] = el; }}
            onMouseMove={(e) => handleMouseMove(e, 1)}
            onMouseLeave={() => handleMouseLeave(1)}
            className="bento-card"
          >
            <div>
              <div className="bento-icon-box icon-box-pink">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="bento-card-title">Excalidraw Libraries</h3>
              <p className="bento-card-desc">
                Direct integration with Excalidraw’s public shape libraries. Browse, search, and download mockups, wireframes, and UML templates straight onto your whiteboard.
              </p>
            </div>
            <span className="bento-card-action action-pink">
              Browse community templates &rarr;
            </span>
          </div>

          {/* Card 3: Exports */}
          <div
            ref={(el) => { cardRefs.current[2] = el; }}
            onMouseMove={(e) => handleMouseMove(e, 2)}
            onMouseLeave={() => handleMouseLeave(2)}
            className="bento-card"
          >
            <div>
              <div className="bento-icon-box icon-box-emerald">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="bento-card-title">Vector Exporters</h3>
              <p className="bento-card-desc">
                Export your canvases as clean vector SVGs or high-definition PNGs. Perfect for embedding inside presentations, documentation, or Slack channels.
              </p>
            </div>
            <span className="bento-card-action action-emerald">
              SVG & PNG export support &rarr;
            </span>
          </div>

          {/* Card 4: Infinite zoom & panning (Double wide) */}
          <div
            ref={(el) => { cardRefs.current[3] = el; }}
            onMouseMove={(e) => handleMouseMove(e, 3)}
            onMouseLeave={() => handleMouseLeave(3)}
            className="bento-card bento-card-2col"
          >
            {/* Background pattern */}
            <div className="bento-bg-grid-pattern" />

            <div>
              <div className="bento-icon-box icon-box-purple">
                <Move className="w-6 h-6" />
              </div>
              <h3 className="bento-card-title">Infinite Zoom & Panning</h3>
              <p className="bento-card-desc">
                Pinch to zoom, pan around easily using Spacebar + drag, and zoom focused precisely around your cursor tip. There are no bounds to what you can draw.
              </p>
            </div>
            <span className="bento-card-action action-purple">
              Unlimited workspace limits &rarr;
            </span>
          </div>

          {/* Card 5: Customizable UI Styling */}
          <div
            ref={(el) => { cardRefs.current[4] = el; }}
            onMouseMove={(e) => handleMouseMove(e, 4)}
            onMouseLeave={() => handleMouseLeave(4)}
            className="bento-card bento-card-3col"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div className="bento-icon-box icon-box-amber">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="bento-card-title">Highly Configurable Styles</h3>
                <p className="bento-card-desc" style={{ maxWidth: '600px' }}>
                  Customize your canvas styling on the fly. Switch between vibrant colors, change border roughness/thickness, choose solid or dashed lines, or toggle between light and dark backgrounds.
                </p>
              </div>

              {/* Color circles styling demonstration */}
              <div className="bento-color-sandbox">
                <div className="sandbox-circle sb-rose" />
                <div className="sandbox-circle sb-blue" />
                <div className="sandbox-circle sb-emerald" />
                <div className="sandbox-circle sb-yellow" />
                <div className="sandbox-circle sb-purple" />
              </div>
            </div>
            <span className="bento-card-action action-amber">
              Premium styling sidebars &rarr;
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
