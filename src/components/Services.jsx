import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, REDUCED, splitWords, goToSection } from '../lib/anim';
import { SERVICES } from '../data/site';
import Magnetic from './Magnetic';

function ProjectCard({ project }) {
  const imgRef = useRef(null);

  /* Subtle 3D tilt toward the mouse */
  const onMove = (e) => {
    if (REDUCED) return;
    const el = imgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: px * 7, rotateX: py * -7, duration: 0.5, ease: 'power2.out' });
  };
  const onLeave = () => {
    if (imgRef.current) gsap.to(imgRef.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power3.out' });
  };

  return (
    <a
      href="#work"
      className="pcard"
      onClick={(e) => e.preventDefault()}
      data-cursor="View"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="pcard-img" ref={imgRef}>
        <img src={project.img} alt={`${project.name} case study`} loading="lazy" />
      </div>
      <div className="pcard-meta">
        <span className="pcard-name">{project.name}</span>
        <span className="pcard-tags mono-label">Case Study</span>
      </div>
      <p className="pcard-blurb">{project.blurb}</p>
    </a>
  );
}

export default function Services() {
  const rootRef = useRef(null);
  const panelRefs = useRef([]);
  const [open, setOpen] = useState(0);

  /* Expand / collapse with height tween */
  useLayoutEffect(() => {
    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const isOpen = i === open;
      gsap.to(panel, {
        height: isOpen ? 'auto' : 0,
        duration: 0.7,
        ease: 'power3.inOut',
        onComplete: () => ScrollTrigger.refresh(),
      });
      if (isOpen && !REDUCED) {
        gsap.fromTo(
          panel.querySelectorAll('.svc-info, .pcard'),
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.09, ease: 'power3.out', delay: 0.15 }
        );
      }
    });
  }, [open]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      if (REDUCED) return;
      const title = root.querySelector('.svc-title-big');
      const chars = splitWords(title);
      gsap.from(chars, {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.05,
        ease: 'power4.out',
        scrollTrigger: { trigger: title, start: 'top 85%' },
      });
      gsap.utils.toArray('.svc-row').forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 88%' },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const toggle = (i) => {
    setOpen((cur) => {
      const next = cur === i ? -1 : i;
      if (next !== -1 && next !== cur) {
        /* Bring the freshly opened panel into view if its head is low on screen */
        requestAnimationFrame(() => {
          const head = panelRefs.current[next]?.previousElementSibling || panelRefs.current[next];
          if (!head) return;
          const r = head.getBoundingClientRect();
          if (r.bottom > window.innerHeight - 40) goToSection('#work');
        });
      }
      return next;
    });
  };

  return (
    <section className="svc" id="work" ref={rootRef}>
      <div className="svc-head-center">
        {/* <span className="mono-label">(02) Services & Work</span> */}
        <h2 className="svc-title-big">WHAT WE DO BEST</h2>
        <p className="svc-sub">
          From the first frame to the final report - five disciplines, one roof, zero boring
          work.
        </p>
      </div>

      <div className="svc-list">
        {SERVICES.map((svc, i) => {
          const isOpen = open === i;
          return (
            <div className={`svc-row ${isOpen ? 'open' : ''}`} key={svc.num}>
              <button
                type="button"
                className="svc-row-head"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`svc-panel-${i}`}
              >
                <span className="svc-num mono-label">{svc.num}</span>
                <span className="svc-title">{svc.title}</span>
                <span className="svc-toggle" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M7 0v14M0 7h14" />
                  </svg>
                </span>
              </button>

              <div
                className="svc-panel"
                id={`svc-panel-${i}`}
                ref={(el) => { panelRefs.current[i] = el; }}
                style={{ height: i === 0 ? 'auto' : 0 }}
              >
                <div className="svc-body">
                  <div className="svc-info">
                    <p className="svc-desc">{svc.desc}</p>
                    <div className="svc-chips">
                      {svc.tags.map((tag) => (
                        <span className="chip mono-label" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Magnetic strength={0.25}>
                      <a
                        href="#contact"
                        className="svc-link mono-label"
                        onClick={(e) => { e.preventDefault(); goToSection('#contact'); }}
                        data-cursor="link"
                      >
                        Start a project like this ↗
                      </a>
                    </Magnetic>
                  </div>
                  <div className="svc-cards">
                    {svc.projects.map((p) => (
                      <ProjectCard project={p} key={p.name} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
