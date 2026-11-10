import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, REDUCED } from '../lib/anim';
import { TESTIMONIALS } from '../data/site';

export default function Testimonials() {
  const rootRef = useRef(null);
  const quoteRef = useRef(null);
  const authorRef = useRef(null);
  const pausedRef = useRef(false);
  const [idx, setIdx] = useState(0);

  const t = TESTIMONIALS[idx];

  /* Auto-advance, politely pausing on hover */
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIdx((v) => (v + 1) % TESTIMONIALS.length);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  /* Crossfade + rise on every change */
  useLayoutEffect(() => {
    if (REDUCED) return;
    const tl = gsap.timeline();
    tl.fromTo(
      quoteRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
    ).fromTo(
      authorRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.4'
    );
    return () => tl.kill();
  }, [idx]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      if (REDUCED) return;
      gsap.from('.tst-title', {
        yPercent: 110,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: { trigger: root, start: 'top 82%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="tst"
      ref={rootRef}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="tst-head">
        <div className="tst-mask">
          <h2 className="tst-title">WHAT OUR CLIENTS SAY</h2>
        </div>
        <div className="tst-nav">
          <button
            type="button"
            className="circle-btn"
            aria-label="Previous testimonial"
            onClick={() => setIdx((idx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M19 12H5m0 0l6-6m-6 6l6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="circle-btn"
            aria-label="Next testimonial"
            onClick={() => setIdx((idx + 1) % TESTIMONIALS.length)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <blockquote className="tst-quote" ref={quoteRef}>
        <span className="tst-mark">“</span>
        {t.quote}
        <span>”</span>
      </blockquote>

      <div className="tst-row">
        <div className="tst-author" ref={authorRef}>
          <img src={t.img} alt={t.name} className="tst-avatar" />
          <div>
            <div className="tst-name">{t.name}</div>
            <div className="tst-role mono-label">{t.role}</div>
          </div>
        </div>
        <div className="tst-people" role="tablist" aria-label="Choose testimonial">
          {TESTIMONIALS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`Show testimonial from ${p.name}`}
              className={`tst-person ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
            >
              <img src={p.img} alt="" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
