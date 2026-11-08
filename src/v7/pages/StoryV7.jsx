import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brand } from '../../data/brand';
import { useSite, external } from '../../site';
import { whenSiteReady } from '../../v6/ready';
import { DoodleBg, NextStop, Ticker, Words, useGsap, useHorizontal, useRise } from '../kit';
import './story.css';

const chapters = [
  { tag: 'BEFORE IT ALL', title: 'A HOME KITCHEN.', text: 'A lot of experimenting, a lot of buns, and calls to his mum for cooking tips. Andre’s love of making burgers started at a home stove.', img: '/assets/v7/story-home-kitchen.webp', note: 'Illustration, based on a public Dre’s work photo.', wide: true },
  { tag: '2020', title: 'THE FIRST SPOTLIGHT.', text: 'Andre’s early food story was featured in Lifestyle Asia’s guide to Kolkata’s home chefs.', img: '/assets/founder/dres-press-2020.jpg', link: ['READ THE 2020 GUIDE', 'https://www.lifestyleasia.com/ind/dining/food/10-best-home-chefs-in-kolkata/'] },
  { tag: '2022', title: 'THE SMASH CLUB GOES ONLINE.', text: 'Dre’s starts posting reels: smashburgs, stamped buns and a pre-Pujo pop-up with Kolkata’s food community.', img: '/assets/founder/burger-social-source.jpg', img2: '/assets/founder/kitchen-reel-source.jpg', link: ['SEE THE 2022 REEL', 'https://www.instagram.com/reel/CkKnKKCPzfk/'] },
  { tag: 'BECK BAGAN', title: 'A TINY KIOSK.', text: '102, Ustad Enayet Khan Avenue. A small hatch, a hot flat-top and a lot of heart, right in the middle of the city.', img: '/assets/media/dres-food-3.jpg' },
  { tag: '2026', title: 'THE CROWD IS REAL.', text: 'Kolkata’s food creators keep turning up with cameras. The queue keeps turning up hungry.', img: '/assets/v7/story-night-crowd.webp', note: 'Illustration.', wide: true },
];

const method = [
  { word: 'SMASH', text: 'A ball of beef meets a screaming-hot flat-top. Press hard, once. That’s where the lacy crust comes from.', img: '/assets/founder/andre-griddle-concept-v5.webp', ai: true },
  { word: 'SEAR', text: 'Let it sizzle, flip it, melt the cheese right on top. No shortcuts, no hurry.', img: '/assets/founder/smash-club-source.jpg' },
  { word: 'STAMP', text: 'Every bun wears the name. If it doesn’t say DRE’S, it isn’t ours.', img: '/assets/founder/signature-buns-source.jpg' },
  { word: 'STACK', text: 'Sauce, crunch, patty, repeat. Built to be eaten with both hands.', img: '/assets/founder/andre-finishing-concept-v5.webp', ai: true },
  { word: 'SERVE', text: 'Straight from Andre’s gloves to yours. Still hot. Still a little messy.', img: '/assets/founder/food-story-source.jpg' },
];

const principles = [
  { title: 'REAL CHICKEN FILLETS.', text: 'Whole fillets, crumbed and fried crisp. Kolkata’s food creators noticed first.', doodle: 'bolt' },
  { title: 'SMASHED ON THE FLAT-TOP.', text: 'Thin patties, crispy edges, a proper sear. The smash club is always open.', doodle: 'spark' },
  { title: 'EVERY BUN STAMPED.', text: 'A small detail you can taste with your eyes. Look for the DRE’S on top.', doodle: 'heart' },
];

function StoryHero() {
  const root = useRef(null);
  useGsap(root, () => {
    const intro = gsap.timeline({ paused: true });
    intro.fromTo('.sh-art img', { scale: 1.25, opacity: .4 }, { scale: 1.08, opacity: 1, duration: 1.6, ease: 'power3.out' })
      .fromTo('.sh-copy > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out' }, .3);
    whenSiteReady(() => intro.play());
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } });
    tl.to('.sh-art', { yPercent: 18, ease: 'none' }, 0).to('.sh-copy', { yPercent: -40, opacity: 0, ease: 'none' }, 0).to('.sh-steam', { y: -160, opacity: 0, stagger: .1, ease: 'none' }, 0);
  });
  return <section className="story-hero-v7 page-hero" ref={root}>
    <div className="sh-art"><img src="/assets/v7/story-home-kitchen.webp" alt="Paper-cut illustration of Andre cooking smash burgers in a home kitchen at night, phone on speaker to his mum" width="1536" height="1024" fetchPriority="high" /></div>
    {[0, 1, 2].map(i => <img key={i} className={`sh-steam sh-steam-${i}`} src="/assets/v7/icons/loop.webp" alt="" aria-hidden="true" />)}
    <div className="sh-copy">
      <span className="v7-kicker">HELLO. WE’RE DRE’S.</span>
      <h1 className="sh-title">BEFORE THE KIOSK,<br />THERE WAS A <em>KITCHEN.</em></h1>
      <p className="v7-body">This is the story of Andre Dragwidge, a flat-top, and a city that can’t stop coming back for one more bite.</p>
      <span className="sh-scroll" aria-hidden="true">SCROLL THE STORY ↓</span>
    </div>
    <small className="sh-note">Illustration based on a public Dre’s work photo.</small>
  </section>;
}

function Chapters() {
  const root = useRef(null);
  const rider = useRef(null);
  useHorizontal(root, {
    onProgress: p => { if (rider.current) rider.current.style.setProperty('--p', p); },
    extra: tween => {
      gsap.utils.toArray(root.current.querySelectorAll('.ch-card')).forEach(card => {
        gsap.fromTo(card.querySelector('.ch-photo'), { rotation: -10, y: 80, scale: .85 }, { rotation: card.dataset.r, y: 0, scale: 1, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: card, start: 'left right', end: 'left 35%', scrub: true } });
        gsap.fromTo(card.querySelector('.ch-tag'), { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: card, start: 'left 85%', end: 'left 45%', scrub: true } });
      });
    },
  });
  return <section className="story-chapters" ref={root} aria-labelledby="chapters-title">
    <DoodleBg tone="mustard" speed={40} />
    <div className="ch-rail" ref={rider} aria-hidden="true"><span className="ch-rail-fill" /><img src="/assets/v7/icons/burger.webp" alt="" className="ch-rail-rider" /></div>
    <div className="v7-track">
      <div className="ch-intro"><span className="v7-kicker">FIVE CHAPTERS. ONE FLAT-TOP.</span><Words className="ch-title" id="chapters-title">{'HOW A HOME\nCOOK GOT\nA CROWD.'}</Words></div>
      {chapters.map((c, i) => <article className={`ch-card ${c.wide ? 'is-wide' : ''}`} key={c.title} data-r={[-3, 2, -2, 3, -1][i]}>
        <span className="ch-tag">{c.tag}</span>
        <figure className="ch-photo">
          <img src={c.img} alt={c.title} loading="lazy" />
          {c.img2 && <img className="ch-photo-2" src={c.img2} alt="A Kolkata food community thank-you post for a pre-Pujo pop-up" loading="lazy" />}
          <span className="ch-tape" aria-hidden="true" />
        </figure>
        <div className="ch-copy"><span className="ch-num">0{i + 1}</span><h3>{c.title}</h3><p>{c.text}</p>{c.link && <a href={c.link[1]} {...external}>{c.link[0]} ↗</a>}{c.note && <small>{c.note}</small>}</div>
      </article>)}
    </div>
  </section>;
}

function Method() {
  const root = useRef(null);
  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add('all', () => {

      const shots = gsap.utils.toArray('.m-shot');
      const texts = gsap.utils.toArray('.m-text');
      gsap.set(shots.slice(1), { yPercent: 120, rotation: 12 });
      gsap.set(texts.slice(1), { opacity: 0, y: 30 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${Math.round(innerHeight * (method.length - .4) * (innerWidth < 900 ? .75 : 1))}`, pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true, snap: matchMedia('(pointer: fine)').matches ? { snapTo: 1 / (method.length - 1), directional: false, duration: .5, ease: 'power2.inOut' } : false } });
      method.forEach((_, i) => {
        if (!i) return;
        tl.to('.m-words', { yPercent: -100 * i / method.length, ease: 'power2.inOut', duration: 1 }, i - 1)
          .to(shots[i - 1], { yPercent: -30, scale: .8, rotation: -14, opacity: 0, duration: 1, ease: 'power2.in' }, i - 1)
          .to(shots[i], { yPercent: 0, rotation: [-4, 3, -3, 4, -2][i], duration: 1, ease: 'power2.out' }, i - 1)
          .to(texts[i - 1], { opacity: 0, y: -30, duration: .4 }, i - 1)
          .to(texts[i], { opacity: 1, y: 0, duration: .5 }, i - .5)
          .to('.m-counter i', { textContent: i + 1, snap: { textContent: 1 }, duration: .01 }, i - .5);
      });
    });
  });
  return <section className="story-method" ref={root} aria-labelledby="method-title">
    <DoodleBg tone="cream" speed={50} />
    <div className="m-left">
      <span className="v7-kicker">THE DRE’S METHOD</span>
      <h2 className="sr-only" id="method-title">The Dre’s method: smash, sear, stamp, stack, serve</h2>
      <div className="m-window" aria-hidden="true"><div className="m-words">{method.map(m => <span className="m-word" key={m.word}>{m.word}.</span>)}</div></div>
      <div className="m-texts">{method.map((m, i) => <p className="m-text" key={m.word}><b className="m-mobile-word">{m.word}.</b>{m.text}{m.ai && <small> AI-created work scene based on public Dre’s photos.</small>}</p>)}</div>
      <span className="m-counter" aria-hidden="true"><i>1</i> / {method.length}</span>
    </div>
    <div className="m-right">{method.map((m, i) => <figure className="m-shot" key={m.word} style={{ zIndex: i + 1 }}><img src={m.img} alt={`${m.word}: ${m.text}`} loading="lazy" /><figcaption>{m.word}{m.ai ? ' · AI SCENE' : ' · REAL DRE’S'}</figcaption></figure>)}</div>
  </section>;
}

function Principles() {
  const root = useRef(null);
  useGsap(root, () => {
    gsap.fromTo('.pr-card', { rotationY: -95, opacity: 0, transformPerspective: 900 }, { rotationY: 0, opacity: 1, duration: 1, stagger: .18, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.pr-grid', start: 'top 80%', once: true } });
    gsap.fromTo('.pr-quote', { scale: .7, rotation: -8, opacity: 0 }, { scale: 1, rotation: -2, opacity: 1, duration: .9, ease: 'back.out(2)', scrollTrigger: { trigger: '.pr-quote', start: 'top 85%', once: true } });
  });
  return <section className="story-principles v7-section" ref={root}>
    <DoodleBg tone="red" />
    <span className="v7-kicker">GOOD FOOD. NO BIG FUSS.</span>
    <Words className="pr-title">{'THREE THINGS\nWE DON’T SKIP.'}</Words>
    <div className="pr-grid">{principles.map((p, i) => <article className="pr-card" key={p.title}><img src={`/assets/v7/icons/${p.doodle}.webp`} alt="" /><span>0{i + 1}</span><h3>{p.title}</h3><p>{p.text}</p></article>)}</div>
    <blockquote className="pr-quote"><p>“Tiny kiosk. One man. Zero shortcuts.”</p><cite><a href="https://www.instagram.com/reel/DTrp92mjLM1/" {...external}>— KOLKATA DELITES, JAN 2026 ↗</a></cite></blockquote>
    <a className="button button-outline pr-insta" href={brand.instagram} {...external}><span className="button-text">FOLLOW ANDRE &amp; DRE’S ON INSTAGRAM</span><span aria-hidden="true" className="button-arrow">↗</span></a>
  </section>;
}

export default function StoryPageV7() {
  const root = useRef(null);
  useRise(root);
  useSite();
  return <div className="route-page story-page story-v7" ref={root}>
    <StoryHero />
    <Chapters />
    <Ticker items={['SMASH', 'SEAR', 'STAMP', 'STACK', 'SERVE']} tone="mustard" />
    <Method />
    <Principles />
    <NextStop to="/kolkata" kicker="NEXT STOP · OUR CITY" title="KOLKATA, IN EVERY BITE" image="/assets/v8/stickers/tram.webp" tone="mustard" />
  </div>;
}

void ScrollTrigger;
