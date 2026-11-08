import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { motionAllowed } from '../v6/Motion';
import './transition.css';

// Destination names and the doodle that hops while the curtain is closed.
const pages = {
  '/': ['HOME', 'BIG BURGER ENERGY', 'burger'],
  '/menu': ['THE MENU', 'DECISIONS, DECISIONS', 'fries'],
  '/story': ['OUR STORY', 'FROM A HOME KITCHEN', 'heart'],
  '/kolkata': ['KOLKATA', 'IN EVERY BITE', 'tram'],
  '/stories': ['FOOD STORIES', 'NOW SHOWING', 'spark'],
  '/visit': ['FIND DRE’S', 'YOUR NEXT BURGER STOP', 'taxi'],
  '/cart': ['YOUR BAG', 'ALMOST THERE', 'burger'],
  '/checkout': ['CHECKOUT', 'NEARLY BURGER TIME', 'bolt'],
};
// Warm the lazy page chunks before the click lands, so the curtain never waits long.
const chunks = {
  '/menu': () => import('../v7/pages/MenuV7'),
  '/story': () => import('../v7/pages/StoryV7'),
  '/kolkata': () => import('../v7/pages/KolkataV7'),
  '/stories': () => import('../v7/pages/StoriesV7'),
  '/visit': () => import('../v7/pages/VisitV7'),
};
const prefetched = new Set();
const prefetch = path => { if (chunks[path] && !prefetched.has(path)) { prefetched.add(path); chunks[path]().catch(() => prefetched.delete(path)); } };

function internalTarget(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const a = e.target.closest?.('a[href]');
  if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noTransition !== undefined) return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname.startsWith('/assets')) return null;
  if (url.pathname === location.pathname) return null; // same page (incl. #hash jumps)
  return url;
}

const waitForPage = () => new Promise(resolve => {
  const start = performance.now();
  const check = () => {
    const loading = document.querySelector('.v7-page-loading');
    if ((!loading && document.querySelector('#main-content > *')) || performance.now() - start > 2500) requestAnimationFrame(() => requestAnimationFrame(resolve));
    else requestAnimationFrame(check);
  };
  check();
});

export default function PageTransition() {
  const root = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const busy = useRef(false);
  const ours = useRef(false);
  const first = useRef(true);

  const setLabel = path => {
    const [name, sub, doodle] = pages[path] || ['DRE’S', 'ONE MORE BITE', 'burger'];
    const el = root.current;
    el.querySelector('.pt-name').textContent = name;
    el.querySelector('.pt-sub').textContent = sub;
    el.querySelector('.pt-doodle').src = `/assets/v7/icons/${doodle}.webp`;
  };

  const cover = () => new Promise(resolve => {
    const q = gsap.utils.selector(root);
    gsap.set(root.current, { visibility: 'visible' });
    gsap.timeline({ onComplete: resolve })
      .fromTo(q('.pt-band'), { yPercent: 100, y: 0 }, { yPercent: 0, duration: .5, stagger: .06, ease: 'power3.inOut' })
      .fromTo(q('.pt-label > *'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .35, stagger: .05, ease: 'back.out(2)' }, '-=.2')
      .fromTo(q('.pt-doodle'), { y: 0 }, { y: -26, duration: .22, yoyo: true, repeat: 1, ease: 'power2.out' }, '<');
  });
  const reveal = () => new Promise(resolve => {
    const q = gsap.utils.selector(root);
    gsap.timeline({ onComplete: () => { gsap.set(root.current, { visibility: 'hidden' }); busy.current = false; resolve(); } })
      .to(q('.pt-label > *'), { y: -30, opacity: 0, duration: .2, stagger: .03, ease: 'power2.in' })
      .to(q('.pt-band'), { yPercent: -100, duration: .55, stagger: { each: .06, from: 'end' }, ease: 'power3.inOut' }, '-=.08');
  });

  // Park the bands below the screen (set by GSAP, so no CSS transform fights the tweens).
  useEffect(() => { gsap.set(root.current.querySelectorAll('.pt-band'), { yPercent: 100, y: 0 }); }, []);

  // Intercept internal link clicks: close the curtain, then navigate.
  useEffect(() => {
    const onClick = e => {
      if (!motionAllowed()) return;
      const url = internalTarget(e);
      if (!url) return;
      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;
      ours.current = true;
      prefetch(url.pathname);
      setLabel(url.pathname);
      cover().then(() => navigate(url.pathname + url.search + url.hash));
    };
    const onHover = e => { const a = e.target.closest?.('a[href^="/"]'); if (a) prefetch(new URL(a.href).pathname); };
    document.addEventListener('click', onClick, true);
    document.addEventListener('pointerover', onHover, { passive: true });
    document.addEventListener('touchstart', onHover, { passive: true });
    return () => { document.removeEventListener('click', onClick, true); document.removeEventListener('pointerover', onHover); document.removeEventListener('touchstart', onHover); };
  }, [navigate]);

  // After any route change: open the curtain once the new page has painted.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!motionAllowed()) return;
    if (!ours.current) {
      // Back/forward navigation: snap closed, then open on the new page.
      busy.current = true;
      setLabel(pathname);
      gsap.set(root.current, { visibility: 'visible' });
      gsap.set(root.current.querySelectorAll('.pt-band'), { yPercent: 0 });
      gsap.set(root.current.querySelectorAll('.pt-label > *'), { y: 0, opacity: 1 });
    }
    ours.current = false;
    // Safety net: never leave the curtain closed, even if something on the new page throws.
    const safety = setTimeout(() => { gsap.set(root.current, { visibility: 'hidden' }); gsap.set(root.current.querySelectorAll('.pt-band'), { yPercent: 100 }); busy.current = false; }, 4500);
    waitForPage().then(reveal).then(() => clearTimeout(safety));
    return () => clearTimeout(safety);
  }, [pathname]);

  return <div className="page-transition" ref={root} aria-hidden="true">
    <div className="pt-band pt-band-3" /><div className="pt-band pt-band-2" /><div className="pt-band pt-band-1" />
    <div className="pt-label"><img className="pt-doodle" src="/assets/v7/icons/burger.webp" alt="" /><span className="pt-kicker">NEXT STOP</span><strong className="pt-name">DRE’S</strong><span className="pt-sub" /></div>
  </div>;
}
