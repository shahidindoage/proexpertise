import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };

/**
 * Split an element's text into masked words:  <span class="w"><span class="wi">word</span></span>
 * The outer span clips (overflow hidden), the inner one is what we animate.
 */
export function splitWords(el) {
  if (!el) return [];
  if (el.dataset.splitDone) return el.querySelectorAll('.wi');
  const text = el.textContent.trim();
  if (!text) return [];
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const frag = document.createDocumentFragment();
  text.split(/\s+/).forEach((word, i, arr) => {
    const w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.className = 'wi';
    inner.textContent = word;
    w.appendChild(inner);
    frag.appendChild(w);
    if (i < arr.length - 1) frag.appendChild(document.createTextNode(' '));
  });
  el.appendChild(frag);
  el.dataset.splitDone = '1';
  return el.querySelectorAll('.wi');
}

/** Count an element's text up to its data-count value, honouring prefix/suffix. */
export function countUp(el, duration = 1.8) {
  const target = parseFloat(el.dataset.count || '0');
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const o = { v: 0 };
  return gsap.to(o, {
    v: target,
    duration,
    ease: 'power3.out',
    onUpdate: () => {
      el.textContent = prefix + Math.round(o.v).toLocaleString('en-US') + suffix;
    },
  });
}

/** Smooth-scroll to a section, respecting the fixed header height. */
export function goToSection(hash) {
  const el = document.querySelector(hash);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, {
      offset: -78,
      duration: 1.5,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
