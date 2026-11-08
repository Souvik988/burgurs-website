import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { campaign } from '../data/kolkata';
import { Sketch, Sticker, Wave } from './Sketch';
import { requestScrollRefresh } from '../motion/refresh';

gsap.registerPlugin(ScrollTrigger);

export function FirstBiteJourney({ motion, onPhoto }) {
  const root = useRef(null);
  const track = useRef(null);
  const tram = useRef(null);
  const route = useRef(null);
  const trigger = useRef(null);
  const [active, setActive] = useState(0);
  const last = useRef(0);
  const animated = motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!animated) return;
    let alive = true;
    const cards = [...track.current.children];
    const stage = root.current.querySelector('.bite-journey-stage');
    let geometry = { travel: 0, center: 0, origin: 0, cards: [], route: [] };
    const measure = () => {
      // A scroll refresh can land after this page has unmounted (e.g. mid page-transition).
      if (!alive || !track.current || !stage.isConnected || !route.current) return;
      const lastCard = cards.at(-1);
      const origin = track.current.offsetLeft;
      const center = stage.clientWidth / 2;
      const path = route.current;
      const length = path.getTotalLength();
      const points = Array.from({ length: 161 }, (_, i) => {
        const point = path.getPointAtLength(length * i / 160);
        return { x: point.x / 1440 * stage.clientWidth, y: point.y / 1000 * stage.clientHeight };
      });
      geometry = { travel: Math.max(0, lastCard.offsetLeft + lastCard.offsetWidth / 2 + origin - center), origin, center, cards: cards.map(card => ({ center: card.offsetLeft + card.offsetWidth / 2, width: card.offsetWidth })), route: points };
    };
    const paint = progress => {
      if (!alive) return;
      const offset = -geometry.travel * progress;
      cards.forEach((card, i) => {
        const metrics = geometry.cards[i];
        if (!metrics) return;
        const distance = Math.max(-1.3, Math.min(1.3, (geometry.origin + metrics.center + offset - geometry.center) / (metrics.width * 1.5)));
        const edge = Math.min(1, Math.abs(distance));
        card.style.transform = `translate3d(0, ${Math.sin(distance * 1.5) * 18}px, 0) rotate(${campaign[i].rotation * (.45 + edge * .55)}deg)`;
      });
      const sample = progress * 160;
      const indexAt = Math.min(159, Math.floor(sample));
      const a = geometry.route[indexAt];
      const b = geometry.route[indexAt + 1];
      if (a && b && tram.current) {
        const fraction = sample - indexAt;
        const angle = Math.max(-14, Math.min(14, Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI));
        tram.current.style.transform = `translate3d(${a.x + (b.x - a.x) * fraction}px, ${a.y + (b.y - a.y) * fraction}px, 0) translate(-50%, -65%) rotate(${angle}deg)`;
      }
      const index = Math.round(progress * (campaign.length - 1));
      if (index !== last.current) { last.current = index;setActive(index); }
    };
    measure();
    const ctx = gsap.context(() => {
      const tween = gsap.to(track.current, {
        x: () => -geometry.travel, ease: 'none', force3D: true,
        onUpdate() { paint(this.progress()); },
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: .25, invalidateOnRefresh: true, onRefresh: self => { measure();paint(self.progress); } },
      });
      trigger.current = tween.scrollTrigger;
    }, root);
    document.fonts.ready.then(() => { if (alive) requestScrollRefresh(); });
    return () => { alive = false;ctx.revert();cards.forEach(card => { card.style.transform = '';card.style.opacity = ''; });trigger.current = null; };
  }, [animated]);

  const go = index => {
    const next = Math.max(0, Math.min(campaign.length - 1, index));
    if (animated && trigger.current) {
      const t = trigger.current;
      window.scrollTo({ top: t.start + (t.end - t.start) * next / (campaign.length - 1), behavior: 'smooth' });
    } else {
      const card = track.current.children[next];
      track.current.scrollTo({ left: card.offsetLeft - (track.current.clientWidth - card.clientWidth) / 2, behavior: motion ? 'smooth' : 'instant' });
      setActive(next);
    }
  };

  return <section className={`bite-journey kolkata-journey tram-journey ${animated ? '' : 'journey-static'}`} ref={root} aria-label="Seven Kolkata first-bite stories">
    <div className="bite-journey-stage">
      <img className="city-panorama" src="/assets/kolkata/kolkata-panorama-v2.webp" alt="" loading="lazy" width="1536" height="1024" />
      <svg className="city-route" viewBox="0 0 1440 1000" preserveAspectRatio="none" aria-hidden="true"><path ref={route} d="M1500 220 C1120 100 800 190 900 310 S1390 470 1200 390 S650 330 400 430 S40 470 80 660 S700 930 1530 835" /></svg>
      <img className="city-tram" ref={tram} src="/assets/kolkata/kolkata-tram-sticker-v2.webp" alt="" width="230" height="170" loading="lazy" />
      <div className="bite-journey-heading"><Sticker>SEVEN MOODS. ONE CITY.</Sticker><h2 className="scene-title">KOLKATA.<br />TAKE A BITE.</h2><p>From book-stall afternoons to rain-soaked adda.<br /> There’s always room for a good burger.</p></div>
      <div className="bite-journey-track" ref={track}>{campaign.map((photo, i) => <figure className={`bite-slide bite-slide-${i}`} key={photo.src}>
        <button onClick={() => onPhoto(photo)} aria-label={`Enlarge ${photo.caption}`}>
          <span className="campaign-window"><img src={photo.src} decoding="async" alt={photo.alt} loading="lazy" width="900" height="1200" /></span>
          <span className="bite-caption"><strong>{photo.caption}</strong><span>{photo.subtitle}</span></span>
        </button>
        <img className="campaign-doodle-frame" src="/assets/kolkata/kolkata-photo-frame-v2.webp" alt="" width="1088" height="1456" loading="lazy" />
        <span className="campaign-number" aria-hidden="true">0{i + 1}</span>
      </figure>)}</div>
      <div className="journey-controls"><button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous food story">←</button><div className="journey-dots" role="group" aria-label="Choose a food story">{campaign.map((photo, i) => <button key={photo.src} onClick={() => go(i)} className={i === active ? 'active' : ''} aria-current={i === active ? 'step' : undefined} aria-label={photo.caption} />)}</div><button onClick={() => go(active + 1)} disabled={active === 6} aria-label="Next food story">→</button><span className="journey-counter" aria-live="polite">0{active + 1} / 07</span></div>
      <span className="campaign-disclosure">Kolkata campaign · AI-created scenes with fictional people</span><Wave color="var(--beige)" />
    </div>
  </section>;
}
