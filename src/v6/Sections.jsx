import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CountUp, Doodle, FallingDoodles, JumpText, Squiggle, motionAllowed } from './Motion';
import './sections.css';

gsap.registerPlugin(ScrollTrigger);
const external = { target: '_blank', rel: 'noopener noreferrer' };

const crew = [
  { id: 'burger', name: 'BUN-NY', role: 'HEAD OF HOLDING IT TOGETHER', line: 'Two hands, please. I’m stacked.' },
  { id: 'fries', name: 'FRY-DAY', role: 'CHIEF SHARING OFFICER', line: 'I’m always the first to go.' },
  { id: 'chilli', name: 'MIRCHI', role: 'DIRECTOR OF A LITTLE HEAT', line: 'Optional. But brave.' },
];

export function MeetTheCrew({ motion }) {
  const root = useRef(null);
  const [talking, setTalking] = useState(null);
  useEffect(() => {
    if (!motion || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.crew-portrait', start: 'top 78%', once: true } });
      tl.fromTo('.crew-sun', { scale: 0 }, { scale: 1, duration: .7, ease: 'back.out(1.8)' })
        .fromTo('.crew-andre', { yPercent: 40, rotation: -8, opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, duration: .9, ease: 'back.out(1.4)' }, '-=.45')
        .fromTo('.crew-portrait .crew-pop', { scale: 0, rotation: -60 }, { scale: 1, rotation: 0, duration: .5, stagger: .08, ease: 'back.out(2.6)' }, '-=.4')
        .fromTo('.crew-tag', { y: 30, opacity: 0, rotation: 8 }, { y: 0, opacity: 1, rotation: -4, duration: .5, ease: 'back.out(2)' }, '-=.3');
      gsap.to('.crew-andre', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('.crew-sun', { rotation: 25, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      // Mascots leap onto the bench one after another, then idle-hop.
      const mates = gsap.utils.toArray('.crew-mate-art');
      gsap.fromTo(mates, { y: -260, rotation: () => gsap.utils.random(-40, 40), opacity: 0 }, {
        y: 0, rotation: 0, opacity: 1, duration: 1.1, ease: 'bounce.out', stagger: .18,
        scrollTrigger: { trigger: '.crew-bench', start: 'top 85%', once: true },
        onComplete: () => mates.forEach((m, i) => gsap.to(m, { y: -14, duration: .38, ease: 'power1.out', yoyo: true, repeat: -1, repeatDelay: 1.6, delay: i * .5 })),
      });
    }, root);
    return () => ctx.revert();
  }, [motion]);
  const poke = (i, e) => {
    setTalking(i);
    if (!motionAllowed()) return;
    const art = e.currentTarget.querySelector('.crew-mate-art');
    gsap.timeline().to(art, { y: -60, scaleY: 1.08, scaleX: .94, rotation: i % 2 ? 12 : -12, duration: .25, ease: 'power2.out', overwrite: 'auto' })
      .to(art, { y: 0, scaleY: 1, scaleX: 1, rotation: 0, duration: .8, ease: 'bounce.out' });
  };
  return <section className="crew-section section-space" ref={root} aria-labelledby="crew-title">
    <FallingDoodles motion={motion} items={[{ name: 'spark', x: '4%', y: '8%', size: 64, r: -10 }, { name: 'loop', x: '88%', y: '6%', size: 110, r: 8 }, { name: 'heart', x: '93%', y: '62%', size: 58, r: 14 }]} />
    <div className="crew-portrait">
      <span className="crew-sun" aria-hidden="true" />
      <img className="crew-andre" src="/assets/v6/andre-papercut.webp" alt="Paper-cut illustration of founder Andre Dragwidge holding a Dre’s burger in black kitchen gloves" width="1024" height="1536" loading="lazy" />
      <Doodle name="spark" className="crew-pop crew-pop-1" />
      <Doodle name="bolt" className="crew-pop crew-pop-2" />
      <Doodle name="heart" className="crew-pop crew-pop-3" />
      <span className="crew-tag">ANDRE · FOUNDER &amp; GRIDDLE BOSS</span>
    </div>
    <div className="crew-copy">
      <span className="sticker">THE HANDS BEHIND THE BUNS.</span>
      <JumpText className="crew-title" as="h2">{'SMALL KIOSK.\nBIG CREW ENERGY.'}</JumpText>
      <Squiggle className="crew-squiggle" />
      <p>At the griddle: <strong>Andre Dragwidge</strong>, whose love of making burgers turned into Dre’s. Every patty smashed, every bun stamped, every order wrapped in a little corner of Beck Bagan.</p>
      <p className="crew-sub">Keeping him company? Three regulars who never leave the counter. Tap one.</p>
      <div className="crew-bench" role="list">
        {crew.map((m, i) => <button type="button" role="listitem" className={`crew-mate ${talking === i ? 'is-talking' : ''}`} key={m.id} onClick={e => poke(i, e)} aria-label={`${m.name}, ${m.role}. Says: ${m.line}`}>
          <span className="crew-bubble" aria-hidden="true">{m.line}</span>
          <img className="crew-mate-art" src={`/assets/v6/mascots/${m.id}.webp`} alt="" loading="lazy" />
          <strong>{m.name}</strong><small>{m.role}</small>
        </button>)}
      </div>
      <Link className="button button-primary" to="/story"><span className="button-text">READ ANDRE’S STORY</span><span aria-hidden="true" className="button-arrow">↗</span></Link>
      <small className="crew-note">Illustrated from a public Dre’s work photo. The crew are cartoons; the burgers are real.</small>
    </div>
  </section>;
}

const ratings = [
  { value: 4.6, decimals: 1, label: 'ZOMATO DELIVERY', sub: <><CountUp to={1134} /> RATINGS</>, href: 'https://www.zomato.com/kolkata/dres-burgers-park-circus-area', tone: 'red' },
  { value: 4.7, decimals: 1, label: 'MAGICPIN', sub: <><CountUp to={125} /> REVIEWS</>, href: 'https://magicpin.in/Kolkata/Beck-Bagan/Restaurant/Dres-Burgers/store/1cc4c32/reviews', tone: 'mustard' },
  { value: 200, prefix: '₹', label: 'FOR ONE, ROUGHLY', sub: <>ZOMATO ESTIMATE</>, href: 'https://www.zomato.com/kolkata/dres-burgers-park-circus-area', tone: 'cream' },
];
const chatter = ['JUICY, WELL-SEASONED PATTIES', 'THOSE FRIES THOUGH', 'CLEVER PACKAGING', 'THE CROWD IS REAL', 'ANGLO-INDIAN SOUL', 'WORTH THE DETOUR'];

export function WordOnTheStreet({ motion }) {
  const root = useRef(null);
  useEffect(() => {
    if (!motion || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.wots-card', { y: -340, rotation: i => [-24, 18, -12][i], opacity: 0 }, { y: 0, rotation: i => [-3, 2.5, -1.5][i], opacity: 1, duration: 1.15, ease: 'bounce.out', stagger: .16, scrollTrigger: { trigger: '.wots-cards', start: 'top 80%', once: true } });
      gsap.fromTo('.wots-chip', { y: -220, opacity: 0, rotation: () => gsap.utils.random(-50, 50) }, { y: 0, opacity: 1, rotation: i => [-6, 4, -3, 7, -5, 3][i % 6], duration: 1, ease: 'bounce.out', stagger: { each: .1, from: 'random' }, scrollTrigger: { trigger: '.wots-chips', start: 'top 88%', once: true } });
      gsap.fromTo('.wots-kiosk img', { yPercent: 12, scale: 1.06 }, { yPercent: -4, scale: 1, ease: 'none', scrollTrigger: { trigger: '.wots-kiosk', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }, root);
    return () => ctx.revert();
  }, [motion]);
  const hop = e => { if (!motionAllowed()) return; gsap.timeline().to(e.currentTarget, { y: -26, duration: .2, ease: 'power2.out', overwrite: 'auto' }).to(e.currentTarget, { y: 0, duration: .6, ease: 'bounce.out' }); };
  return <section className="wots-section" ref={root} aria-labelledby="wots-title">
    <FallingDoodles motion={motion} items={[{ name: 'soda', x: '5%', y: '10%', size: 70, r: -8 }, { name: 'ketchup', x: '86%', y: '14%', size: 96, r: 12 }, { name: 'spark', x: '74%', y: '4%', size: 48, r: 0 }]} />
    <div className="wots-head">
      <span className="sticker">WORD ON THE STREET.</span>
      <JumpText as="h2" className="wots-title">{'KOLKATA\nHAS SPOKEN.'}</JumpText>
      <p>We could tell you the burgers are good. Kolkata already did — on every app we’re on.</p>
    </div>
    <div className="wots-cards">
      {ratings.map(r => <a key={r.label} className={`wots-card wots-${r.tone}`} href={r.href} {...external} onPointerEnter={hop}>
        <span className="wots-num">{r.prefix}{r.prefix ? r.value : <CountUp to={r.value} decimals={r.decimals} />}{!r.prefix && <i aria-hidden="true">★</i>}</span>
        <strong>{r.label}</strong><small>{r.sub}</small><span className="wots-open" aria-hidden="true">↗</span>
      </a>)}
    </div>
    <ul className="wots-chips" aria-label="What reviewers keep mentioning">{chatter.map(c => <li className="wots-chip" key={c} onPointerEnter={hop}>{c}</li>)}</ul>
    <figure className="wots-kiosk">
      <img src="/assets/v6/kiosk-papercut.webp" alt="Paper-cut illustration of a small Kolkata burger kiosk with a red DRE’S awning, friends eating burgers and a yellow taxi" width="1536" height="1024" loading="lazy" />
      <figcaption>Ratings as listed on Zomato and magicpin, November 2026. Highlights paraphrase public reviews. Paper-cut scene is an illustration.</figcaption>
    </figure>
  </section>;
}
