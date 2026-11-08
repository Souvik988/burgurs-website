import React from 'react';
import { Link } from 'react-router-dom';
import { campaign, founderPosts } from '../data/kolkata';
import { Art, Sketch, Sticker, Wave } from './Sketch';


const external = { target: '_blank', rel: 'noopener noreferrer' };

export { FirstBiteJourney } from './PortraitJourney';
export { CityPostcards } from './CityWorld';

export function FounderFeed({ onVideo }) {
  return <section className="founder-feed section-space"><div className="founder-feed-heading" data-reveal><Sticker>STRAIGHT FROM THE SOURCE.</Sticker><h2 className="scene-title">A LITTLE DRE’S.<br />ON YOUR FEED.</h2><p>Follow the food, the kitchen and the next good bite.<br /><a href="https://www.instagram.com/d.r.es/" {...external}>@d.r.es ↗</a></p></div><div className="founder-posts">{founderPosts.map((post, i) => <article key={post.id} data-reveal><span className="feed-index">{post.year} / THE DRE’S ARCHIVE</span><button className="founder-post-poster" onClick={() => onVideo({ ...post, embed: `https://www.instagram.com/p/${post.id}/embed/`, creator: 'Public post from the Dre’s / Andre Dragwidge profile', label: 'INSTAGRAM' })} aria-label={`Open Instagram post: ${post.title}`}><img src={post.image} alt={`Original thumbnail from Dre’s business post: ${post.title}`} width="360" height="640" loading="lazy" /><span>OPEN THE ORIGINAL STORY ↗</span><Sketch type={i === 1 ? 'spark' : 'heart'} /></button><h3>{post.title}</h3><a href={post.url} {...external}>VIEW ON INSTAGRAM ↗</a></article>)}</div><p className="feed-note">Original business-post thumbnails from Dre’s public archive. Posts play on Instagram and may require sign-in.</p></section>;
}

export function CampaignContactSheet({ onPhoto }) {
  return <section className="campaign-contact section-space"><Sticker>EVERY APPETITE HAS A STORY.</Sticker><h2 className="scene-title">THE KOLKATA<br />BURGER CLUB.</h2><div className="campaign-contact-grid">{campaign.map((photo, i) => <button key={photo.src} onClick={() => onPhoto(photo)} data-reveal aria-label={`Enlarge ${photo.caption}`}><img src={photo.src} alt={photo.alt} loading="lazy" /><span><small>0{i + 1}</small>{photo.caption}</span></button>)}</div><p>AI-created campaign photography inspired by Kolkata. Fictional people and scenes.</p><Art name="burger-club-art.png" className="contact-club-art" alt="Doodle-style friends enjoying burgers together" /></section>;
}
