import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brand } from '../../data/brand';
import { external } from '../../site';
import { motionAllowed } from '../../v6/Motion';
import { whenSiteReady } from '../../v6/ready';
import { faq } from '../seo';
import { DoodleBg, NextStop, Ticker, Words, useGsap } from '../kit';
import './visit.css';

gsap.registerPlugin(ScrollTrigger);
const mapEmbed = 'https://www.google.com/maps?q=22.539729,88.363142&z=16&output=embed';

function VisitHero() {
  const root = useRef(null);
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(brand.address); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { setCopied(false); } };
  useGsap(root, () => {
    const intro = gsap.timeline({ paused: true });
    intro.fromTo('.vh-scooter', { xPercent: -260, rotation: -6 }, { xPercent: 0, rotation: 0, duration: 1.2, ease: 'power4.out' })
      .to('.vh-scooter', { rotation: 3, yoyo: true, repeat: 1, duration: .15 }, '>-0.05')
      .fromTo('.vh-ticket', { y: -320, rotation: -25, opacity: 0 }, { y: 0, rotation: -3, opacity: 1, duration: 1.1, ease: 'bounce.out' }, .35);
    whenSiteReady(() => intro.play());
    gsap.to('.vh-scooter-wrap', { y: -8, duration: .18, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } });
    tl.to('.vh-scooter', { xPercent: 260, ease: 'power1.in' }, 0).to('.vh-title', { yPercent: -30, ease: 'none' }, 0).to('.vh-ticket', { y: 120, rotation: 6, ease: 'none' }, 0);
  });
  return <section className="visit-hero-v7 page-hero" ref={root}>
    <DoodleBg tone="red" />
    <div className="vh-copy"><span className="v7-kicker">FOLLOW YOUR NOSE. OR THE MAP.</span><Words as="h1" className="vh-title">{'YOUR NEXT\nBURGER STOP.'}</Words></div>
    <div className="vh-scooter-wrap" aria-hidden="true"><img className="vh-scooter" src="/assets/v7/scooter.webp" alt="" width="1420" height="1001" /></div>
    <article className="vh-ticket" aria-label="Dre’s Burgers address">
      <span className="vh-ticket-top">ADMIT ONE · HUNGRY PERSON</span>
      <strong>DRE’S BURGERS</strong>
      <p className="street-address">{brand.address}</p>
      <div className="vh-ticket-actions">
        <a className="button button-primary" href={brand.maps} {...external}><span className="button-text">GET DIRECTIONS</span><span className="button-arrow" aria-hidden="true">↗</span></a>
        <button type="button" className="copy-address" onClick={copy}>{copied ? 'ADDRESS COPIED ✓' : 'COPY ADDRESS'}</button>
      </div>
      <a className="vh-phone" href={brand.phoneHref}>{brand.phone} · CALL FOR TODAY’S TIMINGS</a>
    </article>
  </section>;
}

const steps = [
  ['HEAD FOR BECK BAGAN', 'The Park Circus side of Ballygunge, in the middle of the city.'],
  ['FIND USTAD ENAYET KHAN AVENUE', 'Lower Range. Any cabbie will know it.'],
  ['LOOK FOR NUMBER 102', 'A small hatch with DRE’S on it. Blink and you’ll miss it. Don’t blink.'],
  ['FOLLOW THE SIZZLE', 'If you can hear a patty being smashed, you’re here.'],
];
const STOPS = [.1, .36, .62, .86]; // how far along the road each direction card appears
// Desktop road, drawn in a 1200x600 box and scaled uniformly to whatever the stage measures.
const DESK = [[60, 520], [260, 520, 220, 330, 420, 340], [640, 520, 640, 520, 760, 380], [900, 120, 900, 120, 1120, 200]];

/* The road, the taxi and the cards are all derived from one measurement of the stage, so the taxi
   can never drift off the line: every position below is computed from the same points. */
function Route() {
  const root = useRef(null);
  useGsap(root, () => {
    const stage = root.current.querySelector('.route-stage');
    const base = stage.querySelector('.route-line');
    const drawn = stage.querySelector('.route-drawn');
    const taxi = stage.querySelector('.route-taxi');
    const pin = stage.querySelector('.route-dres');
    const cards = gsap.utils.toArray(stage.querySelectorAll('.route-step'));
    let pts = [], len = 1, mobile = false, W = 0, H = 0;
    const shown = cards.map(() => false);

    function buildPath() {
      let d;
      if (mobile) {
        // A wavy road down the left edge; cards sit to its right.
        const x0 = 34, n = 48;
        d = Array.from({ length: n + 1 }, (_, i) => { const y = 14 + (H - 70) * i / n; return `${i ? 'L' : 'M'}${(x0 + Math.sin(i * .62) * 11).toFixed(1)} ${y.toFixed(1)}`; }).join(' ');
      } else {
        const s = Math.min(W / 1200, H / 600), ox = (W - 1200 * s) / 2, oy = (H - 600 * s) / 2;
        const T = (x, y) => `${(ox + x * s).toFixed(1)} ${(oy + y * s).toFixed(1)}`;
        d = `M${T(...DESK[0])}`;
        for (const seg of DESK.slice(1)) d += ` C${T(seg[0], seg[1])}, ${T(seg[2], seg[3])}, ${T(seg[4], seg[5])}`;
      }
      base.setAttribute('d', d); drawn.setAttribute('d', d);
      len = base.getTotalLength();
      pts = Array.from({ length: 241 }, (_, i) => { const p = base.getPointAtLength(len * i / 240); return { x: p.x, y: p.y }; });
    }
    const at = t => pts[Math.round(gsap.utils.clamp(0, 1, t) * 240)];
    // Distance from a point to the road, used to keep cards off the line.
    const clearance = (x, y, w, h) => { let best = 1e9; for (let i = 0; i < pts.length; i += 3) { const p = pts[i], dx = Math.max(x - p.x, 0, p.x - (x + w)), dy = Math.max(y - p.y, 0, p.y - (y + h)); best = Math.min(best, Math.hypot(dx, dy)); } return best; };

    function layout() {
      const iw = innerWidth;
      mobile = iw < 800;
      W = stage.clientWidth; H = stage.clientHeight;
      buildPath();
      const placed = [];
      cards.forEach((c, i) => {
        const w = c.offsetWidth, h = c.offsetHeight, p = at(STOPS[i]);
        let x, y;
        if (mobile) { x = 72; y = gsap.utils.clamp(0, H - h, p.y - h / 2); }
        else {
          // Search the whole stage near the stop: keep the spot furthest from the road that does not
          // collide with a card already placed, preferring spots close to where the taxi passes.
          let best = -1e9;
          for (let ty = 8; ty <= H - h - 8; ty += 24) for (let tx = 8; tx <= W - w - 8; tx += 32) {
            if (placed.some(q => tx < q.x + q.w + 14 && tx + w + 14 > q.x && ty < q.y + q.h + 14 && ty + h + 14 > q.y)) continue;
            const near = Math.hypot(tx + w / 2 - p.x, ty + h / 2 - p.y);
            if (near > Math.max(w, 280) * 1.25) continue;
            const score = Math.min(clearance(tx, ty, w, h), 46) * 3 - near * .12;
            if (score > best) { best = score; x = tx; y = ty; }
          }
          if (x === undefined) { x = gsap.utils.clamp(0, W - w, p.x - w / 2); y = gsap.utils.clamp(0, H - h, p.y - h - 30); }
          placed.push({ x, y, w, h });
        }
        gsap.set(c, { x, y, rotation: mobile ? 0 : [-3, 2, -2, 3][i] });
      });
      const end = pts[240], pw = pin.offsetWidth, ph = pin.offsetHeight;
      gsap.set(pin, { x: end.x - pw / 2, y: end.y - ph + (mobile ? 6 : 14) });
      place(lastP);
    }

    let lastP = 0;
    function place(t) {
      lastP = t;
      const p = at(t), a = at(t - .01), b = at(t + .01), tw = taxi.offsetWidth;
      gsap.set(taxi, { x: p.x - tw / 2, y: p.y - tw / 2 });
      taxi.firstElementChild.style.rotate = mobile ? '' : `${gsap.utils.clamp(-22, 22, Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI * .6).toFixed(1)}deg`;
      drawn.style.strokeDasharray = `${(t * len).toFixed(1)} ${len + 10}`;
      cards.forEach((c, i) => {
        const on = t >= STOPS[i] - .045;
        if (on !== shown[i]) {
          shown[i] = on;
          gsap.to(c, on ? { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(2.2)', overwrite: 'auto' } : { autoAlpha: 0, scale: .6, duration: .2, overwrite: 'auto' });
        }
      });
      const arrived = t > .975;
      if (arrived !== pin._on) {
        pin._on = arrived;
        gsap.to(pin, arrived ? { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(3)', overwrite: 'auto' } : { autoAlpha: 0, scale: .5, duration: .2, overwrite: 'auto' });
        // The taxi parks (shrinks away) as the pin pops, and returns if you scroll back up.
        gsap.to(taxi.firstElementChild, arrived ? { scale: 0, duration: .25, ease: 'power2.in', overwrite: 'auto' } : { scale: 1, duration: .3, ease: 'back.out(2)', overwrite: 'auto' });
      }
    }

    gsap.set(cards, { autoAlpha: 0, scale: .6 });
    gsap.set(pin, { autoAlpha: 0, scale: .5, transformOrigin: '50% 100%' });
    pin._on = false;
    layout();
    ScrollTrigger.create({
      trigger: root.current, start: 'top top', end: () => `+=${Math.round(innerHeight * (innerWidth < 800 ? 1.5 : 1.8))}`,
      pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      onRefreshInit: () => { layout(); },
      onUpdate: self => place(self.progress),
    });
    const ro = new ResizeObserver(() => { if (Math.abs(stage.clientWidth - W) > 1 || Math.abs(stage.clientHeight - H) > 1) layout(); });
    ro.observe(stage);
    return () => ro.disconnect();
  });
  return <section className="visit-route" ref={root} aria-labelledby="route-title">
    <DoodleBg tone="mustard" speed={50} />
    <div className="route-head"><span className="v7-kicker">THE BURGER RUN</span><h2 id="route-title" className="route-title">HOW TO FIND US.</h2></div>
    <div className="route-stage">
      <svg className="route-svg" aria-hidden="true">
        <path className="route-line" fill="none" stroke="var(--red)" strokeWidth="6" strokeLinecap="round" strokeDasharray="1 16" opacity=".5" />
        <path className="route-drawn" fill="none" stroke="var(--red)" strokeWidth="10" strokeLinecap="round" />
      </svg>
      <span className="route-taxi" aria-hidden="true"><img src="/assets/v7/icons/taxi.webp" alt="" /></span>
      <ol className="route-steps">{steps.map(([t, d], i) => <li className={`route-step route-step-${i}`} key={t}><span>0{i + 1}</span><strong>{t}</strong><p>{d}</p></li>)}</ol>
      <span className="route-dres" aria-hidden="true"><img src="/assets/v8/stickers/pin.webp" alt="" /><b>DRE’S!</b></span>
    </div>
  </section>;
}

function LiveMap() {
  const [on, setOn] = useState(false);
  return <section className="visit-map v7-section">
    <div className="map-copy"><span className="v7-kicker">THE REAL MAP</span><Words className="map-title">{'A SMALL SPOT.\nWORTH FINDING.'}</Words><p className="v7-body">Load the live map to see us on the street, or jump straight into directions on your phone.</p><a className="button button-outline" href={brand.maps} {...external}><span className="button-text">OPEN IN GOOGLE MAPS</span><span className="button-arrow" aria-hidden="true">↗</span></a></div>
    <div className="map-frame">{on ? <iframe title="Map showing Dre’s Burgers in Beck Bagan, Kolkata" src={mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <button type="button" className="map-poster" onClick={() => setOn(true)}><img src="/assets/v7/icons/taxi.webp" alt="" /><strong>LOAD THE LIVE MAP</strong><small>Loads Google Maps, which may set cookies.</small></button>}</div>
  </section>;
}

const ways = [
  { title: 'ORDER DIRECT', text: 'Build your bag here and save 10% at launch.', cta: 'BUILD MY BAG', to: '/menu', doodle: 'burger', tone: 'red' },
  { title: 'ZOMATO', text: 'Delivery to your door, tracked all the way.', cta: 'ORDER ON ZOMATO', href: brand.order, doodle: 'taxi', tone: 'mustard' },
  { title: 'GIVE US A CALL', text: 'Ask what’s hot today, or check the timings.', cta: brand.phone, href: brand.phoneHref, doodle: 'heart', tone: 'white' },
  { title: 'WALK UP', text: 'Come to the hatch. Order. Smile. Eat with both hands.', cta: 'GET DIRECTIONS', href: brand.maps, doodle: 'spark', tone: 'beige' },
];
function Ways() {
  const root = useRef(null);
  useGsap(root, () => {
    gsap.fromTo('.way-card', { y: 160, rotation: i => [-14, 10, -8, 12][i], opacity: 0 }, { y: 0, rotation: i => [-2, 1.5, -1, 2][i], opacity: 1, duration: 1, stagger: .12, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.ways-grid', start: 'top 82%', once: true } });
  });
  return <section className="visit-ways v7-section" ref={root} aria-labelledby="ways-title">
    <DoodleBg tone="cream" />
    <span className="v7-kicker">SOFA PLANS? WE GET IT.</span>
    <Words className="ways-title" id="ways-title">{'FOUR WAYS\nTO GET A DRE’S.'}</Words>
    <div className="ways-grid">{ways.map(w => { const inner = <><img src={`/assets/v7/icons/${w.doodle}.webp`} alt="" /><h3>{w.title}</h3><p>{w.text}</p><span className="way-cta">{w.cta} ↗</span></>; return w.to ? <Link key={w.title} to={w.to} className={`way-card way-${w.tone}`}>{inner}</Link> : <a key={w.title} href={w.href} className={`way-card way-${w.tone}`} {...(w.href.startsWith('http') ? external : {})}>{inner}</a>; })}</div>
  </section>;
}

function Faq() {
  const root = useRef(null);
  const [open, setOpen] = useState(0);
  const toggle = i => {
    const next = open === i ? -1 : i;
    if (motionAllowed()) {
      const panels = root.current.querySelectorAll('.faq-a');
      if (open >= 0) gsap.to(panels[open], { height: 0, duration: .35, ease: 'power2.inOut' });
      if (next >= 0) gsap.fromTo(panels[next], { height: 0 }, { height: 'auto', duration: .45, ease: 'power3.out' });
    }
    setOpen(next);
  };
  return <section className="visit-faq v7-section" ref={root} aria-labelledby="faq-title">
    <span className="v7-kicker">GOOD QUESTIONS</span>
    <Words className="faq-title" id="faq-title">{'BEFORE YOU\nHEAD OVER.'}</Words>
    <div className="faq-list">{faq.map((f, i) => <div className={`faq-item ${open === i ? 'is-open' : ''}`} key={f.q}>
      <h3><button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => toggle(i)}><span>{f.q}</span><i aria-hidden="true">+</i></button></h3>
      <div className="faq-a" id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} style={{ height: open === i ? 'auto' : 0 }}><p>{f.a}</p></div>
    </div>)}</div>
  </section>;
}

export default function VisitPageV7() {
  return <div className="route-page visit-page visit-v7">
    <VisitHero />
    <Ticker items={['BECK BAGAN', 'KOLKATA', 'TAKEAWAY', 'DELIVERY', 'COME HUNGRY']} />
    <Route />
    <LiveMap />
    <Ways />
    <Faq />
    <NextStop to="/menu" kicker="NEXT STOP · THE MENU" title="PICK YOUR BURGER" image="/assets/v7/emblems/beef.webp" tone="mustard" />
  </div>;
}
