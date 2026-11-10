import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, REDUCED } from '../lib/anim';
import { TICKER_ITEMS } from '../data/site';

const Star = () => (
  <svg className="tk-star" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="currentColor" />
  </svg>
);

export default function Ticker() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    let tick = null;
    const ctx = gsap.context(() => {
      const track = root.querySelector('.ticker-track');
      const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 26, repeat: -1 });

      if (REDUCED) {
        loop.timeScale(0.25);
        return;
      }

      /* Marquee accelerates with scroll velocity, then eases back */
      let target = 1;
      let current = 1;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          target = 1 + Math.min(Math.abs(self.getVelocity()) / 1200, 3);
        },
      });
      tick = () => {
        target += (1 - target) * 0.05;
        current += (target - current) * 0.12;
        loop.timeScale(current);
      };
      gsap.ticker.add(tick);
    }, root);

    return () => {
      if (tick) gsap.ticker.remove(tick);
      ctx.revert();
    };
  }, []);

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="ticker" ref={rootRef} aria-hidden="true">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span className="tk-item" key={`${item}-${i}`}>
            <span className={i % 2 ? 'tk-text outline' : 'tk-text'}>{item}</span>
            <Star />
          </span>
        ))}
      </div>
    </div>
  );
}
