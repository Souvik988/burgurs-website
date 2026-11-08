import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sticker } from './Sketch';

const scenes = [
  { src: '/assets/founder/andre-griddle-concept-v5.webp', caption: 'ON THE GRIDDLE.', alt: 'AI-imagined scene of Andre pressing a burger patty on a griddle, based on his public work photographs.' },
  { src: '/assets/founder/andre-finishing-concept-v5.webp', caption: 'AT THE PASS.', alt: 'AI-imagined scene of Andre placing the top bun on a burger at a kitchen counter, based on his public work photographs.' },
].map(scene => ({ ...scene, credit: 'AI-created work scene · likeness based on Dre’s public kitchen photographs. A creative reconstruction, not an original Instagram photograph.', source: 'https://www.instagram.com/p/DCjAOJ_vgBD/' }));

export default function FounderWorkScenes({ motion, onPhoto }) {
  const root = useRef(null);
  useEffect(() => {
    if (!motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('.founder-concept-card', { y: 45, rotation: i => i % 2 ? 7 : -7, opacity: 0, duration: .7, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 80%', once: true } });
    }, root);
    return () => context.revert();
  }, [motion]);
  return <section className="founder-work-scenes section-space" ref={root} aria-label="Creative work scenes inspired by Andre’s kitchen photographs">
    <div className="founder-scenes-copy"><Sticker>GOOD THINGS TAKE A LITTLE WORK.</Sticker><h2 className="scene-title">THE PRESS.<br />THE STACK.<br />THE FIRST BITE.</h2><p>From the hot griddle to the final bun. A little kitchen energy, inspired by the person behind Dre’s.</p><small>AI-created work scenes based on Andre’s public kitchen photographs. Creative reconstructions; see his original videos below.</small><a href="https://www.instagram.com/d.r.es/" target="_blank" rel="noopener noreferrer">WATCH THE REAL DRE’S ↗</a></div>
    <div className="founder-scenes-pictures">{scenes.map((scene, i) => <figure className="founder-concept-card" key={scene.src}><button onClick={() => onPhoto(scene)} aria-label={`Enlarge creative founder scene: ${scene.caption}`}><img src={scene.src} alt={scene.alt} width="1000" height="1333" loading="lazy" /><span><small>0{i + 1} / AI WORK SCENE</small><strong>{scene.caption} ↗</strong></span></button></figure>)}</div>
  </section>;
}
