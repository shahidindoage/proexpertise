import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/anim';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    document.documentElement.classList.add('has-cursor');

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

    const move = (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const over = (e) => {
      const t = e.target.closest('[data-cursor], a, button');
      if (!t) return;
      const kind = t.dataset.cursor;
      if (kind) {
        ring.classList.add('is-label');
        label.textContent = kind.toUpperCase();
      } else {
        ring.classList.add('is-link');
      }
      dot.classList.add('is-hidden');
    };

    const out = (e) => {
      const t = e.target.closest('[data-cursor], a, button');
      if (!t) return;
      ring.classList.remove('is-label', 'is-link');
      dot.classList.remove('is-hidden');
    };

    const down = () => ring.classList.add('is-down');
    const up = () => ring.classList.remove('is-down');

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef}>
        <span className="cursor-label" ref={labelRef} />
      </div>
    </div>
  );
}
