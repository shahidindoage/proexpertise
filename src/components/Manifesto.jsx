import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, REDUCED, countUp } from '../lib/anim';
import { STATS } from '../data/site';
import Magnetic from './Magnetic';

/* Segments marked { em: true } render in the muted tone */
const SEGMENTS = [
  { t: 'Creativity that stops thumbs. ' },
  { t: 'Strategy that wins markets.', em: true },
];

const AVATARS = ['/img/avatar-1.jpg', '/img/avatar-2.jpg', '/img/avatar-3.jpg', '/img/avatar-4.jpg'];

export default function Manifesto() {
  const rootRef = useRef(null);
  const stateRef = useRef(null);
  const statsRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      const words = stateRef.current.querySelectorAll('.mw');
      const counters = statsRef.current.querySelectorAll('[data-count]');
      const bigCount = root.querySelector('.big-count');

      if (!REDUCED) {
        /* statement — word-by-word scrub reveal */
        gsap
          .timeline({
            scrollTrigger: {
              trigger: stateRef.current,
              start: 'top 78%',
              end: 'bottom 45%',
              scrub: 0.4,
            },
          })
          .to(words, { opacity: 1, ease: 'none', stagger: 0.06, duration: 0.4 });

        /* supporting paragraph */
        gsap.from('.mnf-para', {
          opacity: 0,
          y: 26,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.mnf-top', start: 'top 80%' },
        });

        /* the two cards rise */
        gsap.from('.mnf-card', {
          opacity: 0,
          y: 44,
          duration: 0.9,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.mnf-cards', start: 'top 85%' },
        });

        /* dark card: counter runs, then the accent + pops in */
        gsap.set('.stat-plus', { scale: 0, rotation: -90 });
        ScrollTrigger.create({
          trigger: '.stat-card',
          start: 'top 80%',
          once: true,
          onEnter: () => {
            countUp(bigCount, 1.6);
            gsap.to('.stat-plus', {
              scale: 1,
              rotation: 0,
              duration: 0.7,
              delay: 1.45,
              ease: 'back.out(2.4)',
            });
          },
        });

        /* avatar stack fans in */
        gsap.from('.ava', {
          y: 18,
          opacity: 0,
          duration: 0.6,
          stagger: 0.07,
          ease: 'back.out(1.8)',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '.ava-row', start: 'top 92%' },
        });

        /* media card: photo settles from a push-in, letters rise, play pops */
        gsap.fromTo(
          '.media-img img',
          { scale: 1.25 },
          {
            scale: 1,
            duration: 1.6,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.media-card', start: 'top 85%' },
          }
        );
        gsap.from('.hww-ch', {
          yPercent: 130,
          opacity: 0,
          duration: 0.7,
          stagger: 0.035,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.media-card', start: 'top 80%' },
        });
        gsap.set('.play-btn', { scale: 0 });
        gsap.to('.play-btn', {
          scale: 1,
          duration: 0.7,
          delay: 0.55,
          ease: 'back.out(2.2)',
          clearProps: 'transform',
          scrollTrigger: { trigger: '.media-card', start: 'top 80%' },
        });

        /* stats strip counters */
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 82%',
          once: true,
          onEnter: () => counters.forEach((el) => countUp(el)),
        });
      } else {
        gsap.set(words, { opacity: 1 });
        counters.forEach((el) => {
          el.textContent =
            (el.dataset.prefix || '') +
            parseFloat(el.dataset.count).toLocaleString('en-US') +
            (el.dataset.suffix || '');
        });
        bigCount.textContent = bigCount.dataset.count;
      }
    }, root);

    return () => ctx.revert();
  }, []);

  let key = 0;
  const words = SEGMENTS.flatMap((seg) =>
    seg.t
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (
        <span key={`w-${key++}`} className="mw-wrap">
          <span className={seg.em ? 'mw em' : 'mw'}>{w}</span>{' '}
        </span>
      ))
  );

  return (
    <section className="mnf" id="about" ref={rootRef}>
      {/* <div className="sec-head mono-label">
        <span>(01) Manifesto</span>
        <span>Why we exist</span>
      </div> */}

      <div className="mnf-top">
        <h2 className="mnf-state" ref={stateRef}>
          {words}
        </h2>
        <p className="mnf-para">
          We&apos;re a creative crew from the hills of Kangra, HP — films, design, reels and
          campaigns built under one roof. Small town. Big-stage ideas. Not a boring pixel in
          sight.
        </p>
      </div>

      <div className="mnf-cards">
        <div className="stat-card mnf-card">
          <div className="stat-big">
            <span className="big-count" data-count="120">
              0
            </span>
            <span className="stat-plus">+</span>
          </div>
          <p className="stat-label mono-label">Brands scaled — superbly reviewed</p>
          <div className="ava-row">
            {AVATARS.map((src) => (
              <img key={src} src={src} alt="" className="ava" loading="lazy" />
            ))}
            <span className="ava ava-more">+</span>
          </div>
        </div>

        <div className="media-card mnf-card">
          <div className="media-img">
            <img src="/img/how-we-work.jpg" alt="The team collaborating in the studio" loading="lazy" />
          </div>
          <div className="hww" aria-hidden="true">
            {'HOW WE WORK'.split('').map((ch, i) =>
              ch === ' ' ? (
                <span key={i} className="hww-sp">
                  &nbsp;
                </span>
              ) : (
                <span key={i} className="hww-ch">
                  {ch}
                </span>
              )
            )}
          </div>
          <Magnetic strength={0.3} className="play-wrap">
            <button type="button" className="play-btn" aria-label="Play showreel" data-cursor="link">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
            </button>
          </Magnetic>
        </div>
      </div>

      <div className="mnf-stats" ref={statsRef}>
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <div className="stat-num">
              <span data-count={s.value} data-prefix={s.prefix || ''} data-suffix={s.suffix || ''}>
                {`${s.prefix || ''}0${s.suffix || ''}`}
              </span>
            </div>
            <p className="mono-label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
