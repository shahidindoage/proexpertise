import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, REDUCED, goToSection } from '../lib/anim';
import { FOOTER } from '../data/site';
import Magnetic from './Magnetic';

const SITEMAP = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Testimonials', href: '#contact' },
  { label: 'Start Project', href: '#contact' },
];

export default function Footer() {
  const rootRef = useRef(null);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-GB', { hour12: false }));

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB', { hour12: false })), 1000);
    return () => clearInterval(id);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      if (REDUCED) return;
      gsap.from('.fm-l', {
        yPercent: 55,
        opacity: 0,
        duration: 0.9,
        stagger: 0.035,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.ftr-word', start: 'top 95%' },
      });
      gsap.from('.ftr-top > *', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 85%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const go = (href) => (e) => {
    e.preventDefault();
    goToSection(href);
  };

  const word = 'PROEXPERTISE'.split('');

  return (
    <footer className="ftr" id="contact" ref={rootRef}>
      <div className="ftr-top">
        <div className="ftr-brand">
          <img src="/img/logo-white.png" alt="ProExpertise" className="ftr-logo" />
          <p>
            Independent digital marketing studio. Strategy, creative and media under one roof —
            working worldwide, shipping weekly.
          </p>
          {/* <div className="mono-label ftr-status">
            <i className="dot" />
            All systems creative — replies within 24h
          </div> */}
        </div>

        <nav className="ftr-col" aria-label="Sitemap">
          <span className="mono-label ftr-col-title">Sitemap</span>
          {SITEMAP.map((l) => (
            <a key={l.label} href={l.href} onClick={go(l.href)} className="ftr-link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ftr-col">
          <span className="mono-label ftr-col-title">Socials</span>
          {FOOTER.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="ftr-link">
              {s.label} ↗
            </a>
          ))}
        </div>

        <div className="ftr-col">
          <span className="mono-label ftr-col-title">Contact</span>
          <a href={`mailto:${FOOTER.email}`} className="ftr-link" data-cursor="link">
            {FOOTER.email}
          </a>
          <a href={`tel:${FOOTER.phone.replace(/[^+\d]/g, '')}`} className="ftr-link">
            {FOOTER.phone}
          </a>
          <span className="ftr-link ftr-static">Worldwide — remote first</span>
          <Magnetic strength={0.25}>
            <button
              type="button"
              className="circle-btn ftr-top-btn"
              aria-label="Back to top"
              onClick={() => window.__lenis?.scrollTo(0, { duration: 1.6 })}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 20V4m0 0l-6 6m6-6l6 6" />
              </svg>
            </button>
          </Magnetic>
        </div>
      </div>

      <h2 className="ftr-word" aria-label="ProExpertise trademark">
        {word.map((ch, i) => (
          <span className="fm-l" key={i} aria-hidden="true">
            {ch}
          </span>
        ))}
        {/* <span className="fm-l fm-tm" aria-hidden="true">
          ™
        </span> */}
      </h2>

      <div className="ftr-bot mono-label">
        <span>© 2026 — All rights reserved</span>
        <span className="ftr-clock">Your time — {time}</span>
        <a href="#contact" onClick={(e) => e.preventDefault()} className="ftr-bot-link">
          Privacy & Policy
        </a>
      </div>
    </footer>
  );
}
