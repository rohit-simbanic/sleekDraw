import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, Server, ArrowRight, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function E2EEVisualizer() {
  const titleRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const shield1Ref = useRef<HTMLDivElement>(null);
  const shield2Ref = useRef<HTMLDivElement>(null);

  const [packetText, setPacketText] = useState('{"x":12,"y":40}');
  const [packetColor, setPacketColor] = useState('border-indigo-500 text-indigo-300 bg-indigo-500/10');

  useEffect(() => {
    // Title fade-in
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none none',
        },
      }
    );

    // Text Scrambler Function
    const scrambleText = (targetText: string, onUpdate: (txt: string) => void, durationMs = 600) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
      const steps = 15;
      const stepTime = durationMs / steps;
      let step = 0;

      const interval = setInterval(() => {
        let scrambled = '';
        for (let i = 0; i < targetText.length; i++) {
          if (step >= steps || Math.random() < step / steps) {
            scrambled += targetText[i];
          } else {
            scrambled += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        onUpdate(scrambled);
        step++;

        if (step > steps) {
          clearInterval(interval);
        }
      }, stepTime);

      return interval;
    };

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
      scrollTrigger: {
        trigger: trackRef.current,
        start: 'top 75%',
      },
    });

    // Reset packet properties at start
    tl.add(() => {
      setPacketText('{"x":12,"y":40}');
      setPacketColor('border-indigo-500 text-indigo-300 bg-indigo-500/10');
      gsap.set(packetRef.current, { x: 50, opacity: 0 });
    });

    // Fade in packet at Client A
    tl.to(packetRef.current, { opacity: 1, duration: 0.3 })
      // Glide to Encryption Shield
      .to(packetRef.current, {
        x: 230,
        duration: 1.2,
        ease: 'power1.inOut',
      });

    // Pulse Encryption Shield & Scramble Packet to ciphertext
    tl.add(() => {
      // Pulse shield
      gsap.fromTo(shield1Ref.current, { scale: 1, borderColor: 'rgba(236,72,153,0.5)' }, { scale: 1.2, borderColor: 'rgba(236,72,153,1)', duration: 0.3, yoyo: true, repeat: 1 });
      // Scramble text
      scrambleText('e8f2c3a910d6b4f7', (txt) => setPacketText(txt));
      setPacketColor('border-pink-500 text-pink-300 bg-pink-500/10');
    })
      .to(packetRef.current, { x: 250, duration: 0.2 }); // quick nudge past shield

    // Glide through Relay Server to Decryption Shield
    tl.to(packetRef.current, {
      x: 550,
      duration: 1.8,
      ease: 'power1.inOut',
    });

    // Pulse Decryption Shield & Descramble Packet back to clean JSON
    tl.add(() => {
      // Pulse shield
      gsap.fromTo(shield2Ref.current, { scale: 1, borderColor: 'rgba(16,185,129,0.5)' }, { scale: 1.2, borderColor: 'rgba(16,185,129,1)', duration: 0.3, yoyo: true, repeat: 1 });
      // Scramble text back
      scrambleText('{"x":12,"y":40}', (txt) => setPacketText(txt));
      setPacketColor('border-emerald-500 text-emerald-300 bg-emerald-500/10');
    })
      .to(packetRef.current, { x: 570, duration: 0.2 });

    // Glide to Client B
    tl.to(packetRef.current, {
      x: 750,
      duration: 1.2,
      ease: 'power1.inOut',
    })
      // Fade out packet
      .to(packetRef.current, { opacity: 0, duration: 0.4 });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={trackRef} id="security" className="e2ee-section">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-white/5 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Title */}
        <div ref={titleRef} className="section-header opacity-0">
          <div className="section-badge section-badge-emerald">
            <Lock className="w-3.5 h-3.5" /> Client-Side Encryption
          </div>
          <h2 className="section-title">
            End-to-End Encrypted (E2EE)
          </h2>
          <p className="section-subtext">
            Your canvas data is encrypted inside your browser before sending. Only room members with the URL secret key can decrypt it.
          </p>
        </div>

        {/* E2EE Animation Track Dashboard */}
        <div className="e2ee-track-container">
          {/* Nodes Container */}
          <div className="e2ee-track-wrapper">
            {/* Horizontal Track Guide Line */}
            <div className="e2ee-rail" />

            {/* Node 1: Client A (Sender) */}
            <div className="e2ee-node">
              <div className="node-box node-box-sender">
                <span className="text-2xl">💻</span>
                <span className="node-text-id">Client A</span>
              </div>
              <span className="node-title">Sender Browser</span>
            </div>

            {/* Shield 1: Client-Side Encryption Key */}
            <div ref={shield1Ref} className="e2ee-shield shield-pink">
              <div className="shield-icon-circle">
                <Lock className="w-5 h-5" />
              </div>
              <span className="shield-label">WEB CRYPTO</span>
            </div>

            {/* Node 2: Insecure Relay Server */}
            <div className="e2ee-node">
              <div className="node-box node-box-relay">
                <Server className="w-8 h-8 text-slate-400" />
                <span className="node-text-id">Relay Server</span>
              </div>
              <span className="node-title">Cannot Read Data</span>
            </div>

            {/* Shield 2: Client-Side Decryption Key */}
            <div ref={shield2Ref} className="e2ee-shield shield-emerald">
              <div className="shield-icon-circle">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="shield-label">SECRET KEY</span>
            </div>

            {/* Node 3: Client B (Recipient) */}
            <div className="e2ee-node">
              <div className="node-box node-box-recipient">
                <span className="text-2xl">💻</span>
                <span className="node-text-id">Client B</span>
              </div>
              <span className="node-title">Recipient Browser</span>
            </div>

            {/* Animated Data Packet */}
            <div ref={packetRef} className={`e2ee-packet ${packetColor}`}>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{packetText}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
