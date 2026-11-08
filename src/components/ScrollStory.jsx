import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Art, DoodleField, Sketch, Sticker, Wave } from './Sketch';
import { brand, photos } from '../data/brand';
import './scroll-story.css';
import { campaign } from '../data/kolkata';
import { requestScrollRefresh } from '../motion/refresh';
import { whenSiteReady } from '../v6/ready';
import { GooglyEyes } from '../v6/Motion';

gsap.registerPlugin(ScrollTrigger);
const external = { target: '_blank', rel: 'noopener noreferrer' };

function SceneLink({ children = 'ORDER NOW', to, href = brand.order, outline = false }) {
  return to ? <Link className={`button ${outline ? 'button-outline' : 'button-primary'}`} to={to}>{children}<span aria-hidden="true">↗</span></Link> : <a className={`button ${outline ? 'button-outline' : 'button-primary'}`} href={href} {...external}>{children}<span aria-hidden="true">↗</span></a>;
}

function SceneTitle({ children, className = '', as: Tag = 'h2', ...props }) {
  return <Tag className={`scene-title ${className}`} {...props}>{children}</Tag>;
}

function useScene(root, motion, animate) {
  const callback = useRef(animate);
  callback.current = animate;
  useEffect(() => {
    if (!motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => callback.current(gsap, ScrollTrigger), root);
    let alive = true;
    const fonts = document.fonts.ready.then(() => { if (alive) requestScrollRefresh(); });
    const refresh = () => { if (alive) requestScrollRefresh(); };
    const images = [...root.current.querySelectorAll('img')];
    images.forEach(image => image.addEventListener('load', refresh, { once: true }));
    return () => { alive = false;images.forEach(image => image.removeEventListener('load', refresh));context.revert();void fonts; };
  }, [motion, root]);
}

export function CinemaHero({ motion }) {
  const root = useRef(null);
  useScene(root, motion, () => {
    // Entrance waits for the preloader's band sweep, then the burger drops in and lands with a squash.
    const intro = gsap.timeline({ paused: true });
    intro.fromTo('.cinema-hero-title', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.out' }, 0)
      .fromTo('.cinema-hero-product img:first-child', { y: -window.innerHeight * .9, rotation: -18, opacity: 1 }, { y: 0, rotation: 0, duration: .9, ease: 'bounce.out' }, .15)
      .fromTo('.cinema-hero-product .burger-eyes', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(3)' }, .85)
      .fromTo('.cinema-hero-wordmark', { yPercent: 60, scale: .6, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: .7, ease: 'back.out(2)' }, .55)
      .fromTo('.cinema-hero .sticker', { scale: 0, rotation: -40 }, { scale: 1, rotation: -7, duration: .5, stagger: .12, ease: 'back.out(2.5)' }, .9)
      .fromTo('.cinema-hero-note, .cinema-hero-action', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .08, ease: 'power3.out' }, 1);
    whenSiteReady(() => intro.play());
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .8 } });
    tl.to('.cinema-hero-title', { yPercent: -19, scale: .94, ease: 'none' }, 0)
      .to('.cinema-hero-product', { yPercent: 26, rotation: 8, scale: .82, ease: 'none' }, 0)
      .to('.cinema-hero-wordmark', { yPercent: -25, scale: 1.13, ease: 'none' }, 0)
      .to('.cinema-hero-note', { y: -110, ease: 'none' }, 0)
      .to('.cinema-hero-doodle', { y: -160, rotation: -35, ease: 'none' }, 0);
  });
  return <section className="cinema-hero page-hero" ref={root} aria-labelledby="cinema-title"><DoodleField /><div className="cinema-topline"><span>BECK BAGAN, KOLKATA</span><span>GOOD FOOD. NO BIG FUSS.</span></div><SceneTitle as="h1" className="cinema-hero-title" id="cinema-title">THE BURGER</SceneTitle><div className="cinema-hero-product"><img src="/assets/menu/edited/smashburg.webp" alt="Dre’s Smashburg, edited from its original Zomato menu photograph" fetchPriority="high" /><img src="/assets/kolkata/burger-eyes-v4.webp" className="burger-eyes" alt="" width="400" height="205" /></div><span className="cinema-hero-wordmark" aria-hidden="true">dre’s</span><Sticker className="cinema-sticker-left">SMASHED<br />FRESH</Sticker><Sticker className="cinema-sticker-right">BOLD<br />FLAVOUR</Sticker><Sketch type="spark" className="cinema-hero-doodle" /><div className="cinema-hero-note note-left"><p>Golden buns. Crispy edges.<br />A little mess worth making.</p></div><div className="cinema-hero-note note-right"><p>A small kitchen with a big heart.<br />Made for Kolkata’s hungry people.</p></div><div className="cinema-hero-action"><Link className="button button-primary hero-order" to="/menu"><span className="button-text">ORDER DIRECT · 10% OFF</span><span className="button-arrow" aria-hidden="true">↗</span></Link><SceneLink to="/menu" outline>FIND YOUR FAVOURITE</SceneLink></div></section>;
}

export function ClassicIntro({ motion, onPhoto }) {
  const root = useRef(null);
  useScene(root, motion, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'bottom 65%', scrub: .8 } });
    tl.fromTo('.classic-title', { y: 80, rotation: -2 }, { y: -30, rotation: 0, ease: 'none' }, 0)
      .fromTo('.classic-photo-0', { x: -100, y: 150, rotation: -15 }, { x: 0, y: -30, rotation: 5, ease: 'none' }, 0)
      .fromTo('.classic-photo-1', { y: 200, scale: .9, rotation: 10 }, { y: 0, scale: 1, rotation: -5, ease: 'none' }, 0)
      .fromTo('.classic-photo-2', { x: 100, y: 120, rotation: 20 }, { x: 0, y: -15, rotation: 8, ease: 'none' }, 0)
      .to('.classic-selfie', { y: -120, rotation: 25, ease: 'none' }, 0);
  });
  const scenes = [campaign[0], photos[0], campaign[5]];
  return <section className="classic-intro" ref={root} id="good-stuff"><DoodleField className="faint" /><div className="classic-title"><Sticker>LOVE AT FIRST BITE.</Sticker><SceneTitle>JUICY CHEESY<br />FULLY LOADED</SceneTitle><p>Little smash burgers. Big stacked favourites. Crispy chicken, a herbed potato classic,<br className="desktop-break" /> and the fries you’ll promise to share. This is Dre’s kind of good food.</p><SceneLink to="/menu">MEET THE MENU</SceneLink></div><div className="classic-photo-row">{scenes.map((photo, i) => <button className={`classic-photo classic-photo-${i}`} key={photo.src} onClick={() => onPhoto(photo)} aria-label={`Enlarge ${photo.caption}`}><img src={photo.src} alt={photo.alt} loading="eager" /></button>)}<Art name="burgerselfie.png" className="classic-selfie" /><Sketch type="arrow" className="classic-arrow" /></div><span className="classic-caption hand-note">a little messy. a lotta love.</span></section>;
}

export function FeelGoodScene({ motion }) {
  const root = useRef(null);
  useScene(root, motion, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    tl.fromTo('.feel-good-title', { y: 100 }, { y: -90, ease: 'none' }, 0)
      .fromTo('.feel-good-burger', { y: 160, scale: .88, rotation: -7 }, { y: -90, scale: 1.05, rotation: 4, ease: 'none' }, 0)
      .fromTo('.feel-good-fry', { y: 120, rotation: -35 }, { y: -180, rotation: 10, ease: 'none' }, 0)
      .fromTo('.feel-good-mascot', { y: 50, rotation: 35 }, { y: -180, rotation: -15, ease: 'none' }, 0)
;
  });
  return <section className="feel-good-scene" ref={root}><Wave className="wave-top" /><div className="feel-good-title"><Sticker>THE GOOD STUFF.</Sticker><SceneTitle>FOOD THAT<br />FEELS GOOD</SceneTitle><GooglyEyes className="feel-good-eyes" /></div><Art name="fries.webp" className="feel-good-fry" /><Art name="burger.webp" className="feel-good-mascot" /><div className="feel-good-burger"><img src="/assets/menu/edited/mini-smash.webp" alt="Dre’s Mini Smash, creatively edited from its Zomato photograph" /><img src="/assets/kolkata/burger-eyes-v4.webp" className="burger-eyes" alt="" width="400" height="205" loading="lazy" /><Sticker>BOLD<br />FLAVOUR</Sticker></div><div className="feel-good-notes"><p>FRESH FROM THE GRIDDLE<br />STACKED WITH THE GOOD STUFF<br />BEST EATEN WITH BOTH HANDS</p><p>CHICKEN. BEEF. VEGGIE.<br />A LITTLE SOMETHING<br />FOR YOUR KIND OF HUNGRY.</p></div><Wave color="var(--beige)" /></section>;
}

export function FirstBitePhoto({ motion, onVideo }) {
  const root = useRef(null);
  useScene(root, motion, () => {
    gsap.fromTo('.first-bite-image', { scale: 1.12, yPercent: -9 }, { scale: 1, yPercent: 9, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.fromTo('.first-bite-caption', { y: 80 }, { y: -80, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  });
  return <section className="first-bite-photo" ref={root}><picture><source media="(max-width: 700px)" srcSet="/assets/v8/hands-burger-mobile.webp" /><img src="/assets/v8/hands-burger.webp" className="first-bite-image" alt="Two hands holding a double smash burger with the DRE’S logo branded into the bun (AI-created product image)" loading="lazy" decoding="async" width="1536" height="1024" /></picture><div className="first-bite-caption"><Sticker>YOU KNOW THE FEELING.</Sticker><SceneTitle>LESS TALK.<br />MORE BURGER.</SceneTitle><button className="button button-outline first-bite-watch" onClick={onVideo}><span className="inline-play">▶</span>WATCH A REAL DRE’S FOOD STORY</button><Link className="button button-primary first-bite-order" to="/menu"><span className="button-text">GRAB ONE · ORDER DIRECT −10%</span><span className="button-arrow" aria-hidden="true">↗</span></Link></div><small className="first-bite-note">AI-created product image.</small><Sketch type="heart" className="first-bite-heart" /><Wave color="var(--beige)" /></section>;
}

export function IngredientStory({ motion }) {
  const root = useRef(null);
  useScene(root, motion, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'bottom 10%', scrub: .8 } });
    tl.fromTo('.story-lettuce', { y: 150, rotation: -25 }, { y: -160, rotation: 15, ease: 'none' }, 0)
      .fromTo('.story-tomato', { y: 250, rotation: 40 }, { y: -100, rotation: -20, ease: 'none' }, 0)
      .fromTo('.story-cheese', { y: 100, rotation: -30 }, { y: -200, rotation: 5, ease: 'none' }, 0)
      .fromTo('.story-patty', { y: 250, rotation: 25 }, { y: -100, rotation: -5, ease: 'none' }, 0)
      .fromTo('.ingredient-copy', { y: 55 }, { y: -35, ease: 'none' }, 0)
      .to('.ingredient-doodle', { rotation: 60, y: -100, ease: 'none' }, 0);
  });
  return <section className="ingredient-story" ref={root}><DoodleField className="faint" /><div className="ingredient-copy"><Sticker>EVERY LITTLE DETAIL.</Sticker><SceneTitle>EVERY LAYER<br />PACKED WITH<br />SIGNATURE<br />FLAVOUR</SceneTitle><p>That crunch of fresh greens. The melt of cheese. The sweet hit of caramelised onion.<br />Good burgers don’t happen by accident.</p><SceneLink to="/menu" outline>FIND YOUR KIND OF GOOD</SceneLink></div><Art name="lettuce-cutout.webp" className="story-ingredient story-lettuce" alt="Fresh green lettuce" /><Art name="tomato-cutout.webp" className="story-ingredient story-tomato" alt="A fresh tomato slice" /><Art name="cheese-cutout.webp" className="story-ingredient story-cheese" alt="A slice of golden cheese" /><Art name="meat-cutout.webp" className="story-ingredient story-patty" alt="A smashed burger patty" /><Sketch type="spark" className="ingredient-doodle" /><Sketch type="arrow" className="ingredient-arrow" /></section>;
}

export { FirstBiteJourney } from './KolkataExperience';

export function KolkataAdda({ motion, onPhoto }) {
  const root = useRef(null);
  useScene(root, motion, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'bottom top', scrub: .8 } });
    tl.fromTo('.adda-photo-one', { y: 100, rotation: -12 }, { y: -80, rotation: -4, ease: 'none' }, 0)
      .fromTo('.adda-photo-two', { y: 150, rotation: 12 }, { y: -120, rotation: 5, ease: 'none' }, 0)
      .to('.adda-sketch-layer', { yPercent: -12, xPercent: 3, ease: 'none' }, 0);
  });
  return <section className="kolkata-adda" ref={root}><img src="/assets/kolkata/kolkata-adda-v3.webp" className="adda-sketch-layer" alt="" loading="lazy" /><div className="adda-copy"><Sticker>KOLKATA, THROUGH & THROUGH.</Sticker><SceneTitle>A LITTLE SPOT.<br />A LOT OF SOUL.</SceneTitle><p>Off the big streets, in a little corner of Beck Bagan, Dre’s is doing its thing. Burgers made with care. Fries to fight over. A good reason to take the long way home.</p><p>From Andre Dragwidge’s love of making burgers to your next favourite food stop.</p><SceneLink to="/story" outline>MEET THE PERSON BEHIND THE PATTY</SceneLink></div><div className="adda-pictures"><button className="adda-photo-one" onClick={() => onPhoto(photos[2])} aria-label="See the Dre’s Burgers storefront"><img src={photos[2].src} alt={photos[2].alt} loading="lazy" /><span>MEET YOU AT DRE’S.</span></button><button className="adda-photo-two" onClick={() => onPhoto(photos[0])} aria-label="See a real Dre’s burger"><img src={photos[0].src} alt={photos[0].alt} loading="lazy" /><span>THIS IS WHAT WE CAME FOR.</span></button><Art name="burger-boy.png" className="adda-burger-boy" /></div></section>;
}
