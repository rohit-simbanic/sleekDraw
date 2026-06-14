import { ArrowRight, Lock, Users, Sparkles } from 'lucide-react';

interface LandingCTAProps {
  onStartDrawing: () => void;
}

export default function LandingCTA({ onStartDrawing }: LandingCTAProps) {
  return (
    <section className="l-cta-section">
      {/* Decorative gradient overlay */}
      <div className="glow-backdrop-cta" />

      {/* Grid Pattern background */}
      <div className="landing-grid-bg" style={{ opacity: 0.03 }} />

      <div className="l-cta-card">
        <div className="l-cta-card-content">
          {/* Highlights */}
          <div className="l-cta-highlights">
            <span className="l-cta-badge-dot">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> E2EE Private
            </span>
            <div className="l-cta-divider" />
            <span className="l-cta-badge-dot">
              <Users className="w-3.5 h-3.5 text-pink-400" /> Real-time Sync
            </span>
            <div className="l-cta-divider" />
            <span className="l-cta-badge-dot">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Free Forever
            </span>
          </div>

          <h2 className="l-cta-title">
            Ready to start sketching?
          </h2>
          <p className="l-cta-desc">
            Create custom E2E encrypted collaboration rooms, invite your colleagues, and build diagrams in minutes. No account signup needed.
          </p>

          <button
            onClick={onStartDrawing}
            className="l-btn-cta-large"
          >
            <span className="l-btn-primary-content">
              Launch SleekDraw Now
              <ArrowRight className="w-5 h-5" />
            </span>
            <div className="l-btn-primary-bg" />
          </button>
        </div>
      </div>
    </section>
  );
}
