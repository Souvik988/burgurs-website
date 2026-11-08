import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sketch, Sticker } from './Sketch';
import './founder-workbench.css';

const source = 'https://www.instagram.com/p/DCjAOJ_vgBD/';
const bunSource = 'https://www.facebook.com/andre.m.dragwidge/videos/dres-signature-buns-all-ready-to-roll-outdresburgers-gourmetburgers-delicious-bu/739872088311334/';
const archive = 'https://www.lifestyleasia.com/ind/dining/food/10-best-home-chefs-in-kolkata/';
const founderPhoto = { src: '/assets/founder/andre-at-work-cutout.webp', alt: 'Andre in the Dre’s kitchen, wearing a branded T-shirt and gloves and holding a Dre’s burger. Paper-cut photo edit from his business post.', caption: 'THE PERSON BEHIND THE PATTY.', source, credit: 'Dre’s business Instagram · paper-cut photo edit with imagegen' };

export function FounderWorkbench({ motion, onPhoto, onVideo }) {
  const root = useRef(null);
  useEffect(() => {
    if (!motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.founder-work-portrait', { y: 65, rotation: -8, opacity: 0 }, { y: 0, rotation: -3, opacity: 1, duration: .9, ease: 'back.out(1.4)', scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
      gsap.fromTo('.founder-work-buns', { y: 70, rotation: 13 }, { y: -30, rotation: 5, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .3 } });
    }, root);
    return () => ctx.revert();
  }, [motion]);
  return <section className="founder-workbench section-space" ref={root}><div className="founder-work-pictures"><button className="founder-work-portrait" onClick={() => onPhoto(founderPhoto)} aria-label="Enlarge Andre at work in the Dre’s kitchen"><img src={founderPhoto.src} alt={founderPhoto.alt} width="640" height="1000" loading="lazy" /><span>ANDRE. IN HIS ELEMENT. ↗</span></button><button className="founder-work-buns" onClick={() => onVideo({ title: 'Dre’s signature buns, ready to roll out', creator: 'From the Dre’s public business video archive', url: bunSource, embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(bunSource)}&show_text=false&width=500` })} aria-label="Watch Dre’s signature buns kitchen video"><img src="/assets/founder/signature-buns-paper.webp" alt="A paper-framed photograph from Dre’s signature-buns kitchen video" width="540" height="960" loading="lazy" /><span>FRESH FROM THE WORKBENCH. ▶</span></button><Sketch type="spark" className="founder-work-star" /><img className="founder-real-brand" src="/assets/founder/dres-profile-1.jpg" alt="The Dre’s logo from its public business profile" width="150" height="150" loading="lazy" /></div><div className="founder-work-copy"><Sticker>THE HANDS BEHIND THE GOOD STUFF.</Sticker><span className="eyebrow">ANDRE DRAGWIDGE · DRE’S BURGERS</span><h2>SMALL KITCHEN.<br />ALL HEART.</h2><p>Before the burger spot, there was a home kitchen, a lot of experimenting, and calls to his mum for cooking tips.</p><p>Andre’s early food story was featured in Lifestyle Asia’s 2020 home-chef guide. The setting has changed. That hands-on spirit is still the best introduction to Dre’s.</p><div className="founder-work-links"><button className="button button-primary" onClick={() => onVideo({ title: 'Andre in the Dre’s kitchen', creator: 'Dre’s public business post · November 2024', url: source, embed: 'https://www.instagram.com/p/DCjAOJ_vgBD/embed/' })}>MEET DRE’S IN THE KITCHEN ▶</button><Link to="/menu">LET THE BURGERS DO THE TALKING ↗</Link></div><div className="founder-source-row"><a href={source} target="_blank" rel="noopener noreferrer">ORIGINAL WORK PHOTO ↗</a><a href={archive} target="_blank" rel="noopener noreferrer">READ THE 2020 STORY ↗</a></div><small>Work photographs from Dre’s public business posts. Paper-cut edits preserve the photographed person and products.</small></div></section>;
}
