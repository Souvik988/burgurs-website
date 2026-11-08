import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { menu } from '../data/menu';
import { Sketch, Sticker, Wave } from './Sketch';
import './burger-motion.css';

gsap.registerPlugin(ScrollTrigger);
const layers = ['THE GOLDEN TOP.', 'TOMATO & SWEET ONION.', 'SMASHED. CHEESY.', 'MAKE THAT A DOUBLE.', 'GREENS & GARLIC AIOLI.', 'THE TOASTY FINISH.'];
const closed = [-105, -58, -18, 24, 65, 98];
const opened = [-240, -145, -50, 50, 145, 240];

export function BurgerAssembly({ motion }) {
  const root = useRef(null);
  const scroll = useRef(null);
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);
  const stepRef = useRef(0);
  const animated = motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (!animated) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ phone: '(max-width: 600px), (max-width: 1000px) and (orientation: portrait)', desktop: '(min-width: 1001px), (min-width: 601px) and (orientation: landscape)' }, context => {
        const phone = context.conditions.phone;
        // Phones: size the burger to the space the text leaves, so it is never pushed off-screen.
        const food = root.current.querySelector('.assembly-food');
        let multiplier = .9;
        if (!phone) {
          // Desktop/tablet: the opened stack spans ~720 units; keep it inside the stage height.
          const stageH = root.current.querySelector('.assembly-stage').clientHeight || innerHeight;
          const pieceH = root.current.querySelector('.assembly-piece')?.offsetHeight || 150;
          multiplier = Math.max(.5, Math.min(.9, (stageH * .88 - pieceH * .8) / 720));
        }
        if (phone) {
          // Layer offsets were designed for a ~97px layer; scale them with the real layer size, and keep
          // the fully opened stack (~480 units + one layer) inside the space under the text.
          const fw = food.clientWidth || innerWidth, h = food.clientHeight || innerHeight * .45;
          const pieceH = Math.round(Math.min(fw * .25, h * .34));
          food.style.setProperty('--piece-h', `${pieceH}px`);
          multiplier = Math.max(.25, Math.min(.55 * pieceH / 97, (h * .95 - pieceH * .75) / 480));
        }
        const spread = phone ? opened : [-365, -210, -70, 70, 210, 355];
        const pieces = gsap.utils.toArray('.assembly-piece');
        gsap.set(pieces, { y: i => closed[i] * multiplier, rotation: 0 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: .22, onUpdate: self => {
          const next = self.progress < .2 ? 0 : self.progress > .8 ? 2 : 1;
          if (stepRef.current !== next) { stepRef.current = next;setStep(next); }
        } } });
        scroll.current = tl.scrollTrigger;
        tl.to(pieces, { y: i => spread[i] * multiplier, scale: phone ? .75 : .8, x: i => (i % 2 ? 14 : -14), rotation: i => (i % 2 ? 4 : -4), duration: .36, ease: 'none', force3D: true, stagger: .008 }, .1)
          .to('.assembly-label', { opacity: 1, x: 0, duration: .15, stagger: .015 }, .3)
          .to('.assembly-label', { opacity: 0, duration: .12 }, .64)
          .to(pieces, { y: i => closed[i] * multiplier, scale: 1, x: 0, rotation: 0, duration: .28, ease: 'none', force3D: true, stagger: .008 }, .72)
          .fromTo('.assembly-doodle', { rotation: -15, scale: .8 }, { rotation: 20, scale: 1.1, ease: 'none', duration: 1 }, 0);
      });
      return () => mm.revert();
    }, root);
    return () => { ctx.revert();scroll.current = null; };
  }, [animated]);
  const toggle = () => {
    if (animated && scroll.current) {
      const t = scroll.current;
      window.scrollTo({ top: t.start + (t.end - t.start) * (step === 1 ? 1 : .5), behavior: 'smooth' });
    } else { setManual(v => !v);setStep(manual ? 0 : 1); }
  };
  return <section className={`burger-assembly ${animated ? '' : 'assembly-static'} ${manual ? 'manual-open' : ''}`} ref={root} aria-label="Open and close the layers of a Smashburg">
    <div className="assembly-stage"><div className="assembly-copy"><Sticker>THERE’S A LOT GOING ON IN HERE.</Sticker><h2>LET’S OPEN<br />THIS THING UP.</h2><p>Two smashed beef patties. American cheese.<br />Caramelised onion. Garlic aioli.<br />Every layer has a reason to be here.</p><div className="assembly-readout" aria-live="polite"><span>0{step + 1}</span>{['MEET THE SMASHBURG.', 'GOOD STUFF. ALL THE WAY DOWN.', 'BACK TOGETHER. BETTER THAN EVER.'][step]}</div><div className="assembly-actions"><button className="button button-primary" onClick={toggle}>{animated ? (step === 1 ? 'STACK IT BACK' : 'OPEN IT UP') : manual ? 'CLOSE THE LAYERS' : 'EXPLORE THE LAYERS'} <span aria-hidden="true">↕</span></button><Link to="/menu" className="assembly-menu-link">MEET THE REAL THING ↗</Link></div></div>
      <div className="assembly-food" role="img" aria-label="Photographic ingredient illustration based on Dre’s Smashburg: bun, tomato and onions, two cheesy beef patties, lettuce with aioli, bottom bun">{layers.map((label,i) => <div key={label} className={`assembly-piece piece-${i}`} style={{ '--layer-index': i, '--closed-y': `${closed[i] * .55}px`, '--open-y': `${opened[i] * .55}px`, '--open-desktop-y': `${[-365, -210, -70, 70, 210, 355][i] * .9}px`, zIndex: 6 - i }}><div className="assembly-sprite"><img src="/assets/menu/motion/smashburg-layers.webp" alt="" width="1024" height="1536" loading="lazy" decoding="async" style={{ top: `${-i * 100}%` }} /></div>{i === 0 && <img className="assembly-eyes" src="/assets/kolkata/burger-eyes-v4.webp" alt="" width="400" height="205" loading="lazy" />}<span className="assembly-label">{label}</span></div>)}<Sketch type="spark" className="assembly-doodle" /></div>
      <p className="assembly-disclosure">AI ingredient illustration · based on Dre’s menu photo.</p><span className="assembly-scroll-hint" aria-hidden="true">SCROLL TO UNSTACK ↕</span><Wave color="var(--beige)" /></div>
  </section>;
}

export function BurgerEncore({ motion, onSelect }) {
  const root = useRef(null);
  const selection = ['smashburg', 'hot-chick', 'herbed-potato', 'stacked-chicken', 'black-bear'].map(id => menu.find(item => item.id === id));
  useEffect(() => {
    if (!motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let observer;
    const ctx = gsap.context(() => {
      gsap.fromTo('.encore-item', { y: 80, scale: .7, rotation: -10, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: .85, stagger: .09, ease: 'back.out(1.8)', scrollTrigger: { trigger: root.current, start: 'top 90%', once: true } });
      const floating = gsap.to('.encore-photo', { y: -25, rotation: i => i % 2 ? 5 : -5, duration: 1.1, stagger: { each: .18, from: 'center' }, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true });
      observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? floating.play() : floating.pause(), { threshold: .05 });observer.observe(root.current);
    }, root);
    return () => { observer?.disconnect();ctx.revert(); };
  }, [motion]);
  return <section className="burger-encore" ref={root} aria-label="One last look at the Dre’s menu"><img className="encore-city" src="/assets/kolkata/kolkata-adda-v3.webp" alt="" loading="lazy" /><Sticker>GO ON. PICK YOUR NEXT CRUSH.</Sticker><div className="encore-lineup">{selection.map((item,i) => <button className={`encore-item encore-${i}`} key={item.id} onClick={() => onSelect(item)} aria-label={`View ${item.name} from footer`}><img className="encore-photo" src={item.image} alt={item.name} loading="lazy" /><span>{item.name}<small>₹{item.price} ↗</small></span></button>)}</div><p>A LITTLE BOUNCE. A BIG APPETITE.</p><Sketch type="spark" className="encore-spark" /></section>;
}
