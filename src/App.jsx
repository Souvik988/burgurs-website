import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brand, menu, photos, videos } from './data/brand';
import { Art, DoodleField, Marquee, Sketch, Sticker, Wave } from './components/Sketch';
import './styles.css';
import { CampaignContactSheet, CityPostcards, FounderFeed } from './components/KolkataExperience';
import Preloader from './v6/Preloader';
import { whenSiteReady } from './v6/ready';
import { FallingDoodles, PeekMascot, ScrollMeter, useGlobalMotion } from './v6/Motion';
import { MeetTheCrew, WordOnTheStreet } from './v6/Sections';
import MenuProduct from './components/MenuProduct';
import { BurgerAssembly, BurgerEncore } from './components/BurgerMotion';
import { CinemaHero, ClassicIntro, FeelGoodScene, FirstBitePhoto, IngredientStory, FirstBiteJourney, KolkataAdda } from './components/ScrollStory';
import './components/kolkata-experience.css';
import { requestScrollRefresh } from './motion/refresh';
import { CartProvider, useCart } from './commerce/CartContext';
import { AddToBag, CartPage, CheckoutPage, DirectOffer, ItemOrderActions } from './commerce/CartPages';
import { FounderWorkbench } from './components/FounderWorkbench';
import FounderWorkScenes from './components/FounderWorkScenes';
import './artwork.css';
import './homepage-restored.css';
import { requestScrollRefresh as refreshAfterLoad } from './motion/refresh';
// Inner pages load on demand so the homepage stays light.
const MenuPageV7 = React.lazy(() => import('./v7/pages/MenuV7'));
const StoryPageV7 = React.lazy(() => import('./v7/pages/StoryV7'));
const KolkataPageV7 = React.lazy(() => import('./v7/pages/KolkataV7'));
const FoodStoriesPageV7 = React.lazy(() => import('./v7/pages/StoriesV7'));
const VisitPageV7 = React.lazy(() => import('./v7/pages/VisitV7'));
function PageLoading() { useEffect(() => () => refreshAfterLoad(true), []); return <div className="v7-page-loading" role="status" aria-label="Loading page"><img src="/assets/v6/doodles/burger.webp" alt="" /></div>; }
import PageTransition from './v8/PageTransition';
import { OrderBadge, useFlyToBag } from './v8/Order';
import FooterWordmark from './v8/FooterWordmark';
import { applySeo } from './v7/seo';
import { startDecodeAhead } from './v8/decodeAhead';
import { Site, useSite, money, external, Button, Headline, Tilt, MenuCard } from './site';

gsap.registerPlugin(ScrollTrigger);
// Mobile address-bar show/hide resizes the viewport constantly; don't re-measure every pin for that.
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

function readSaved() { try { const ids = JSON.parse(localStorage.getItem('dres-cravings') || '[]');return Array.isArray(ids) ? ids.filter(id => menu.some(item => item.id === id)) : []; } catch { return []; } }

function Logo({ className = '' }) {
  return <Link to="/" className={`logo ${className}`} aria-label="Dre’s Burgers home"><span>dre’s</span><small>BURGERS</small></Link>;
}

const pageLinks = [['/', 'HOME'], ['/menu', 'THE MENU'], ['/story', 'OUR STORY'], ['/kolkata', 'KOLKATA'], ['/stories', 'FOOD STORIES'], ['/visit', 'FIND DRE’S']];

function Header() {
  const [open, setOpen] = useState(false);
  const { favorites, setOverlay, motion } = useSite();
  const { count: bagCount } = useCart();
  const location = useLocation();
  const trigger = useRef(null);
  const panel = useRef(null);
  const closeTween = useRef(null);
  const close = () => {
    if (closeTween.current?.isActive()) return;
    if (!motion || !panel.current) { setOpen(false);return; }
    closeTween.current = gsap.to(panel.current, { scale: .85, y: -15, autoAlpha: 0, duration: .2, ease: 'power2.in', onComplete: () => setOpen(false) });
  };
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      if (motion) {
        gsap.fromTo(panel.current, { scale: .55, y: -25, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: .45, ease: 'back.out(1.25)' });
        gsap.fromTo(panel.current.querySelectorAll('a'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: .04, duration: .3, delay: .12 });
      }
    });
    panel.current.querySelector('a')?.focus({ preventScroll: true });
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault();close(); }
      if (e.key === 'Tab') {
        const links = [...panel.current.querySelectorAll('a')];
        const controls = [trigger.current, ...links];
        const index = controls.indexOf(document.activeElement);
        if (e.shiftKey && index <= 0) { e.preventDefault();links.at(-1)?.focus(); }
        if (!e.shiftKey && index === controls.length - 1) { e.preventDefault();trigger.current.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { closeTween.current?.kill();ctx.revert();document.body.style.overflow = oldOverflow;document.removeEventListener('keydown', onKey);trigger.current?.focus({ preventScroll: true }); };
  }, [open, motion]);
  return <>{open && <button className="navigation-scrim" onClick={close} aria-label="Close navigation backdrop" tabIndex={-1} />}<header className="site-header"><Logo /><nav className="desktop-nav" aria-label="Main navigation">{pageLinks.map(([url,label]) => <NavLink key={url} to={url} end={url === '/'}>{label}<span className="nav-underline" /></NavLink>)}</nav><div className="header-actions"><button className="cravings-button" aria-label={`Open craving list, ${favorites.length} saved items`} onClick={() => setOverlay({ type: 'cravings' })}><Sketch type="heart" /><span>{favorites.length}</span></button><Link className="cart-header-link" to="/cart" aria-label={`Open bag, ${bagCount} items`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><span>{bagCount}</span></Link><Button to="/menu" className="header-order">ORDER DIRECT</Button><button className={`mobile-toggle ${open ? 'is-open' : ''}`} ref={trigger} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => open ? close() : setOpen(true)}><i /><i /></button></div>{open && <nav ref={panel} id="mobile-nav" className="mobile-nav" aria-label="Expanded navigation"><Sticker>HUNGRY? GOOD.</Sticker>{pageLinks.map(([url,label]) => <Link to={url} key={url}>{label}<span>↗</span></Link>)}<span>MADE WITH LOVE IN KOLKATA.</span></nav>}</header></>;
}

function usePageMotion() {
  const { pathname } = useLocation();
  const { motion } = useSite();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    applySeo(pathname);
  }, [pathname]);
  useEffect(() => {
    if (!motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelReady = () => {};
    const context = gsap.context(() => {
      const intro = gsap.timeline({ paused: true });
      intro.fromTo('.page-hero .headline-line > span', { yPercent: 110, rotate: 3 }, { yPercent: 0, rotate: 0, duration: .85, stagger: .1, ease: 'power3.out' }, 0);
      if (document.querySelector('.hero-art')) intro.fromTo('.hero-art', { y: 65, rotate: 8, scale: .92, opacity: 0 }, { y: 0, rotate: 0, scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }, .2);
      cancelReady = whenSiteReady(() => intro.play());
      document.querySelectorAll('[data-reveal]').forEach(el => {
        gsap.fromTo(el, { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 93%', once: true } });
      });
      document.querySelectorAll('[data-parallax]').forEach(el => {
        gsap.fromTo(el, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
      document.querySelectorAll('h2.scene-title').forEach(el => {
        if (el.closest('.bite-journey')) return;
        gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
      });
      document.querySelectorAll('section > .sticker, .section-heading .sticker, .gallery-title .sticker').forEach(el => {
        gsap.fromTo(el, { scale: .65, opacity: 0 }, { scale: 1, opacity: 1, duration: .65, ease: 'back.out(2.5)', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
      });
      document.querySelectorAll('.draw-on-scroll').forEach(el => {
        gsap.fromTo(el, { scale: .75, opacity: 0 }, { scale: 1, opacity: 1, duration: .7, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      });
    });
    const refresh = setTimeout(() => requestScrollRefresh(true), 500);
    return () => { clearTimeout(refresh);cancelReady();context.revert(); };
  }, [pathname, motion]);
}

function FeaturedMenu() {
  return <section className="featured section-space" id="good-stuff"><DoodleField className="faint" /><FallingDoodles items={[{ name: 'fries', x: '3%', y: '6%', size: 74, r: -12 }, { name: 'soda', x: '91%', y: '30%', size: 62, r: 9 }, { name: 'spark', x: '47%', y: '3%', size: 46, r: 0 }, { name: 'chilli', x: '6%', y: '78%', size: 70, r: 18 }]} /><PeekMascot name="fries" side="right" /><div className="section-heading" data-reveal><div><Sticker>THE USUAL? MAKE IT UNUSUAL.</Sticker><Headline lines={['MEET YOUR', 'NEXT CRAVING.']} /></div><p>Little ones. Loaded ones.<br />Something with a little heat.<br />Find your kind of happy.</p><Sketch type="burger" className="heading-doodle" /></div><div className="featured-menu-grid">{['mini-smash', 'herbed-potato', 'smashburg'].map(id => <MenuCard key={id} item={menu.find(item => item.id === id)} />)}</div><div className="section-end" data-reveal><Button to="/menu">ALL THE GOOD STUFF</Button><span className="hand-note">yes, there are fries too.</span><Sketch type="fries" /></div></section>;
}

function RealGallery({ compact = false }) {
  const { setOverlay } = useSite();
  return <section className={`real-gallery section-space ${compact ? 'gallery-compact' : ''}`}><div className="gallery-title" data-reveal><Sticker>NO FILTER ON THE FLAVOUR.</Sticker><Headline lines={['REAL BURGERS.', 'REAL GOOD TIMES.']} /><p>From the griddle to the first bite. A peek at the real Dre’s.</p></div><div className="photo-wall">{photos.slice(0, compact ? 3 : photos.length).map((photo, i) => <Tilt className={`photo-frame frame-${i}`} key={photo.src} data-reveal><button onClick={() => setOverlay({ type: 'photo', data: photo })} aria-label={`Enlarge photo: ${photo.caption}`}><div className="photo-window"><img src={photo.src} alt={photo.alt} loading="lazy" /></div><span>{photo.caption}<span aria-hidden="true">↗</span></span></button>{i === 0 && <Sketch type="spark" className="photo-spark" />}{i === 2 && <Art name="burger.webp" className="photo-mascot" />}</Tilt>)}</div><div className="photo-wall-end"><Sketch type="heart" /><span className="hand-note">a little messy.<br />exactly how we like it.</span></div></section>;
}

function VideoSection() {
  const { setOverlay } = useSite();
  return <section className="video-section section-space" id="videos"><DoodleField /><PeekMascot name="chilli" side="left" /><div className="video-heading" data-reveal><div><Sticker>CAUGHT IN THE WILD.</Sticker><Headline lines={['PRESS PLAY.', 'GET HUNGRY.']} /></div><p>Kolkata’s food people came for a bite.<br />Here’s what made it to the feed.</p><Sketch type="arrow" className="draw-on-scroll" /></div><div className="video-grid">{videos.map((video, i) => <article className={`video-card video-${i}`} key={video.id} data-reveal><button className="video-poster" onClick={() => setOverlay({ type: 'video', data: video })} aria-label={`Play ${video.title}`}><img src={video.image} alt="" loading="lazy" /><span className="video-platform">{video.label}</span><span className="play-icon" aria-hidden="true">▶</span><span className="video-watch">WATCH THE STORY ↗</span></button><div className="video-caption"><h3>{video.title}</h3><a href={video.url} {...external} aria-label={`View original post: ${video.title}`}>ORIGINAL POST ↗</a></div></article>)}</div><span className="video-credit">Food stories belong to their creators. Watch the original posts for more.</span></section>;
}

function Home() {
  const { motion, setOverlay } = useSite();
  const onPhoto = data => setOverlay({ type: 'photo', data });
  return <div className="route-page home-page"><CinemaHero motion={motion} /><ClassicIntro motion={motion} onPhoto={onPhoto} /><FeelGoodScene motion={motion} /><FirstBitePhoto motion={motion} onVideo={() => setOverlay({ type: 'video', data: videos[0] })} /><BurgerAssembly motion={motion} /><IngredientStory motion={motion} /><FirstBiteJourney motion={motion} onPhoto={onPhoto} /><KolkataAdda motion={motion} onPhoto={onPhoto} /><CityPostcards onPhoto={onPhoto} /><FounderWorkbench motion={motion} onPhoto={onPhoto} onVideo={data => setOverlay({ type: 'video', data })} /><MeetTheCrew motion={motion} /><RealGallery compact /><WordOnTheStreet motion={motion} /><section className="section-space commerce-home-offer"><DirectOffer /></section><FeaturedMenu /><VideoSection /><FounderFeed onVideo={data => setOverlay({ type: 'video', data })} /></div>;
}

function Footer() {
  const { motion, setMotion, setOverlay } = useSite();
  return <footer className="footer"><BurgerEncore motion={motion} onSelect={data => setOverlay({ type: 'item', data })} /><div className="footer-invite"><Sticker>GOODBYE IS A STRONG WORD.</Sticker><Headline lines={['SEE YOU AT', 'THE NEXT BITE.']} /><Button to="/menu">ONE MORE BURGER?</Button><Art name="og-image.webp" /></div><div className="footer-links"><Logo /><nav aria-label="Footer navigation"><Link to="/menu">THE MENU</Link><Link to="/cart">YOUR BAG</Link><Link to="/story">OUR STORY</Link><Link to="/kolkata">KOLKATA</Link><Link to="/stories">FOOD STORIES</Link><Link to="/visit">FIND DRE’S</Link><a href={brand.instagram} {...external}>INSTAGRAM ↗</a></nav><a href={brand.phoneHref}>{brand.phone}</a></div><div className="footer-meta"><span>BECK BAGAN, KOLKATA. MADE WITH HEART.</span><button onClick={() => setMotion(v => !v)} aria-pressed={!motion}>{motion ? 'Ⅱ PAUSE MOTION' : '▶ RESUME MOTION'}</button><span>© 2026 DRE’S BURGERS</span></div><FooterWordmark /></footer>;
}

function Overlay({ overlay, onClose }) {
  const dialog = useRef(null);
  const { favorites, toggleFavorite, setOverlay, motion } = useSite();
  const closing = useRef(false);
  const closeAnimation = useRef(null);
  const close = () => {
    if (closing.current) return;
    if (!motion || !dialog.current) { onClose();return; }
    closing.current = true;dialog.current.classList.add('is-closing');
    closeAnimation.current = gsap.to(dialog.current, { scale: .92, opacity: 0, y: 20, duration: .2, ease: 'power2.in', onComplete: onClose });
  };
  useEffect(() => { if (!overlay) return;const d = dialog.current;closing.current = false;d.showModal();const oldOverflow = document.body.style.overflow;document.body.style.overflow = 'hidden';const entrance = motion ? gsap.fromTo(d, { scale: .87, opacity: 0, y: 35 }, { scale: 1, opacity: 1, y: 0, duration: .4, ease: 'back.out(1.3)' }) : null;return () => { entrance?.kill();closeAnimation.current?.kill();d.close();d.classList.remove('is-closing');document.body.style.overflow = oldOverflow; }; }, [Boolean(overlay)]);
  if (!overlay) return null;
  const { type, data } = overlay;
  return <dialog className={`site-dialog dialog-${type}`} ref={dialog} aria-label={type === 'video' ? data.title : type === 'photo' ? data.caption : type === 'item' ? data.name : 'Your craving list'} onCancel={e => { e.preventDefault();close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}><div className="dialog-inner"><button className="dialog-close" aria-label="Close dialog" onClick={close}>CLOSE <span>×</span></button>{type === 'photo' && <><img className="lightbox-image" src={data.src} alt={data.alt} /><h2>{data.caption}</h2>{data.source ? <a href={data.source} {...external}>{data.credit} ↗</a> : <p>{data.credit}</p>}{data.license && <p><a href={data.license} {...external}>VIEW LICENSE ↗</a> · Resized to WebP; cropped for display.</p>}</>}{type === 'video' && <><div className="video-player"><iframe src={data.embed} title={data.title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div><h2>{data.title}</h2><p>{data.creator}</p><a className="original-link" href={data.url} {...external}>WATCH THE ORIGINAL POST ↗</a></>}{type === 'item' && <div className="item-detail"><div className="detail-image"><MenuProduct item={data} detail /></div><div><Sticker>{data.tag}</Sticker><h2>{data.name}</h2><span className="detail-price">{money(data.price)}</span><p>{data.description}</p><div className="menu-source-extras"><a href={data.source} {...external}>VIEW THE SOURCE MENU ON ZOMATO ↗</a></div><span className="detail-category">{data.vegetarian ? 'VEGETARIAN · ' : 'NON-VEGETARIAN · '}{data.category}{data.spicy ? ' · A LITTLE HEAT' : ''}</span><ItemOrderActions key={data.id} item={data} /><Button href={brand.order} outline>ALSO ON ZOMATO</Button><button className="detail-save" onClick={() => toggleFavorite(data.id)}><Sketch type="heart" />{favorites.includes(data.id) ? 'SAVED TO MY CRAVINGS' : 'SAVE TO MY CRAVINGS'}</button><small>{data.image ? 'Original Dre’s menu photography, creatively edited with imagegen. See the original above.' : 'No item photograph listed on Zomato.'} Final price and availability on Zomato.</small></div></div>}{type === 'cravings' && <div className="cravings-panel"><Sticker>GOOD TASTE. SAVED.</Sticker><h2>MY CRAVINGS.</h2>{favorites.length ? <><div className="cravings-items">{menu.filter(item => favorites.includes(item.id)).map(item => <div key={item.id}><button onClick={() => setOverlay({ type: 'item', data: item })}>{item.name}<span>{money(item.price)}</span></button><button aria-label={`Remove ${item.name} from craving list`} onClick={() => toggleFavorite(item.id)}>×</button></div>)}</div><Button href={brand.order}>ORDER YOUR FAVOURITES</Button></> : <><Sketch type="heart" /><p>Something caught your eye?<br />Tap a heart on the menu and keep it here.</p><Button to="/menu" onClick={onClose}>FIND YOUR FAVOURITE</Button></>}</div>}</div></dialog>;
}

function NotFound() { return <section className="not-found section-space"><Sketch type="burger" /><Sticker>WRONG TURN. RIGHT APPETITE.</Sticker><Headline as="h1" lines={['NO BURGERS', 'ON THIS PAGE.']} /><Button to="/">BACK TO THE GOOD STUFF</Button></section>; }

function SiteContent() {
  const location = useLocation();
  const { setOverlay } = useSite();
  usePageMotion();
  const { motion } = useSite();
  useGlobalMotion(motion);
  useFlyToBag();
  useEffect(() => startDecodeAhead(), []);
  useEffect(() => { setOverlay(null); }, [location.pathname, setOverlay]);
  return <><a href="#main-content" className="skip-link">Skip to content</a><Header /><main id="main-content"><React.Suspense fallback={<PageLoading />}><Routes><Route path="/" element={<Home />} /><Route path="/menu" element={<MenuPageV7 />} /><Route path="/story" element={<StoryPageV7 />} /><Route path="/kolkata" element={<KolkataPageV7 />} /><Route path="/stories" element={<FoodStoriesPageV7 />} /><Route path="/visit" element={<VisitPageV7 />} /><Route path="/cart" element={<CartPage />} /><Route path="/checkout" element={<CheckoutPage />} /><Route path="*" element={<NotFound />} /></Routes></React.Suspense></main><OrderBadge /><Footer /></>;
}

const SHORT_LANDSCAPE = '(max-height: 500px) and (orientation: landscape)';
const reducedMotionPref = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [favorites, setFavorites] = useState(readSaved);
  const [overlay, setOverlay] = useState(null);
  // Full-screen pinned scenes cannot fit on a phone held sideways (~360-430px tall), so short landscape
  // screens get the calm, non-pinned layout automatically; rotating back upright turns motion on again.
  // A choice made with the footer's pause button always wins.
  const [motion, setMotionState] = useState(() => { const v = !reducedMotionPref() && !matchMedia(SHORT_LANDSCAPE).matches; document.documentElement.dataset.motion = v ? 'on' : 'off'; return v; });
  const userChose = useRef(false);
  // The flag is written as the state changes, before child effects read it through motionAllowed().
  const applyMotion = useCallback(next => setMotionState(prev => { const v = typeof next === 'function' ? next(prev) : next; document.documentElement.dataset.motion = v ? 'on' : 'off'; return v; }), []);
  const setMotion = useCallback(next => { userChose.current = true; applyMotion(next); }, [applyMotion]);
  useEffect(() => {
    const mq = matchMedia(SHORT_LANDSCAPE);
    const onChange = () => { if (!userChose.current) applyMotion(!mq.matches && !reducedMotionPref()); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [applyMotion]);
  useEffect(() => { document.documentElement.dataset.motion = motion ? 'on' : 'off'; }, [motion]);
  const toggleFavorite = id => { setFavorites(old => { const next = old.includes(id) ? old.filter(i => i !== id) : [...old, id];try { localStorage.setItem('dres-cravings', JSON.stringify(next)); } catch { /* Keep saved choices for this visit if storage is unavailable. */ }return next; }); };
  return <BrowserRouter><CartProvider><Site.Provider value={{ favorites, toggleFavorite, overlay, setOverlay, motion, setMotion }}><Preloader motion={motion} /><ScrollMeter /><SiteContent /><PageTransition /><Overlay overlay={overlay} onClose={() => setOverlay(null)} /></Site.Provider></CartProvider></BrowserRouter>;
}
