import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionAllowed } from '../v6/Motion';
import { requestScrollRefresh } from '../motion/refresh';
import { useSite } from '../site';
import './kit.css';

gsap.registerPlugin(ScrollTrigger);
export const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* Run a GSAP setup scoped to a root, only when motion is allowed; reverted on unmount. */
export function useGsap(root, setup, deps = []) {
  const motion = useSite()?.motion;
  const fn = useRef(setup);
  fn.current = setup;
  useIsoLayout(() => {
    if (!root.current || !motionAllowed()) return;
    const ctx = gsap.context(self => fn.current(self, root.current), root);
    const imgs = [...root.current.querySelectorAll('img')];
    imgs.forEach(i => i.complete || i.addEventListener('load', () => requestScrollRefresh(), { once: true }));
    requestScrollRefresh();
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, motion]);
}

/* Section background made of the brand doodles; it drifts against the scroll for depth. */
export function DoodleBg({ tone = 'red', speed = 120, className = '' }) {
  const ref = useRef(null);
  useGsap(ref, () => {
    // Transform (GPU) instead of background-position (repaint) keeps scrolling smooth on phones.
    gsap.fromTo(ref.current, { y: speed }, { y: -speed, ease: 'none', scrollTrigger: { trigger: ref.current.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  return <div ref={ref} className={`v7-doodle-bg v7-doodle-${tone} ${className}`} style={{ top: -speed, bottom: -speed }} aria-hidden="true" />;
}

/* Heading whose words rise out of a mask as it enters (text stays readable to assistive tech). */
export function Words({ children, as: Tag = 'h2', className = '', delay = 0, scrub = false, ...props }) {
  const ref = useRef(null);
  useGsap(ref, () => {
    const words = ref.current.querySelectorAll('.v7-w > i');
    const vars = { yPercent: 0, rotate: 0, duration: .9, stagger: .06, ease: 'power4.out', delay };
    if (scrub) gsap.fromTo(words, { yPercent: 115, rotate: 6 }, { ...vars, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 90%', end: 'top 45%', scrub: .6 } });
    else gsap.fromTo(words, { yPercent: 115, rotate: 6 }, { ...vars, scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } });
  });
  const lines = String(children).split('\n');
  return <Tag ref={ref} className={`v7-words ${className}`} aria-label={lines.join(' ')} {...props}>
    {lines.map((line, li) => <span className="v7-line" key={li} aria-hidden="true">{line.split(' ').map((w, wi) => <span className="v7-w" key={wi}><i>{w}</i></span>)}</span>)}
  </Tag>;
}

/* Fade/rise any [data-rise] children in small batches as they arrive. */
export function useRise(root, deps = []) {
  useGsap(root, () => {
    const els = gsap.utils.toArray(root.current.querySelectorAll('[data-rise]'));
    gsap.set(els, { y: 50, opacity: 0 });
    ScrollTrigger.batch(els, { start: 'top 90%', once: true, onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: 'power3.out', overwrite: true }) });
  }, deps);
}

/* Pins a section and slides its track sideways on wide screens; native swipe on narrow ones. */
export function useHorizontal(root, { track = '.v7-track', onProgress, extra } = {}) {
  useGsap(root, () => {
    const mm = gsap.matchMedia();
    // Pinned on every screen size: on phones the same vertical swipe drives the sideways slide.
    mm.add('all', () => {
      const el = root.current.querySelector(track);
      const distance = () => Math.max(0, el.scrollWidth - innerWidth);
      const tween = gsap.to(el, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: .5, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: self => onProgress?.(self.progress) },
      });
      extra?.(tween);
    });
  });
}

/* Big end-of-page teaser that pulls visitors into the next chapter of the site. */
export function NextStop({ to, kicker, title, image, tone = 'red' }) {
  const ref = useRef(null);
  useGsap(ref, () => {
    gsap.fromTo(ref.current.querySelector('.v7-next-fill'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'bottom 85%', scrub: true } });
    gsap.fromTo(ref.current.querySelector('.v7-next-art'), { yPercent: 40, rotation: -12, scale: .7 }, { yPercent: 0, rotation: 4, scale: 1, ease: 'back.out(1.6)', duration: 1, scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true } });
  });
  const move = e => {
    if (!motionAllowed() || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    gsap.to(e.currentTarget.querySelector('.v7-next-art'), { x: (e.clientX - r.left - r.width / 2) * .08, y: (e.clientY - r.top - r.height / 2) * .12, rotation: (e.clientX - r.left - r.width / 2) * .01, duration: .6, ease: 'power3.out' });
  };
  return <section ref={ref} className={`v7-next v7-next-${tone}`}>
    <DoodleBg tone={tone === 'red' ? 'cream' : 'red'} speed={60} />
    <Link to={to} className="v7-next-link" onPointerMove={move}>
      <span className="v7-next-kicker">{kicker}</span>
      <span className="v7-next-title">{title}<span className="v7-next-arrow" aria-hidden="true">→</span></span>
      <span className="v7-next-bar" aria-hidden="true"><span className="v7-next-fill" /></span>
      {image && <img className="v7-next-art" src={image} alt="" loading="lazy" />}
    </Link>
  </section>;
}

/* Small marquee strip with doodles between phrases. */
export function Ticker({ items, tone = 'red', reverse = false }) {
  const list = [...items, ...items, ...items];
  return <div className={`v7-ticker v7-ticker-${tone} ${reverse ? 'is-reverse' : ''}`} aria-hidden="true"><div>{list.map((t, i) => <span key={i}>{t}<img src={`/assets/v7/icons/${['spark', 'heart', 'bolt', 'burger'][i % 4]}.webp`} alt="" /></span>)}</div></div>;
}
