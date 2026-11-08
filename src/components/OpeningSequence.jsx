import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Sketch } from './Sketch';
import './opening-sequence.css';

export default function OpeningSequence({ motion }) {
  const [visible, setVisible] = useState(() => {
    try { return motion && !sessionStorage.getItem('dres-opening-seen'); } catch { return motion; }
  });
  const root = useRef(null);
  useEffect(() => {
    if (!visible || !motion) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      gsap.timeline({ onComplete: () => setVisible(false) })
        .fromTo('.opening-word', { yPercent: 120, rotate: -7 }, { yPercent: 0, rotate: -3, duration: .55, ease: 'back.out(1.5)' })
        .fromTo('.opening-food', { y: -180, rotation: -20, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: .55, ease: 'back.out(1.8)' }, .15)
        .fromTo('.opening-spark', { scale: 0, rotation: -90 }, { scale: 1, rotation: 10, duration: .45, ease: 'back.out(2)' }, .4)
        .to('.opening-center', { scale: 1.08, opacity: 0, duration: .3 }, 1.1)
        .to('.opening-panel', { yPercent: (i) => i % 2 ? 105 : -105, stagger: .055, duration: .6, ease: 'power3.inOut' }, 1.15);
    }, root);
    return () => { ctx.revert();document.body.style.overflow = previousOverflow;try { sessionStorage.setItem('dres-opening-seen', '1'); } catch { /* session storage is optional */ } };
  }, [visible, motion]);
  if (!visible || !motion) return null;
  return <div className="opening-sequence" ref={root} aria-label="Welcome to Dre’s Burgers"><div className="opening-panels" aria-hidden="true">{[0, 1, 2, 3].map(i => <div className="opening-panel" key={i} />)}</div><div className="opening-center" aria-hidden="true"><span className="opening-word">dre’s</span><img src="/assets/menu/edited/mini-smash.webp" className="opening-food" alt="" /><Sketch type="spark" className="opening-spark" /><p>SMALL KITCHEN. BIG BURGER ENERGY.</p></div><button className="opening-skip" onClick={() => setVisible(false)}>LET ME IN ↗</button></div>;
}
