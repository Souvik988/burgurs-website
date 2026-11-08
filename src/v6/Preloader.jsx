import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { markSiteReady } from './ready';
import './preloader.css';

// Bottom → top: each paper-cut layer drops onto the stack.
const layers = ['bun-bottom', 'patty', 'cheese', 'tomato', 'lettuce', 'bun-top'];
const messages = ['FIRING UP THE GRIDDLE…', 'SMASHING THE PATTY…', 'MELTING THE CHEESE…', 'TOASTING THE DRE’S BUN…', 'STACKING IT TALL…', 'ALMOST. DON’T LICK THE SCREEN.'];
const critical = ['/assets/menu/edited/smashburg.webp', '/assets/kolkata/burger-eyes-v4.webp', ...layers.map(l => `/assets/v6/layers/${l}.webp`)];

function preload(src) {
  return new Promise(resolve => { const img = new Image(); img.onload = img.onerror = resolve; img.src = src; });
}

export default function Preloader({ motion }) {
  const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [visible, setVisible] = useState(() => motion && !reduced);
  const root = useRef(null);
  const timeline = useRef(null);

  useEffect(() => {
    if (!visible) { markSiteReady(); return; }
    let seen = false;
    try { seen = !!sessionStorage.getItem('dres-loader-seen'); sessionStorage.setItem('dres-loader-seen', '1'); } catch { /* optional */ }
    const speed = seen ? 1.6 : 1; // returning visitors get a quicker stack
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let alive = true;
    const progress = { real: 0, shown: 0 };
    let loaded = 0;
    const assets = Promise.all([...critical.map(src => preload(src).then(() => { loaded++; progress.real = loaded / (critical.length + 1); })), document.fonts?.ready]).then(() => { progress.real = 1; });
    const timeout = new Promise(r => setTimeout(r, 6000));

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const bar = q('.pl-bar-fill')[0], pct = q('.pl-percent')[0];
      // Progress shown = min(real loading, animation clock) so it never lies or stalls at 100.
      const clock = { t: 0 };
      gsap.to(clock, { t: 1, duration: 2.75 / speed, ease: 'power1.inOut' });
      const tick = () => {
        const target = Math.min(progress.real, clock.t);
        progress.shown += (target - progress.shown) * .18;
        if (bar) bar.style.transform = `scaleX(${progress.shown})`;
        if (pct) pct.textContent = String(Math.round(progress.shown * 100)).padStart(2, '0');
      };
      gsap.ticker.add(tick);

      const msgs = q('.pl-msg');
      gsap.set(msgs, { yPercent: 110, opacity: 0 });
      const msgTl = gsap.timeline({ repeat: -1 });
      msgs.forEach(m => msgTl.to(m, { yPercent: 0, opacity: 1, duration: .28, ease: 'back.out(2)' }).to(m, { yPercent: -110, opacity: 0, duration: .22, ease: 'power2.in' }, '+=.42'));
      msgTl.timeScale(speed);

      const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
      timeline.current = tl;
      tl.from(q('.pl-plate'), { scaleX: 0, duration: .35, ease: 'back.out(2)' });
      q('.pl-layer').forEach((el, i) => {
        tl.fromTo(el, { y: () => -window.innerHeight * .75, rotation: gsap.utils.random(-28, 28), opacity: 1 },
          { y: 0, rotation: gsap.utils.random(-3, 3), duration: .42, ease: 'power3.in' }, .2 + i * .26)
          .to(q('.pl-stack'), { scaleY: .9, scaleX: 1.05, duration: .08, yoyo: true, repeat: 1, ease: 'power1.out', transformOrigin: '50% 100%' }, '>-0.02')
          .fromTo(q(`.pl-crumb-${i % 3}`), { scale: 0, opacity: 1, y: 0 }, { scale: 1, y: -40, opacity: 0, duration: .5, ease: 'power2.out' }, '<');
      });
      // Finished stack: a happy little hop, then the doodles pop around it.
      tl.to(q('.pl-stack'), { y: -26, duration: .2, ease: 'power2.out' })
        .to(q('.pl-stack'), { y: 0, duration: .45, ease: 'bounce.out' })
        .fromTo(q('.pl-spark'), { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: .45, stagger: .06, ease: 'back.out(2.4)' }, '<');
      tl.timeScale(speed);

      Promise.all([new Promise(r => tl.eventCallback('onComplete', r)), Promise.race([assets, timeout])]).then(() => {
        if (!alive) return;
        progress.real = 1; clock.t = 1;
        gsap.delayedCall(.1, () => exit());
      });

      function exit() {
        if (!alive) return;
        gsap.ticker.remove(tick);
        msgTl.kill();
        const out = gsap.timeline({ onComplete: () => { if (alive) setVisible(false); } });
        // Red leaves first, then mustard, then maroon, so each curved band is seen in turn.
        const bands = [q('.pl-band-1')[0], q('.pl-band-2')[0], q('.pl-band-3')[0]];
        out.to(q('.pl-stack'), { y: -window.innerHeight * .9, rotation: 10, duration: .55, ease: 'back.in(1.6)' })
          .to([q('.pl-messages')[0], q('.pl-foot')[0], q('.pl-plate')[0], q('.pl-bar')[0], q('.pl-skip')[0], q('.pl-dot'), q('.pl-crumb'), q('.pl-spark')], { opacity: 0, duration: .2 }, '<')
          .to(bands, { yPercent: -100, duration: .9, stagger: .16, ease: 'power3.inOut' }, '-=.3')
          .add(() => markSiteReady(), '-=.6');
      }
      root.current._skip = () => { tl.progress(1); exit(); };
    }, root);

    return () => {
      alive = false;
      ctx.revert();
      document.body.style.overflow = oldOverflow;
      markSiteReady();
    };
  }, [visible]);

  if (!visible) return null;
  return <div className="preloader" ref={root} role="status" aria-label="Loading Dre’s Burgers">
    <div className="pl-band pl-band-3" /><div className="pl-band pl-band-2" /><div className="pl-band pl-band-1" />
    <div className="pl-center" aria-hidden="true">
      <div className="pl-stage">
        {[0, 1, 2, 3, 4, 5].map(i => <i key={i} className={`pl-dot pl-dot-${i}`} />)}
        <img className="pl-spark pl-spark-a" src="/assets/v6/doodles/spark.webp" alt="" />
        <img className="pl-spark pl-spark-b" src="/assets/v6/doodles/heart.webp" alt="" />
        <img className="pl-spark pl-spark-c" src="/assets/v6/doodles/bolt.webp" alt="" />
        <div className="pl-stack">
          {layers.map((l, i) => <img key={l} className={`pl-layer pl-${l}`} src={`/assets/v6/layers/${l}.webp`} alt="" style={{ zIndex: i + 1 }} />)}
        </div>
        {[0, 1, 2].map(i => <i key={i} className={`pl-crumb pl-crumb-${i}`} />)}
        <span className="pl-plate" />
      </div>
      <div className="pl-messages">{messages.map(m => <span className="pl-msg" key={m}>{m}</span>)}</div>
    </div>
    <div className="pl-foot" aria-hidden="true">
      <span className="pl-brand">dre’s</span>
      <span className="pl-count"><span className="pl-percent">00</span>%</span>
    </div>
    <div className="pl-bar" aria-hidden="true"><span className="pl-bar-fill" /></div>
    <button className="pl-skip" onClick={() => root.current?._skip?.()}>SKIP THE WAIT ↗</button>
  </div>;
}
