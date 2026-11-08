import React, { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { brand, menu } from '../../data/brand';
import { useSite, money, external, Button, MenuCard } from '../../site';
import { AddToBag, DirectOffer } from '../../commerce/CartPages';
import { Sketch } from '../../components/Sketch';
import { motionAllowed } from '../../v6/Motion';
import { whenSiteReady } from '../../v6/ready';
import { DoodleBg, NextStop, Ticker, Words, useGsap, useHorizontal } from '../kit';
import './menu.css';

const lanes = [
  { id: 'Beef', art: 'beef', title: 'THE BEEF\nDEPARTMENT.', line: 'Smashed thin on the flat-top for those lacy, crispy edges.' },
  { id: 'Chicken', art: 'chicken', title: 'CRISPY.\nJUICY. CHICKEN.', line: 'Real fillets, a proper crunch, and sauces that drip a little.' },
  { id: 'Veggie', art: 'veggie', title: 'PLANTS\nCAN PARTY.', line: 'A herbed potato patty with fresh, crunchy company.' },
  { id: 'Sides', art: 'sides', title: 'SIDES YOU\nWON’T SHARE.', line: 'Fries, wings and strips. Order extra. Trust us.' },
];
const fame = ['smashburg', 'hot-chick', 'black-bear', 'stacked-chicken', 'mini-smash'];
const fameNotes = { smashburg: 'The one that started the smash club.', 'hot-chick': 'Crispy fillet. A little heat. Big grin.', 'black-bear': 'For the properly, properly hungry.', 'stacked-chicken': 'Stacked tall. Eat it with both hands.', 'mini-smash': 'Small burger. Big personality.' };
const byId = id => menu.find(m => m.id === id);
const priceFrom = cat => Math.min(...menu.filter(m => m.category === cat).map(m => m.price));

function MenuHero({ onPick }) {
  const root = useRef(null);
  useGsap(root, () => {
    const cards = gsap.utils.toArray('.mh-lane');
    const intro = gsap.timeline({ paused: true });
    intro.fromTo(cards, { y: () => -innerHeight, rotation: () => gsap.utils.random(-40, 40) }, { y: 0, rotation: (i) => [-6, 4, -3, 6][i], duration: 1.1, stagger: .12, ease: 'bounce.out' })
      .fromTo('.mh-sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, .4);
    whenSiteReady(() => intro.play());
    gsap.to('.mh-lane-art', { yPercent: i => [-18, -32, -12, -26][i], rotation: i => [-8, 10, -6, 12][i], ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.to('.mh-title', { yPercent: 25, opacity: .2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } });
  });
  const hop = e => { if (!motionAllowed()) return; gsap.timeline().to(e.currentTarget.querySelector('.mh-lane-art'), { y: -34, rotation: '+=14', duration: .22, ease: 'power2.out', overwrite: 'auto' }).to(e.currentTarget.querySelector('.mh-lane-art'), { y: 0, rotation: 0, duration: .7, ease: 'bounce.out' }); };
  return <section className="menu-hero-v7 page-hero" ref={root}>
    <DoodleBg tone="red" />
    <span className="v7-kicker">COME HUNGRY. LEAVE HAPPY.</span>
    <Words as="h1" className="mh-title">{'DECISIONS,\nDELICIOUS DECISIONS.'}</Words>
    <p className="mh-sub v7-body">Sixteen ways to be happy, smashed and fried in a little kiosk in Beck Bagan. Pick a lane, or let us pick for you.</p>
    <div className="mh-lanes" role="list" aria-label="Jump to a menu category">
      {lanes.map(l => <button role="listitem" type="button" key={l.id} className={`mh-lane mh-lane-${l.art}`} onClick={() => onPick(l.id)} onPointerEnter={hop}>
        <img className="mh-lane-art" src={`/assets/v7/emblems/${l.art}.webp`} alt="" width="380" height="420" />
        <strong>{l.id.toUpperCase()}</strong>
        <small>{(n => `${n} ${n === 1 ? 'PICK' : 'PICKS'}`)(menu.filter(m => m.category === l.id).length)} · FROM {money(priceFrom(l.id))}</small>
      </button>)}
    </div>
  </section>;
}

const questions = [
  { key: 'hunger', q: 'HOW HUNGRY ARE WE TALKING?', options: [['little', 'A LITTLE PECKISH'], ['proper', 'PROPER HUNGRY'], ['starving', 'COULD EAT THE KIOSK']] },
  { key: 'protein', q: 'PICK YOUR PROTEIN.', options: [['Beef', 'BEEF'], ['Chicken', 'CHICKEN'], ['Veggie', 'NO MEAT TODAY']] },
  { key: 'heat', q: 'HOW MUCH JHAAL?', options: [['mild', 'KEEP IT MILD'], ['hot', 'BRING THE HEAT']] },
];
function pick(a) {
  const pool = menu.filter(m => m.category === a.protein);
  const target = { little: 170, proper: 320, starving: 400 }[a.hunger];
  const score = m => -Math.abs(m.price - target) / 50 + (a.heat === 'hot' ? (m.spicy || /hot/i.test(m.name) ? 3 : 0) : (m.spicy ? -2 : 0)) + (m.image ? 1 : 0);
  return [...pool].sort((x, y) => score(y) - score(x))[0] || byId('herbed-potato');
}

function CravingFinder() {
  const root = useRef(null);
  const [answers, setAnswers] = useState({});
  const step = Object.keys(answers).length;
  const result = step >= questions.length ? pick(answers) : null;
  const choose = (key, value, e) => {
    const go = () => setAnswers(a => ({ ...a, [key]: value }));
    if (!motionAllowed()) return go();
    gsap.timeline({ onComplete: go }).to(e.currentTarget, { scale: .9, duration: .08 }).to(e.currentTarget, { scale: 1.06, duration: .12 }).to(root.current.querySelector('.cf-step'), { xPercent: -8, opacity: 0, duration: .22, ease: 'power2.in' });
  };
  useGsap(root, () => {
    const stepEl = root.current.querySelector('.cf-step');
    if (stepEl) gsap.fromTo(stepEl, { xPercent: 8, opacity: 0 }, { xPercent: 0, opacity: 1, duration: .45, ease: 'power3.out' });
    const card = root.current.querySelector('.cf-result');
    if (card) {
      gsap.fromTo(card, { y: -260, rotation: -14, opacity: 0 }, { y: 0, rotation: -2, opacity: 1, duration: 1, ease: 'bounce.out' });
      root.current.querySelectorAll('.cf-confetti img').forEach((c, i) => gsap.fromTo(c, { x: 0, y: 0, scale: 0, opacity: 1 }, { x: Math.cos(i * 1.05) * gsap.utils.random(140, 260), y: Math.sin(i * 1.05) * gsap.utils.random(110, 200), rotation: gsap.utils.random(-180, 180), scale: 1, opacity: 0, duration: 1.4, ease: 'power3.out', delay: .55 }));
    }
  }, [step]);
  return <section className="craving-finder v7-section" ref={root} aria-labelledby="cf-title">
    <DoodleBg tone="mustard" />
    <div className="cf-head">
      <span className="v7-kicker">CAN’T DECIDE? WE GET IT.</span>
      <Words className="cf-title" id="cf-title">{'THE CRAVING\nFINDER.'}</Words>
      <p className="v7-body">Three taps. One burger with your name on it.</p>
      <div className="cf-dots" aria-hidden="true">{questions.map((_, i) => <i key={i} className={i < step ? 'done' : i === step ? 'now' : ''} />)}</div>
    </div>
    <div className="cf-stage" aria-live="polite">
      {!result && <div className="cf-step" key={step}>
        <span className="cf-count">0{step + 1} / 03</span>
        <h3>{questions[step].q}</h3>
        <div className="cf-options">{questions[step].options.map(([v, label]) => <button type="button" key={v} onClick={e => choose(questions[step].key, v, e)}>{label}</button>)}</div>
        {step > 0 && <button type="button" className="cf-back" onClick={() => setAnswers(a => { const n = { ...a }; delete n[questions[step - 1].key]; return n; })}>← BACK</button>}
      </div>}
      {result && <div className="cf-result-wrap">
        <div className="cf-confetti" aria-hidden="true">{['spark', 'heart', 'bolt', 'fries', 'spark', 'heart'].map((d, i) => <img key={i} src={`/assets/v7/icons/${d}.webp`} alt="" />)}</div>
        <article className="cf-result">
          <span className="cf-match">IT’S A MATCH!</span>
          {result.image ? <img src={result.image} alt={result.name} /> : <img className="cf-emblem" src={`/assets/v7/emblems/${result.category.toLowerCase()}.webp`} alt="" />}
          <h3>{result.name}</h3>
          <span className="cf-price">{money(result.price)}</span>
          <p>{result.description}</p>
          <AddToBag item={result} />
          <button type="button" className="cf-again" onClick={() => setAnswers({})}>TRY AGAIN ↺</button>
        </article>
      </div>}
    </div>
  </section>;
}

function HallOfFame() {
  const root = useRef(null);
  const bar = useRef(null);
  const { setOverlay } = useSite();
  useHorizontal(root, {
    onProgress: p => { if (bar.current) bar.current.style.transform = `scaleX(${p})`; },
    extra: tween => {
      gsap.utils.toArray(root.current.querySelectorAll('.hof-card')).forEach(card => {
        gsap.fromTo(card.querySelector('.hof-photo img'), { rotation: -14, scale: .9 }, { rotation: 3, scale: 1.28, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: card, start: 'left right', end: 'center center', scrub: true } });
        gsap.fromTo(card.querySelector('.hof-price'), { scale: 0, rotation: -60 }, { scale: 1, rotation: -8, ease: 'back.out(2.5)', scrollTrigger: { containerAnimation: tween, trigger: card, start: 'left 60%', toggleActions: 'play none none reverse' } });
      });
    },
  });
  return <section className="hall-of-fame" ref={root} aria-labelledby="hof-title">
    <DoodleBg tone="cream" />
    <div className="v7-track">
      <div className="hof-intro">
        <span className="v7-kicker">MOST ORDERED. MOST MISSED.</span>
        <Words className="hof-title" id="hof-title">{'THE HALL\nOF FAME.'}</Words>
        <p className="v7-body">Five burgers Kolkata keeps coming back for. Keep scrolling. →</p>
      </div>
      {fame.map((id, i) => { const item = byId(id); return <article className="hof-card" key={id}>
        <span className="hof-num">0{i + 1}</span>
        <button type="button" className="hof-photo" onClick={() => setOverlay({ type: 'item', data: item })} aria-label={`See details for ${item.name}`}><img src={item.image} alt={item.name} loading="lazy" /></button>
        <div className="hof-copy"><span className="hof-price">{money(item.price)}</span><h3>{item.name}</h3><p>{fameNotes[id]}</p><AddToBag item={item} /></div>
      </article>; })}
    </div>
    <div className="hof-progress" aria-hidden="true"><span ref={bar} /></div>
  </section>;
}

function Catalog({ category, setCategory }) {
  const root = useRef(null);
  const [query, setQuery] = useState('');
  const { favorites } = useSite();
  const q = query.toLowerCase().trim();
  const items = useMemo(() => menu.filter(item => (category === 'All' || (category === 'Saved' ? favorites.includes(item.id) : item.category === category)) && `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(q)), [category, q, favorites]);
  const grouped = category === 'All' && !q;
  useGsap(root, () => {
    gsap.utils.toArray(root.current.querySelectorAll('.cat-lane-art')).forEach(art => gsap.fromTo(art, { rotation: -20, y: 60, scale: .7 }, { rotation: 6, y: -20, scale: 1, ease: 'none', scrollTrigger: { trigger: art.closest('.cat-lane'), start: 'top bottom', end: 'top 30%', scrub: 1 } }));
  }, [grouped]);
  const firstRun = useRef(true);
  useGsap(root, () => {
    // The first paint is handled by the page-level scroll reveals; this only animates filter changes.
    if (firstRun.current) { firstRun.current = false; return; }
    gsap.fromTo(root.current.querySelectorAll('.menu-card'), { y: 40, opacity: 0, rotation: () => gsap.utils.random(-3, 3) }, { y: 0, opacity: 1, rotation: 0, duration: .55, stagger: .04, ease: 'power3.out' });
  }, [category, q]);
  const grid = list => <div className="catalog-grid">{list.map(item => <MenuCard item={item} key={item.id} />)}</div>;
  return <section className="menu-catalog-v7 v7-section" id="catalog" ref={root}>
    <div className="menu-toolbar menu-toolbar-v7">
      <div className="category-tabs" role="group" aria-label="Filter menu">{['All', 'Beef', 'Chicken', 'Veggie', 'Sides', 'Saved'].map(c => <button key={c} className={c === category ? 'active' : ''} aria-pressed={c === category} onClick={() => setCategory(c)}>{c === 'Saved' ? `MY CRAVINGS (${favorites.length})` : c.toUpperCase()}</button>)}</div>
      <label className="menu-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Find your kind of good…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search menu" /></label>
    </div>
    <div className="catalog-meta"><span role="status">{items.length} GOOD {items.length === 1 ? 'REASON' : 'REASONS'} TO GET HUNGRY</span><a href={brand.order} {...external}>LISTED PRICES · SOURCE MENU ON ZOMATO ↗</a></div>
    {!items.length && <div className="menu-empty"><Sketch type={category === 'Saved' ? 'heart' : 'burger'} /><h2>{category === 'Saved' ? 'YOUR NEXT CRUSH GOES HERE.' : 'NOTHING ON THE GRIDDLE YET.'}</h2><p>{category === 'Saved' ? 'Tap a heart on the menu to save a favourite.' : 'Try another search or browse the whole menu.'}</p><Button onClick={() => { setCategory('All'); setQuery(''); }}>SHOW ME EVERYTHING</Button></div>}
    {!!items.length && (grouped ? lanes.map(l => <div className="cat-lane" key={l.id} id={`lane-${l.art}`}>
      <header className="cat-lane-head"><img className="cat-lane-art" src={`/assets/v7/emblems/${l.art}.webp`} alt="" loading="lazy" /><div><Words as="h2" className="cat-lane-title">{l.title}</Words><p>{l.line}</p></div><span className="cat-lane-count">{menu.filter(m => m.category === l.id).length}</span></header>
      {grid(items.filter(m => m.category === l.id))}
    </div>) : grid(items))}
    <p className="menu-photo-note">Real Dre’s menu photos with a little creative polish; open any burger to compare with the original Zomato photo. Final prices and availability on Zomato.</p>
  </section>;
}

export default function MenuPageV7() {
  const [category, setCategory] = useState('All');
  const onPick = cat => {
    setCategory('All');
    const el = document.getElementById(`lane-${cat.toLowerCase()}`) || document.getElementById('catalog');
    el?.scrollIntoView({ behavior: motionAllowed() ? 'smooth' : 'auto', block: 'start' });
  };
  return <div className="route-page menu-page menu-v7">
    <MenuHero onPick={onPick} />
    <Ticker items={['SMASHED FRESH', 'REAL FILLETS', 'STAMPED BUNS', 'FRIES TO FIGHT OVER']} />
    <CravingFinder />
    <HallOfFame />
    <Catalog category={category} setCategory={setCategory} />
    <section className="menu-offer-v7 v7-section"><DoodleBg tone="red" /><DirectOffer /></section>
    <NextStop to="/story" kicker="NEXT STOP · OUR STORY" title="MEET THE MAN AT THE GRIDDLE" image="/assets/v6/andre-papercut.webp" tone="mustard" />
  </div>;
}
