import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, MousePointer } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function CollabSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);

  // Cursors
  const cursor1Ref = useRef<HTMLDivElement>(null); // Pink cursor
  const cursor2Ref = useRef<HTMLDivElement>(null); // Yellow cursor
  const cursor3Ref = useRef<HTMLDivElement>(null); // Blue cursor

  // Drawing elements refs
  const drawRectRef = useRef<SVGPathElement>(null);
  const drawArrowRef = useRef<SVGPathElement>(null);
  const textNodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal header
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
          end: 'top 50%',
          scrub: false,
          toggleActions: 'play none none none',
        },
      }
    );

    // Timeline for the collaboration simulation triggered on enter
    const initializePath = (pathEl: SVGPathElement | null) => {
      if (!pathEl) return 0;
      const length = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${length}`;
      pathEl.style.strokeDashoffset = `${length}`;
      return length;
    };

    const rectLength = initializePath(drawRectRef.current);
    const arrowLength = initializePath(drawArrowRef.current);

    if (textNodeRef.current) {
      textNodeRef.current.style.opacity = '0';
      textNodeRef.current.style.transform = 'scale(0.8)';
    }

    // Positions initial hidden state of cursors
    gsap.set([cursor1Ref.current, cursor2Ref.current, cursor3Ref.current], {
      x: () => Math.random() * 200 - 100,
      y: () => Math.random() * 200 + 400,
      opacity: 0,
    });

    const collabTl = gsap.timeline({
      scrollTrigger: {
        trigger: whiteboardRef.current,
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    });

    // Cursors slide in
    collabTl
      .to(
        cursor1Ref.current,
        { x: 150, y: 80, opacity: 1, duration: 1, ease: 'power2.out' }
      )
      .to(
        cursor2Ref.current,
        { x: 450, y: 220, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
      )
      .to(
        cursor3Ref.current,
        { x: 500, y: 80, opacity: 1, duration: 1.1, ease: 'power2.out' },
        '-=0.7'
      );

    // Cursor 1 (Pink) draws a sketchy rectangle
    collabTl.to(cursor1Ref.current, {
      x: 350,
      y: 80,
      duration: 0.8,
      ease: 'sine.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (drawRectRef.current) {
          drawRectRef.current.style.strokeDashoffset = `${rectLength * (1 - progress)}`;
        }
      },
    });

    // Cursor 1 moves down to finish double sketch effect slightly
    collabTl.to(cursor1Ref.current, {
      x: 350,
      y: 160,
      duration: 0.4,
      ease: 'sine.inOut',
    });

    // Cursor 2 (Yellow) writes/spawns a text box
    collabTl.to(cursor2Ref.current, {
      x: 200,
      y: 200,
      duration: 0.8,
      ease: 'power2.inOut',
    });

    // Type text animation / Scale text node up
    collabTl.to(
      textNodeRef.current,
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      },
      '-=0.2'
    );

    // Cursor 3 (Blue) draws a connecting arrow
    collabTl.to(cursor3Ref.current, {
      x: 250,
      y: 120,
      duration: 0.7,
      ease: 'power2.inOut',
    });

    collabTl.to(cursor3Ref.current, {
      x: 250,
      y: 190,
      duration: 0.8,
      ease: 'sine.inOut',
      onUpdate: function () {
        const progress = this.progress();
        if (drawArrowRef.current) {
          drawArrowRef.current.style.strokeDashoffset = `${arrowLength * (1 - progress)}`;
        }
      },
    });

    // All cursors move slightly away to reveal final drawing
    collabTl.to(
      [cursor1Ref.current, cursor2Ref.current, cursor3Ref.current],
      {
        x: '+=40',
        y: '+=40',
        duration: 0.8,
        ease: 'power1.out',
      },
      '+=0.2'
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} id="collaboration" className="collab-section">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div ref={titleRef} className="section-header opacity-0">
          <div className="section-badge section-badge-pink">
            <Users className="w-3.5 h-3.5" /> Synchronized Whiteboarding
          </div>
          <h2 className="section-title">
            Real-Time Collaboration
          </h2>
          <p className="section-subtext">
            Brainstorm and draw with your teammates in real-time. Watch their cursors guide your attention dynamically.
          </p>
        </div>

        {/* Collaborative Simulator Area */}
        <div ref={whiteboardRef} className="collab-board-wrapper">
          {/* Simulated Peer User tags and drawing elements */}
          <div className="collab-users-badge">
            <div className="collab-avatar-stack">
              <div className="collab-avatar avatar-1" />
              <div className="collab-avatar avatar-2" />
              <div className="collab-avatar avatar-3" />
            </div>
            <span className="collab-users-count">3 users active in room</span>
          </div>

          {/* SVG Whiteboard lines */}
          <svg className="w-full h-full pointer-events-none absolute inset-0 select-none">
            {/* Sketchy Rectangle drawn by User 1 (Pink) */}
            <path
              ref={drawRectRef}
              d="M 150,80 L 350,80 L 350,160 L 150,160 Z"
              stroke="#ec4899"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Connecting Arrow drawn by User 3 (Blue) */}
            <path
              ref={drawArrowRef}
              d="M 250,120 L 250,190"
              stroke="#3b82f6"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Arrow Tip */}
            <path
              d="M 245,183 L 250,190 L 255,183"
              stroke="#3b82f6"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Floating typed text node placed by User 2 */}
          <div ref={textNodeRef} className="collab-text-bubble">
            ✏️ Let's build the mockups here!
          </div>

          {/* Cursors */}
          {/* User 1 (Pink) */}
          <div ref={cursor1Ref} className="collab-cursor collab-cursor-pink">
            <MousePointer className="w-5 h-5 fill-current rotate-90" />
            <div className="cursor-tag">
              rohit (drawing)
            </div>
          </div>

          {/* User 2 (Yellow) */}
          <div ref={cursor2Ref} className="collab-cursor collab-cursor-yellow">
            <MousePointer className="w-5 h-5 fill-current rotate-90" />
            <div className="cursor-tag">
              rray (typing)
            </div>
          </div>

          {/* User 3 (Blue) */}
          <div ref={cursor3Ref} className="collab-cursor collab-cursor-blue">
            <MousePointer className="w-5 h-5 fill-current rotate-90" />
            <div className="cursor-tag">
              alex (connecting)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
