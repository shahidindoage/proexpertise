import { useLayoutEffect, useRef } from 'react';
import { gsap, REDUCED, goToSection } from '../lib/anim';
import Magnetic from './Magnetic';
import WaterBackground from './WaterBackground';

export default function Hero({ started }) {
  const rootRef = useRef(null);

  /* Per-letter spans so each character can catch the mouse */
  const toChars = (text) =>
    text.split('').map((ch, i) =>
      ch === ' ' ? (
        <span key={i} className="hero-char hero-sp">
          &nbsp;
        </span>
      ) : (
        <span key={i} className="hero-char">
          {ch}
        </span>
      )
    );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      /* Scroll-out parallax — created once, position is stable at scroll 0 */
      if (!REDUCED) {
        gsap.to('.hero-inner', {
          yPercent: -10,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        });
      }

      if (!started) return;

      /* Intro choreography — plays as the preloader curtain lifts */
      if (REDUCED) return;

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.hero-eyebrow > *', { y: -18, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.05)
        .from('.hero-line-in', { yPercent: 118, duration: 1.15, stagger: 0.09 }, 0.1)
        .from(
          '.hero-chip',
          { scaleX: 0, transformOrigin: 'left center', duration: 0.9, ease: 'power3.inOut' },
          0.75
        )
        .from('.hero-foot > *', { y: 28, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.9);
    }, root);

    return () => ctx.revert();
  }, [started]);

  return (
    <section className="hero" id="hero" ref={rootRef}>
      <div className="hero-bg" aria-hidden="true">
        <WaterBackground />
      </div>

      <div className="hero-inner">
        <div className="hero-eyebrow">
          <span className="mono-label">ProExpertise — Digital Marketing Studio</span>
        </div>

        <h1 className="hero-title">
          <span className="hero-line">
            <span className="hero-line-in">{toChars('WE TURN')}</span>
          </span>
          <span className="hero-line">
            <span className="hero-line-in">{toChars('SCROLLS')}</span>
          </span>
          <span className="hero-line hero-line-3">
            <span className="hero-line-in">{toChars('INTO')}</span>
            <span className="hero-chip">
              <img src="/img/hero-chip.jpg" alt="The ProExpertise studio team at work" />
            </span>
            <span className="hero-line-in">{toChars('SALES')}</span>
          </span>
        </h1>

        <div className="hero-foot">
          <p className="hero-sub">
            Your audience scrolls 90 meters a day. We give them a reason to stop — and a story
            worth sharing.
          </p>
          <Magnetic>
            <a href="#contact" className="pill-btn ghost" onClick={(e) => { e.preventDefault(); goToSection('#contact'); }} data-cursor="link">
              + Start Project
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
