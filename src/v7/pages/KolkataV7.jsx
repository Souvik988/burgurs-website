import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { brand } from '../../data/brand';
import { motionAllowed } from '../../v6/Motion';
import { whenSiteReady } from '../../v6/ready';
import { DoodleBg, NextStop, Ticker, Words, useGsap } from '../kit';
import './kolkata.css';

const day = [
  { time: '12', ampm: 'PM', title: 'LUNCH-BREAK SMASH.', text: 'Office bags down, burgers up. Beck Bagan at midday is a little loud and very tasty.', doodle: 'burger', sky: '#ffe9a8', ink: '#f91814' },
  { time: '4', ampm: 'PM', title: 'ADDA HOUR.', text: 'College friends, one shared box of fries, and an argument nobody is ever going to win.', doodle: 'fries', sky: '#ffc24a', ink: '#5a0710' },
  { time: '7', ampm: 'PM', title: 'THE EVENING QUEUE.', text: 'String lights on, hatch open. This is the crowd Kolkata’s food creators keep filming.', doodle: 'tram', sky: '#f2552c', ink: '#f5e3cd' },
  { time: '10', ampm: 'PM', title: 'LATE CRAVINGS.', text: 'One last burger before the city heads home. Timings change, so give Andre a call first.', doodle: 'heart', sky: '#3a0610', ink: '#ffd750' },
];

const words = [
  { bn: 'আড্ডা', term: 'ADDA', say: 'ud-daa', mean: 'Long, aimless, wonderful conversation with friends. Best served with fries.' },
  { bn: 'পেট পুজো', term: 'PET PUJO', say: 'payt poo-jo', mean: 'Literally “worshipping the stomach”. What you’re about to do at Dre’s.' },
  { bn: 'ঝাল', term: 'JHAAL', say: 'jhaal', mean: 'Spicy heat. Ask for the Hot Chick or the peri peri if you want some.' },
  { bn: 'এক নম্বর', term: 'EK NOMBOR', say: 'ek nom-bor', mean: '“Number one.” First class. What people say after the first bite.' },
  { bn: 'ল্যাদ', term: 'LYAADH', say: 'lyaadh', mean: 'That lazy, can’t-move mood. Perfect time to order in.' },
  { bn: 'খিদে পেয়েছে', term: 'KHIDE PEYECHE', say: 'khi-day pay-ye-chhe', mean: '“I’m hungry.” Say it once and someone will find you a burger.' },
];

function CityHero() {
  const root = useRef(null);
  useGsap(root, () => {
    const intro = gsap.timeline({ paused: true });
    // The entrance uses y/opacity only; the scroll scene uses yPercent/x/scale. Different properties,
    // so the two can never fight over a layer (that left gaps when you scrolled during the entrance).
    intro.fromTo('.kh-sun', { y: '14vh', opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' })
      .fromTo('.kh-far', { y: '20vh', opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, .1)
      .fromTo('.kh-title .v7-line', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, stagger: .12, ease: 'back.out(1.6)' }, .35)
      .fromTo('.kh-mid', { y: '35vh' }, { y: 0, duration: 1.2, ease: 'power3.out' }, .3)
      .fromTo('.kh-street', { y: '45vh' }, { y: 0, duration: 1.1, ease: 'power3.out' }, .5);
    whenSiteReady(() => intro.play());
    const mm = gsap.matchMedia();
    // Phone: same pinned scene, but layers drift sideways at different speeds (portrait screens
    // are narrow, so the parallax reads as a slow pan along the street instead of a zoom).
    // Both timelines are exactly 1 unit long: the layers move for the whole scroll, the title is gone by
    // 40%, the caption is fully in by 70% and then HOLDS until the pin releases, so the last thing you
    // see is always a finished scene. scrub is short so the animation never lags behind the scroll.
    mm.add('(max-width: 699px)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=115%', pin: true, scrub: .25, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.to('.kh-sun', { yPercent: 42, scale: 1.18, duration: 1 }, 0)
        // Vertical-only depth (no sideways drift, so no layer edge can ever slide into view).
        .to('.kh-far', { yPercent: -7, duration: 1 }, 0)
        .to('.kh-title', { yPercent: -45, opacity: 0, duration: .4 }, 0)
        .to('.kh-mid', { yPercent: -3, duration: 1 }, 0)
        .to('.kh-street', { yPercent: 3, scale: 1.05, duration: 1 }, 0)
        .to('.kh-sky', { backgroundColor: '#ffc24a', duration: 1 }, 0)
        .fromTo('.kh-caption', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3 }, .4);
    });
    mm.add('(min-width: 700px)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=120%', pin: true, scrub: .4, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.to('.kh-sun', { yPercent: 55, scale: 1.25, duration: 1 }, 0)
        .to('.kh-far', { yPercent: -6, scale: 1.08, duration: 1 }, 0)
        .to('.kh-title', { yPercent: -70, scale: .82, opacity: 0, duration: .45 }, 0)
        .to('.kh-mid', { yPercent: -10, scale: 1.12, duration: 1 }, 0)
        .to('.kh-street', { xPercent: -14, scale: 1.18, duration: 1 }, 0)
        .to('.kh-sky', { backgroundColor: '#ffc24a', duration: 1 }, 0)
        .fromTo('.kh-caption', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .3 }, .45);
    });
  });
  return <section className="kol-hero page-hero" ref={root} aria-labelledby="kol-title">
    <div className="kh-sky" aria-hidden="true"><span className="kh-sun" /><DoodleBg tone="red" speed={30} /></div>
    <img className="kh-layer kh-far" src="/assets/v7/kol-far.webp" alt="" aria-hidden="true" />
    <Words as="h1" className="kh-title" id="kol-title">{'KOLKATA.\nIN EVERY BITE.'}</Words>
    <img className="kh-layer kh-mid" src="/assets/v7/kol-mid.webp" alt="Paper-cut row of old North Kolkata houses with green shutters and iron balconies" />
    <img className="kh-layer kh-street" src="/assets/v7/kol-street.webp" alt="Paper-cut Kolkata street with a tram, a yellow taxi, a rickshaw and friends sharing burgers" />
    <p className="kh-caption">A little adda. A little chaos. A whole lot of heart. This is the city we cook for.</p>
  </section>;
}

function DayAtDres() {
  const root = useRef(null);
  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add('all', () => {
      const cards = gsap.utils.toArray('.day-card');
      gsap.set(cards.slice(1), { opacity: 0, y: 60, rotation: 4 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${Math.round(innerHeight * (innerWidth < 700 ? 2.4 : 3))}`, pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true, snap: matchMedia('(pointer: fine)').matches ? { snapTo: 1 / 3, directional: false, duration: .5, ease: 'power2.inOut' } : false } });
      // Sun and moon travel an arc as two small layers (cheap) instead of rotating one huge element.
      const sun = root.current.querySelector('.day-sun'), moon = root.current.querySelector('.day-moon');
      const sunX = gsap.quickSetter(sun, 'x', 'px'), sunY = gsap.quickSetter(sun, 'y', 'px'), moonX = gsap.quickSetter(moon, 'x', 'px'), moonY = gsap.quickSetter(moon, 'y', 'px');
      // Phones are narrow, so the sun sweeps a shallower arc and stays on screen the whole day.
      const range = innerWidth < 700 ? 25 : 70;
      const orbit = { a: -range };
      const place = () => {
        const R = Math.max(innerWidth, innerHeight) * .75, r = a => a * Math.PI / 180;
        sunX(Math.sin(r(orbit.a)) * R); sunY(-Math.cos(r(orbit.a)) * R);
        moonX(Math.sin(r(orbit.a + 180)) * R); moonY(-Math.cos(r(orbit.a + 180)) * R);
      };
      place();
      tl.to(orbit, { a: range, ease: 'none', duration: 3, onUpdate: place }, 0)
        .fromTo('.day-skyline-night', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 3 }, 0)
        .fromTo('.day-stars', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 1 }, 2);
      day.forEach((d, i) => {
        if (!i) return;
        tl.to(root.current, { backgroundColor: d.sky, color: d.ink, duration: 1, ease: 'none' }, i - 1)
          .to(cards[i - 1], { opacity: 0, y: -60, rotation: -4, duration: .45 }, i - .55)
          .to(cards[i], { opacity: 1, y: 0, rotation: 0, duration: .45 }, i - .3)
          .to('.day-clock-time', { textContent: d.time, snap: { textContent: 1 }, duration: .01 }, i - .3)
          .to('.day-clock-ampm', { textContent: d.ampm, duration: .01 }, i - .3);
      });
    });
  });
  return <section className="day-at-dres" ref={root} aria-labelledby="day-title">
    <div className="day-stars" aria-hidden="true">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 55}%`, animationDelay: `${-i * .3}s` }} />)}</div>
    <div className="day-orb" aria-hidden="true"><span className="day-sun" /><span className="day-moon" /></div>
    <div className="day-head"><span className="v7-kicker">FROM LUNCH TO LAST CALL</span><h2 id="day-title" className="day-title">A DAY AT DRE’S.</h2></div>
    <div className="day-clock" aria-hidden="true"><span className="day-clock-time">12</span><span className="day-clock-ampm">PM</span></div>
    <div className="day-cards">{day.map(d => <article className="day-card" key={d.title}><img src={`/assets/v7/icons/${d.doodle}.webp`} alt="" /><span className="day-card-time">{d.time} {d.ampm}</span><h3>{d.title}</h3><p>{d.text}</p></article>)}</div>
    <img className="day-skyline" src="/assets/v7/kol-far.webp" alt="" aria-hidden="true" /><img className="day-skyline day-skyline-night" src="/assets/v7/kol-far.webp" alt="" aria-hidden="true" />
  </section>;
}

function Decoded() {
  const root = useRef(null);
  const [open, setOpen] = useState(() => new Set());
  useGsap(root, () => {
    gsap.fromTo('.dict-card', { y: -200, x: () => gsap.utils.random(-200, 200), rotation: () => gsap.utils.random(-50, 50), opacity: 0 }, { y: 0, x: 0, rotation: i => [-4, 3, -2, 4, -3, 2][i], opacity: 1, duration: .9, stagger: .09, ease: 'back.out(1.3)', scrollTrigger: { trigger: '.dict-grid', start: 'top 80%', once: true } });
  });
  const flip = (i, e) => {
    setOpen(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
    if (motionAllowed()) gsap.fromTo(e.currentTarget, { scale: .94 }, { scale: 1, duration: .5, ease: 'elastic.out(1, .4)' });
  };
  return <section className="kol-decoded v7-section" ref={root} aria-labelledby="dict-title">
    <DoodleBg tone="red" />
    <span className="v7-kicker">SPEAK FLUENT KOLKATA</span>
    <Words className="dict-title" id="dict-title">{'KOLKATA,\nDECODED.'}</Words>
    <p className="v7-body">Six words you’ll hear in the queue. Tap a card to learn it.</p>
    <div className="dict-grid">{words.map((w, i) => <button type="button" key={w.term} className={`dict-card ${open.has(i) ? 'is-open' : ''}`} aria-pressed={open.has(i)} onClick={e => flip(i, e)}>
      <span className="dict-inner">
        <span className="dict-front"><span className="dict-bn" lang="bn">{w.bn}</span><strong>{w.term}</strong><small>/{w.say}/</small><em>TAP TO TRANSLATE ↻</em></span>
        <span className="dict-back"><strong>{w.term}</strong><span>{w.mean}</span></span>
      </span>
    </button>)}</div>
  </section>;
}

const ROUTE = 'M120 930 C 230 830, 350 650, 520 470 S 820 520, 1010 535 S 1290 470, 1372 300';
const VB = { w: 1536, h: 1024 };
function OurCorner() {
  const root = useRef(null);
  useGsap(root, () => {
    const map = root.current.querySelector('.corner-map');
    const path = root.current.querySelector('.corner-route-base');
    const drawn = root.current.querySelector('.corner-route-drawn');
    const rider = root.current.querySelector('.corner-rider');
    const len = path.getTotalLength();
    let scale = 1;
    const measure = () => { scale = map.clientWidth / VB.w; };
    const place = t => {
      const pt = path.getPointAtLength(len * t), ahead = path.getPointAtLength(Math.min(len, len * t + 6));
      gsap.set(rider, { x: pt.x * scale, y: pt.y * scale, rotation: gsap.utils.clamp(-24, 24, Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 90 / Math.PI) });
      drawn.style.strokeDasharray = `${t} 1`;
    };
    measure(); place(0);
    gsap.fromTo('.corner-map-art', { scale: 1.16 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: map, start: 'top bottom', end: 'bottom 40%', scrub: 1 } });
    // Arrival: the label stamps on, the pin pulses and a burst of doodles flies out.
    const arrive = gsap.timeline({ paused: true })
      .fromTo('.corner-label-2', { scale: 0, rotation: -25 }, { scale: 1, rotation: -3, duration: .5, ease: 'back.out(3)' }, 0)
      .fromTo('.corner-burst img', { x: 0, y: 0, scale: 0, opacity: 1 }, { x: i => Math.cos(i * 1.26 - 1) * 90, y: i => Math.sin(i * 1.26 - 1) * 70, rotation: i => (i - 2) * 50, scale: 1, opacity: 0, duration: 1, ease: 'power3.out', stagger: .04 }, 0)
      .fromTo('.corner-pulse', { scale: .3, opacity: .9 }, { scale: 2.6, opacity: 0, duration: .9, ease: 'power2.out', repeat: 2 }, 0);
    let arrived = false;
    gsap.set('.corner-label-2', { scale: 0 });
    gsap.timeline({
      scrollTrigger: {
        trigger: map, start: 'top 80%', end: 'bottom 55%', scrub: .6, invalidateOnRefresh: true, onRefreshInit: measure,
        onUpdate: self => {
          place(self.progress);
          if (self.progress > .97 && !arrived) { arrived = true; arrive.restart(); }
          else if (self.progress < .9 && arrived) { arrived = false; arrive.pause(0); }
        },
      },
    })
      .fromTo('.corner-label-1, .corner-label-3', { scale: 0, rotation: -25 }, { scale: 1, rotation: i => [-4, 3][i], stagger: .2, ease: 'back.out(2.4)', duration: .3 }, 0)
      .fromTo('.corner-start', { scale: 0 }, { scale: 1, duration: .25, ease: 'back.out(3)' }, 0);
    addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  });
  return <section className="kol-corner v7-section" ref={root}>
    <div className="corner-copy">
      <span className="v7-kicker">OUR LITTLE CORNER</span>
      <Words className="corner-title">{'BECK BAGAN,\nBALLYGUNGE.'}</Words>
      <p className="v7-body">Off Park Circus, on Ustad Enayet Khan Avenue, there’s a small red hatch and a flat-top that’s always hot. That’s us.</p>
      <Link className="button button-primary" to="/visit"><span className="button-text">PLAN YOUR BURGER RUN</span><span className="button-arrow" aria-hidden="true">↗</span></Link>
    </div>
    <a className="corner-map" href={brand.maps} target="_blank" rel="noopener noreferrer" aria-label="Open directions to Dre’s Burgers in Google Maps. Illustrated map of the neighbourhood.">
      <picture><source media="(max-width: 700px)" srcSet="/assets/v8/map-papercut-900.webp" /><img className="corner-map-art" src="/assets/v8/map-papercut.webp" alt="" width="1536" height="1024" loading="lazy" /></picture>
      <svg className="corner-route" viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d={ROUTE} fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" opacity=".5" />
        <path className="corner-route-base" d={ROUTE} fill="none" stroke="var(--red)" strokeWidth="9" strokeLinecap="round" strokeDasharray="2 22" opacity=".55" />
        <path className="corner-route-drawn" d={ROUTE} fill="none" stroke="var(--red)" strokeWidth="13" strokeLinecap="round" pathLength="1" strokeDasharray="0 1" />
      </svg>
      <span className="corner-start" aria-hidden="true"><i />YOU, HUNGRY</span>
      <span className="corner-rider" aria-hidden="true"><img src="/assets/v7/icons/taxi.webp" alt="" /></span>
      <span className="corner-pulse" aria-hidden="true" />
      <span className="corner-burst" aria-hidden="true">{['burger', 'heart', 'spark', 'fries', 'bolt'].map(n => <img key={n} src={`/assets/v7/icons/${n}.webp`} alt="" />)}</span>
      <span className="corner-label corner-label-1" aria-hidden="true">PARK CIRCUS</span>
      <span className="corner-label corner-label-2" aria-hidden="true">DRE’S IS HERE!</span>
      <span className="corner-label corner-label-3" aria-hidden="true">BALLYGUNGE</span>
      <span className="corner-tap" aria-hidden="true">TAP FOR DIRECTIONS ↗</span>
    </a>
  </section>;
}

export default function KolkataPageV7() {
  return <div className="route-page kolkata-page kolkata-v7">
    <CityHero />
    <Ticker items={['CITY OF JOY', 'TRAMS & TAXIS', 'ADDA ALL DAY', 'ONE MORE BITE']} />
    <DayAtDres />
    <Decoded />
    <OurCorner />
    <NextStop to="/stories" kicker="NEXT STOP · FOOD STORIES" title="NOW SHOWING: DRE’S" image="/assets/v8/stickers/clapper.webp" tone="mustard" />
  </div>;
}
