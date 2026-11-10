import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, REDUCED } from './lib/anim';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Header from './components/Header';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import Manifesto from './components/Manifesto';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import BigCTA from './components/BigCTA';
import Footer from './components/Footer';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('is-loading');
    const lenis = new Lenis({
      duration: REDUCED ? 0.4 : 1.15,
      smoothWheel: !REDUCED,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    window.__lenis = lenis;
    lenis.stop();
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const progress = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${self.progress})`;
        }
      },
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      gsap.ticker.remove(raf);
      progress.kill();
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.remove('is-loading');
    window.__lenis?.start();
  }, [loaded]);

  return (
    <>
      <Preloader onDone={() => setLoaded(true)} />
      <Cursor />
      <div className="progress" ref={progressRef} aria-hidden="true" />
      <Header />
      <div className="frame">
        <main>
          <Hero started={loaded} />
          <Ticker />
          <Manifesto />
          <Services />
          <Testimonials />
          <BigCTA />
        </main>
        <Footer />
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
