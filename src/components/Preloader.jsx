import { useLayoutEffect, useRef } from 'react';
import { gsap, REDUCED } from '../lib/anim';

export default function Preloader({ onDone }) {
  const rootRef = useRef(null);
  const numRef = useRef(null);
  const barRef = useRef(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useLayoutEffect(() => {
    const finish = () => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current();
      }
    };

    if (REDUCED) {
      const tl = gsap.timeline({ onComplete: () => { finish(); gsap.set(rootRef.current, { display: 'none' }); } });
      tl.to(rootRef.current, { autoAlpha: 0, duration: 0.4, delay: 0.3 });
      return () => tl.kill();
    }

    const obj = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => { finish(); gsap.set(rootRef.current, { display: 'none' }); },
    });
    tl.to(obj, {
      v: 92,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = String(Math.round(obj.v)).padStart(3, '0');
        if (barRef.current) barRef.current.style.transform = `scaleX(${obj.v / 100})`;
      },
    })
      .to(obj, {
        v: 100,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = String(Math.round(obj.v)).padStart(3, '0');
          if (barRef.current) barRef.current.style.transform = `scaleX(${obj.v / 100})`;
        },
      })
      .addLabel('lift', '+=0.12')
      .call(finish, null, 'lift')
      .to('.pre-brand', { yPercent: -160, duration: 0.55, ease: 'power3.in' }, 'lift')
      .to('.pre-num', { yPercent: -160, duration: 0.55, ease: 'power3.in' }, 'lift')
      .to(rootRef.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 'lift+=0.22')
      .set(rootRef.current, { display: 'none' });

    return () => tl.kill();
  }, []);

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="pre-brand">
        <img src="/img/logo-white.png" alt="" className="pre-logo" />
        <span className="mono-label">Digital Marketing Studio</span>
      </div>
      <div className="pre-num">
        <span ref={numRef}>000</span>
      </div>
      <div className="pre-bar">
        <span ref={barRef} />
      </div>
    </div>
  );
}
