import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, goToSection } from '../lib/anim';
import { NAV, MENU_LINKS, FOOTER } from '../data/site';

export default function Header() {
  const [light, setLight] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const menuRef = useRef(null);
  const firstMenuRun = useRef(true);

  /* Live clock + date */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now
    .toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });

  /* Theme swap once the hero (dark) has scrolled past + docked state */
  useEffect(() => {
    const st1 = ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom top+=76',
      onEnter: () => setLight(true),
      onLeaveBack: () => setLight(false),
    });
    const st2 = ScrollTrigger.create({
      start: 30,
      end: 'max',
      onToggle: (self) => setScrolled(self.isActive),
    });
    return () => {
      st1.kill();
      st2.kill();
    };
  }, []);

  /* Fullscreen menu animation */
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return undefined;

    if (menuOpen) {
      window.__lenis?.stop();
      gsap.set(menu, { display: 'flex' });
      const tl = gsap.timeline();
      tl.fromTo(
        menu,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'power4.inOut' }
      )
        .fromTo(
          '.menu-inner',
          { yPercent: 110 },
          { yPercent: 0, duration: 0.8, stagger: 0.06, ease: 'power4.out' },
          '-=0.25'
        )
        .fromTo(
          '.menu-foot',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
          '-=0.5'
        );
      return () => tl.kill();
    }

    if (firstMenuRun.current) {
      firstMenuRun.current = false;
      return undefined;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(menu, { display: 'none' });
        window.__lenis?.start();
      },
    });
    tl.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.55, ease: 'power4.inOut' });
    return () => tl.kill();
  }, [menuOpen]);

  const go = (href) => (e) => {
    e.preventDefault();
    if (menuOpen) {
      setMenuOpen(false);
      setTimeout(() => goToSection(href), 420);
    } else {
      goToSection(href);
    }
  };

  return (
    <>
      <header className={`hd ${light ? 'light' : ''} ${scrolled ? 'scrolled' : ''}`}>
        {/* <div className="hd-top mono-label">
          <span>{dateStr}</span>
          <span className="hd-clock">{timeStr} - Local time</span>
          <span className="hd-status">
            <i className="dot" />
            Available worldwide
          </span>
        </div> */}
        <div className="hd-bar">
          <nav className="hd-nav" aria-label="Primary">
            {NAV.map((item) => (
              <a key={item.label} href={item.href} onClick={go(item.href)} className="hd-link mono-label">
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#hero" onClick={go('#hero')} className="hd-logo" aria-label="ProExpertise home">
            <img src="/img/logo-white.png" alt="ProExpertise" className="lg-w" />
            <img src="/img/logo-black.png" alt="" className="lg-b" />
          </a>
          <div className="hd-right">
            {/* <span className="hd-lang mono-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20" />
              </svg>
              EN
            </span> */}
            <nav className="hd-xlinks" aria-label="Quick links">
              <a href="#work" onClick={go('#work')} className="hd-link mono-label">
                Our Work
              </a>
              <a href="#work" onClick={go('#work')} className="hd-link mono-label">
                Services
              </a>
            </nav>
            <a href="#contact" onClick={go('#contact')} className="pill-btn hd-cta" data-cursor="link">
              + Start Project
            </a>
            <button
              type="button"
              className={`burger ${menuOpen ? 'open' : ''}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className="menu" ref={menuRef} aria-hidden={!menuOpen}>
        <nav className="menu-links" aria-label="Menu">
          {MENU_LINKS.map((item) => (
            <a key={item.label} href={item.href} onClick={go(item.href)} className="menu-link">
              <span className="mono-label menu-n">{item.n}</span>
              <span className="menu-mask">
                <span className="menu-inner">{item.label}</span>
              </span>
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <a href={`mailto:hello@proexpertise.in`} className="mono-label menu-mail">
            hello@proexpertise.in
          </a>
          <div className="menu-socials mono-label">
            {FOOTER.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
