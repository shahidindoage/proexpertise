import { useLayoutEffect, useRef } from 'react';
import { gsap, REDUCED, goToSection } from '../lib/anim';
import Magnetic from './Magnetic';

export default function BigCTA() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      if (REDUCED) return;
      gsap.from('.cta-line-in', {
        yPercent: 115,
        duration: 1,
        stagger: 0.12,
        ease: 'power4.out',
        scrollTrigger: { trigger: root, start: 'top 78%' },
      });
      gsap.from('.cta-side > *', {
        opacity: 0,
        y: 26,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 72%' },
      });
      /* Slow push-in on the photo while the section crosses the viewport */
      gsap.fromTo(
        '.cta-chip img',
        { scale: 1.25 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="cta" ref={rootRef}>
      <div className="sec-head mono-label">
        {/* <span>(03) Next step</span>
        <span>One conversation away</span> */}
      </div>

      <div className="cta-grid">
        <h2 className="cta-title">
          <span className="cta-line">
            <span className="cta-line-in">GOT A BRAND?</span>
          </span>
          <span className="cta-line">
            <span className="cta-line-in">LET&apos;S MAKE IT LOUD.</span>
          </span>
        </h2>
        <div className="cta-side">
          <div className="cta-chip">
            <img src="/img/cta-chip.jpg" alt="Strategy session at the studio" loading="lazy" />
          </div>
          <Magnetic>
            <a
              href="#contact"
              className="cta-link mono-label"
              onClick={(e) => { e.preventDefault(); goToSection('#contact'); }}
              data-cursor="link"
            >
              + Start Project
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
