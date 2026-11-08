import React, { useRef } from 'react';
import gsap from 'gsap';
import { brand, photos, videos } from '../../data/brand';
import { founderPosts } from '../../data/kolkata';
import { useSite, external } from '../../site';
import { whenSiteReady } from '../../v6/ready';
import { DoodleBg, NextStop, Words, useGsap, useHorizontal } from '../kit';
import './stories.css';

const creatorReels = [
  ...videos.map(v => ({ ...v, who: v.creator.split(' · ')[0], year: v.type === 'youtube' ? 'YOUTUBE' : 'INSTAGRAM' })),
  { id: 'DdiaI58BKGK', title: 'A massive crowd favourite.', label: 'STRONGEST EATER', who: 'StrongestEater', creator: 'StrongestEater · Instagram', year: 'SEP 2026', url: 'https://www.instagram.com/reel/DdiaI58BKGK/', embed: 'https://www.instagram.com/reel/DdiaI58BKGK/embed/', poster: 'crowd' },
];
const dresReels = founderPosts.map(p => ({ ...p, who: '@d.r.es', label: 'FROM DRE’S', creator: 'Public post from the Dre’s Instagram archive', embed: `https://www.instagram.com/p/${p.id}/embed/`, title: p.title }));
const reels = [creatorReels[0], dresReels[0], creatorReels[1], dresReels[1], creatorReels[3], dresReels[2], creatorReels[2], dresReels[3]];

function CinemaHero() {
  const root = useRef(null);
  useGsap(root, () => {
    const intro = gsap.timeline({ paused: true });
    intro.to('.ch-count', { opacity: 1, duration: .01 })
      .fromTo('.ch-count-sweep', { rotation: 0 }, { rotation: 360, duration: .5, repeat: 2, ease: 'none' })
      .to('.ch-count-num', { textContent: 2, duration: .01 }, .51).to('.ch-count-num', { textContent: 1, duration: .01 }, 1.01)
      .to('.ch-count', { opacity: 0, scale: 1.3, duration: .25 }, 1.5)
      .to('.cin-curtain-l', { xPercent: -102, duration: 1.2, ease: 'power3.inOut' }, 1.55)
      .to('.cin-curtain-r', { xPercent: 102, duration: 1.2, ease: 'power3.inOut' }, 1.55)
      .fromTo('.cin-copy > *', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out' }, 2.1);
    whenSiteReady(() => intro.play());
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } });
    tl.to('.cin-art img', { scale: 1.5, yPercent: 8, ease: 'none' }, 0).to('.cin-copy', { yPercent: -60, opacity: 0, ease: 'none' }, 0);
  });
  return <section className="cinema-hero-v7 page-hero" ref={root} aria-labelledby="cin-title">
    <div className="cin-art"><img src="/assets/v7/stories-cinema.webp" alt="Paper-cut illustration of a grand old Kolkata cinema with a marquee reading NOW SHOWING: DRE’S" width="1536" height="1024" fetchPriority="high" /></div>
    <div className="cin-shade" aria-hidden="true" />
    <div className="cin-copy">
      <span className="v7-kicker">SOME THINGS DESERVE A REPLAY.</span>
      <h1 className="cin-title" id="cin-title"><span className="cin-bulbs" aria-hidden="true" />GOOD FOOD.<br />GREAT STORIES.</h1>
      <p className="v7-body">Reels from Kolkata’s food creators, clips from Andre’s own kitchen, and the real photos behind them.</p>
    </div>
    <div className="cin-curtain cin-curtain-l" aria-hidden="true" /><div className="cin-curtain cin-curtain-r" aria-hidden="true" />
    <div className="ch-count" aria-hidden="true"><span className="ch-count-sweep" /><span className="ch-count-num">3</span></div>
    <small className="cin-note">Illustration.</small>
  </section>;
}

function FilmStrip() {
  const root = useRef(null);
  const { setOverlay } = useSite();
  useHorizontal(root, {
    extra: tween => {
      gsap.utils.toArray(root.current.querySelectorAll('.film-frame')).forEach(f => gsap.fromTo(f.querySelector('.film-poster img'), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: f, start: 'left right', end: 'right left', scrub: true } }));
    },
  });
  return <section className="film-strip-section" ref={root} aria-labelledby="film-title">
    <DoodleBg tone="cream" speed={40} />
    <div className="film-head"><span className="v7-kicker">NOW SHOWING</span><Words className="film-title" id="film-title">{'PRESS PLAY.\nGET HUNGRY.'}</Words></div>
    <div className="v7-track film-track">
      {reels.map((r, i) => <article className="film-frame" key={r.id}>
        <button type="button" className="film-poster" onClick={() => setOverlay({ type: 'video', data: r })} aria-label={`Play ${r.title} by ${r.who}`}>
          {r.image ? <img src={r.image} alt="" loading="lazy" /> : <span className="film-designed"><img src="/assets/v7/icons/burger.webp" alt="" /><b>{r.who}</b><i>“{r.title}”</i></span>}
          <span className="film-play" aria-hidden="true">▶</span>
          <span className="film-who">{r.label || r.who}</span>
        </button>
        <div className="film-cap"><span>{String(i + 1).padStart(2, '0')} · {r.year || 'REEL'}</span><h3>{r.title}</h3><a href={r.url} {...external}>ORIGINAL POST ↗</a></div>
      </article>)}
      <article className="film-frame film-end"><span className="film-end-num">YOUR<br />REEL<br />HERE?</span><a className="button button-primary" href={brand.instagram} {...external}><span className="button-text">TAG @D.R.ES</span><span className="button-arrow" aria-hidden="true">↗</span></a></article>
    </div>
    <p className="film-credit">Videos belong to their creators and play from their original hosts.</p>
  </section>;
}

function BehindTheShot() {
  const root = useRef(null);
  const { setOverlay } = useSite();
  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add('all', () => {
      // DOM order is top-of-pile first (card 1 has the highest z-index), so the card you
      // can see on top is always the one that flies away; the next photo is revealed beneath.
      const cards = gsap.utils.toArray('.pile-card');
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${innerHeight * (cards.length - 1) * .7}`, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
      gsap.set(cards, { rotation: i => [-6, 4, -3, 7, -2][i] });
      cards.slice(0, -1).forEach((c, i) => tl.to(c, { x: () => (i % 2 ? -1 : 1) * innerWidth * 1.1, y: [-90, 60, -40, 90][i % 4], rotation: i % 2 ? -38 : 38, duration: 1, ease: 'power2.in' }, i).to('.pile-count i', { textContent: i + 2, snap: { textContent: 1 }, duration: .01 }, i + .5));
    });
  });
  return <section className="behind-shot" ref={root} aria-labelledby="pile-title">
    <DoodleBg tone="red" />
    <div className="pile-copy"><span className="v7-kicker">NO FILTER ON THE FLAVOUR</span><Words className="pile-title" id="pile-title">{'BEHIND\nTHE SHOT.'}</Words><p className="v7-body">The real Dre’s, straight off the camera roll. Scroll to flick through the pile; tap a photo to see it big.</p><span className="pile-count" aria-hidden="true"><i>1</i> / {photos.length}</span></div>
    <div className="pile">{photos.map((p, i) => <button type="button" className="pile-card" key={p.src} style={{ '--r': `${[-6, 4, -3, 7, -2][i]}deg`, zIndex: photos.length - i }} onClick={() => setOverlay({ type: 'photo', data: p })} aria-label={`Enlarge photo: ${p.caption}`}><img src={p.src} alt={p.alt} loading="lazy" /><span>{p.caption}</span></button>)}</div>
  </section>;
}

const credits = [
  ['THE MAN AT THE GRIDDLE', 'ANDRE DRAGWIDGE', brand.instagram],
  ['THE CRITIC', 'KOLKATA DELITES', 'https://www.instagram.com/reel/DTrp92mjLM1/'],
  ['THE CROWD', 'STRONGEST EATER', 'https://www.instagram.com/reel/DdiaI58BKGK/'],
  ['THE TASTE TEST', 'A YOUTUBE FOOD REVIEWER', 'https://www.youtube.com/shorts/7_I9hhHw4fY'],
  ['THE FIRST SPOTLIGHT', 'LIFESTYLE ASIA, 2020', 'https://www.lifestyleasia.com/ind/dining/food/10-best-home-chefs-in-kolkata/'],
  ['ITSELF', 'THE SMASHBURG', null],
  ['THE CITY', 'KOLKATA', null],
];
function CreditsRoll() {
  const root = useRef(null);
  useGsap(root, () => {
    gsap.fromTo('.credits-roll', { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.credits-you', { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '.credits-you', start: 'top 85%', once: true } });
  });
  return <section className="credits" ref={root} aria-labelledby="credits-title">
    <h2 className="credits-head" id="credits-title">STARRING</h2>
    <div className="credits-roll">{credits.map(([role, name, href]) => <div className="credit" key={name}><small>{role}</small>{href ? <a href={href} {...external}>{name}</a> : <strong>{name}</strong>}</div>)}</div>
    <div className="credits-you"><small>AND INTRODUCING</small><strong>YOU.</strong><p>Your first bite could be the next food story. Post it, tag <a href={brand.instagram} {...external}>@d.r.es</a>, and we might share it.</p></div>
  </section>;
}

export default function FoodStoriesPageV7() {
  return <div className="route-page food-stories-page stories-v7">
    <CinemaHero />
    <FilmStrip />
    <BehindTheShot />
    <CreditsRoll />
    <NextStop to="/visit" kicker="NEXT STOP · FIND DRE’S" title="COME SEE IT FOR YOURSELF" image="/assets/v7/scooter.webp" />
  </div>;
}
