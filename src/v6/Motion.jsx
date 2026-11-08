import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './motion.css';

gsap.registerPlugin(ScrollTrigger);

export const motionAllowed = () => document.documentElement.dataset.motion !== 'off' && !matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Doodle({ name, className = '', style, ...props }) {
  return <img src={`/assets/v6/doodles/${name}.webp`} alt="" aria-hidden="true" draggable="false" className={`v6-doodle-img ${className}`} style={style} loading="lazy" decoding="async" {...props} />;
}

/* Doodles that drop into a section from above and bounce to rest when it scrolls into view.
   Hover / tap makes one jump. Each item: { name, x: '% from left', y: '% from top' (rest), size, r (rest rotation) } */
export function FallingDoodles({ items, className = '', start = 'top 72%', motion = true }) {
  const root = useRef(null);
  useEffect(() => {
    if (!motion || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray('.v6-fall');
      gsap.set(els, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: root.current.parentElement, start, once: true,
        onEnter: () => {
          els.forEach((el, i) => {
            const drop = el.offsetTop + el.offsetHeight + 120;
            gsap.fromTo(el, { autoAlpha: 1, y: -drop, rotation: gsap.utils.random(-160, 160) },
              { y: 0, rotation: +el.dataset.r || 0, duration: gsap.utils.random(1.1, 1.5), delay: i * .09, ease: 'bounce.out' });
          });
        },
      });
    }, root);
    return () => ctx.revert();
  }, [motion, start]);
  const jump = e => {
    if (!motionAllowed()) return;
    const el = e.currentTarget;
    if (gsap.isTweening(el)) return;
    gsap.timeline()
      .to(el, { y: -70, rotation: `+=${gsap.utils.random([-1, 1]) * 25}`, duration: .28, ease: 'power2.out' })
      .to(el, { y: 0, rotation: +el.dataset.r || 0, duration: .7, ease: 'bounce.out' });
  };
  return <div ref={root} className={`v6-fall-layer ${className}`} aria-hidden="true">
    {items.map((d, i) => <span key={i} className="v6-fall" data-r={d.r || 0} style={{ left: d.x, top: d.y, width: d.size, '--r': `${d.r || 0}deg` }} onPointerEnter={jump} onClick={jump}>
      <span className="v6-fall-inner" style={{ animationDelay: `${-i * .7}s` }}><Doodle name={d.name} /></span>
    </span>)}
  </div>;
}

/* A mascot that pops up from a section's bottom edge while the section is on screen. */
export function PeekMascot({ name, side = 'right', className = '', motion = true, label }) {
  const root = useRef(null);
  useEffect(() => {
    if (!motion || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      const body = root.current.querySelector('.v6-peek-body');
      gsap.set(body, { yPercent: 105 });
      const wave = gsap.to(body, { rotation: side === 'right' ? -6 : 6, duration: .5, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true });
      ScrollTrigger.create({
        trigger: root.current.parentElement, start: 'top 45%', end: 'bottom 70%',
        onToggle: self => {
          gsap.to(body, { yPercent: self.isActive ? 8 : 105, duration: self.isActive ? .7 : .4, ease: self.isActive ? 'back.out(2.2)' : 'power2.in', overwrite: 'auto' });
          self.isActive ? wave.play() : wave.pause();
        },
      });
    }, root);
    return () => ctx.revert();
  }, [motion, side]);
  return <div ref={root} className={`v6-peek v6-peek-${side} ${className}`} aria-hidden={!label}>
    <img className="v6-peek-body" src={`/assets/v6/mascots/${name}.webp`} alt={label || ''} loading="lazy" />
  </div>;
}

/* Big sticker eyes whose pupils follow the pointer (or scroll direction on touch) and blink. */
export function GooglyEyes({ className = '' }) {
  const root = useRef(null);
  useEffect(() => {
    if (!motionAllowed()) return;
    const el = root.current;
    const pupils = [...el.querySelectorAll('.v6-pupil')];
    const movers = pupils.map(p => ({ x: gsap.quickTo(p, 'x', { duration: .35, ease: 'power3.out' }), y: gsap.quickTo(p, 'y', { duration: .35, ease: 'power3.out' }) }));
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' });
    io.observe(el);
    const look = (cx, cy) => {
      if (!visible) return;
      pupils.forEach((p, i) => {
        const eye = p.parentElement.getBoundingClientRect();
        const ex = eye.left + eye.width / 2, ey = eye.top + eye.height / 2;
        const a = Math.atan2(cy - ey, cx - ex);
        const d = Math.min(Math.hypot(cx - ex, cy - ey) / 6, eye.width * .24);
        movers[i].x(Math.cos(a) * d); movers[i].y(Math.sin(a) * d);
      });
    };
    const onMove = e => look(e.clientX, e.clientY);
    let lastY = scrollY;
    const onScroll = () => { const dy = scrollY - lastY; lastY = scrollY; if (matchMedia('(hover: none)').matches) movers.forEach(m => { m.x(0); m.y(gsap.utils.clamp(-22, 22, dy * 1.5)); }); };
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    const lids = el.querySelectorAll('.v6-lid');
    let blink;
    const doBlink = () => { gsap.fromTo(lids, { scaleY: 0 }, { scaleY: 1, duration: .07, yoyo: true, repeat: 1, ease: 'power1.in' }); blink = gsap.delayedCall(gsap.utils.random(2.2, 4.5), doBlink); };
    blink = gsap.delayedCall(1.5, doBlink);
    const brows = el.querySelectorAll('.v6-brow');
    const surprise = () => gsap.fromTo(brows, { y: 0 }, { y: -18, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out' });
    el.addEventListener('pointerenter', surprise);
    return () => { io.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('scroll', onScroll); blink?.kill(); el.removeEventListener('pointerenter', surprise); };
  }, []);
  return <div ref={root} className={`v6-eyes ${className}`} aria-hidden="true">
    {[0, 1].map(i => <div className={`v6-eye v6-eye-${i}`} key={i}><span className="v6-brow" /><span className="v6-eyeball"><span className="v6-pupil"><i /></span><span className="v6-lid" /></span></div>)}
  </div>;
}

/* A hand-drawn squiggle that draws itself when scrolled into view. */
export function Squiggle({ className = '', color = 'var(--red)' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionAllowed()) return;
    const path = ref.current.querySelector('path');
    const len = path.getTotalLength();
    const t = gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, []);
  return <svg ref={ref} className={`v6-squiggle ${className}`} viewBox="0 0 300 30" fill="none" aria-hidden="true" preserveAspectRatio="none"><path d="M4 18c22-14 38 10 60-2s34-14 52 0 36 12 58-2 34-12 56 0 30 10 66-4" stroke={color} strokeWidth="6" strokeLinecap="round" /></svg>;
}

/* Headline whose letters hop into place one after another. Accessible text stays intact. */
export function JumpText({ children, as: Tag = 'h2', className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionAllowed()) return;
    const letters = ref.current.querySelectorAll('.v6-jl');
    const t = gsap.fromTo(letters, { yPercent: 0, y: -90, opacity: 0, rotation: () => gsap.utils.random(-25, 25) },
      { y: 0, opacity: 1, rotation: 0, duration: .8, ease: 'bounce.out', stagger: { each: .035, from: 'random' }, scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true } });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, []);
  const lines = String(children).split('\n');
  return <Tag ref={ref} className={`v6-jump ${className}`} aria-label={lines.join(' ')}>
    {lines.map((line, li) => <span className="v6-jline" key={li} aria-hidden="true">{[...line].map((ch, i) => <span className="v6-jl" key={i}>{ch === ' ' ? ' ' : ch}</span>)}</span>)}
  </Tag>;
}

/* Site-wide: scroll-velocity tilt for doodles, magnetic buttons, burger progress bar. */
export function useGlobalMotion(motion) {
  useEffect(() => {
    if (!motion || !motionAllowed()) return;
    // Performance: write the scroll tilt straight onto the few doodles that are on screen,
    // instead of a root CSS variable (which would restyle the whole page every frame).
    const visibleTilt = new Set();
    const io = new IntersectionObserver(entries => entries.forEach(e => (e.isIntersecting ? visibleTilt.add(e.target) : (visibleTilt.delete(e.target), e.target.style.rotate = ''))));
    const collect = () => { io.disconnect(); visibleTilt.clear(); document.querySelectorAll('.v6-fall-inner').forEach(el => io.observe(el)); };
    ScrollTrigger.addEventListener('refresh', collect);
    collect();
    const fill = document.querySelector('.v6-meter-fill'), rider = document.querySelector('.v6-meter-rider');
    let progress = 0;
    const tilt = { v: 0 };
    let painted = NaN, width = innerWidth;
    addEventListener('resize', () => { width = innerWidth; }, { passive: true });
    const paint = () => {
      const v = Math.round(tilt.v * 4) / 4; // quarter-degree steps: skip invisible changes
      if (rider) rider.style.transform = `translateX(${(progress * (width - 30)).toFixed(1)}px) rotate(${v * 2}deg)`;
      if (v === painted) return;
      painted = v;
      visibleTilt.forEach(el => { el.style.rotate = `${v}deg`; });
    };
    const setTilt = gsap.quickTo(tilt, 'v', { duration: .6, ease: 'power3.out', onUpdate: paint });
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => { progress = self.progress; if (fill) fill.style.transform = `scaleX(${progress.toFixed(4)})`; setTilt(gsap.utils.clamp(-14, 14, self.getVelocity() / 140)); } });
    const settle = setInterval(() => { if (Math.abs(tilt.v) > .05) setTilt(0); }, 180);

    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onMove = e => {
      const btn = e.target.closest?.('.button, .pl-skip, .v6-magnet');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3.out', overwrite: 'auto' });
    };
    const onOut = e => {
      const btn = e.target.closest?.('.button, .pl-skip, .v6-magnet');
      if (btn && !btn.contains(e.relatedTarget)) gsap.to(btn, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1, .35)', overwrite: 'auto' });
    };
    if (fine) { document.addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('pointerout', onOut, { passive: true }); }
    return () => { st.kill(); clearInterval(settle); io.disconnect(); ScrollTrigger.removeEventListener('refresh', collect); visibleTilt.forEach(el => { el.style.rotate = ''; }); if (fine) { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerout', onOut); } };
  }, [motion]);
}

export function ScrollMeter() {
  return <div className="v6-meter" aria-hidden="true"><span className="v6-meter-fill" /><Doodle name="burger" className="v6-meter-rider" loading="eager" /></div>;
}

/* Counts a number up once it is visible. */
export function CountUp({ to, decimals = 0, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const fmt = v => v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (!motionAllowed()) { el.textContent = fmt(to); return; }
    const o = { v: 0 };
    el.textContent = fmt(0);
    const t = gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, [to, decimals, suffix]);
  return <span ref={ref}>{to.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix}</span>;
}
