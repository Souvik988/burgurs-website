import React from 'react';
import { Link } from 'react-router-dom';
import { cityPhotos } from '../data/kolkata';
import { photos } from '../data/brand';
import { Sketch, Sticker } from './Sketch';
import { requestScrollRefresh } from '../motion/refresh';

export function CityPostcards({ onPhoto }) {
  return <section className="city-postcards city-grounded section-space" aria-labelledby="city-world-title">
    <div className="city-postcards-copy" data-reveal><Sticker>OUR CITY. OUR KIND OF BEAUTIFUL.</Sticker><h2 className="scene-title" id="city-world-title">THE CITY<br />IN OUR BONES.</h2><p>The yellow taxi. The slow afternoon. The conversations that never quite end. A burger stop fits right in.</p><Link className="button button-outline" to="/visit">MEET US IN BECK BAGAN ↗</Link><span className="city-note">A real city. A real little burger spot.</span></div>
    <div className="city-postcards-grid">
      <figure className="city-postcard" data-reveal><button onClick={() => onPhoto(cityPhotos[0])} aria-label={`Enlarge ${cityPhotos[0].caption}`}><img src={cityPhotos[0].src} alt={cityPhotos[0].alt} width="600" height="700" loading="lazy" /><span>THE LONG WAY HOME. ↗</span></button><figcaption><a href={cityPhotos[0].source} target="_blank" rel="noopener noreferrer">{cityPhotos[0].credit}</a> · <a href={cityPhotos[0].license} target="_blank" rel="noopener noreferrer">LICENSE</a></figcaption></figure>
      <figure className="city-postcard" data-reveal><button onClick={() => onPhoto(photos[2])} aria-label="See the real Dre’s storefront"><img src={photos[2].src} alt={photos[2].alt} width="600" height="700" loading="lazy" /><span>AND A VERY GOOD STOP. ↗</span></button><figcaption><a href={photos[2].source} target="_blank" rel="noopener noreferrer">{photos[2].credit}</a></figcaption></figure>
    </div>
    <details className="city-source-archive" onToggle={requestScrollRefresh}><summary>THE CITY PHOTO ARCHIVE <span>OPEN THE POSTCARDS ↗</span></summary><p>Everyday Kolkata, photographed by local contributors. Open a photograph for its source and license.</p><div className="city-postcards-grid">{cityPhotos.map((photo,i) => <figure className={`city-postcard postcard-${i}`} key={photo.src}><button onClick={() => onPhoto(photo)} aria-label={`Enlarge archive photograph: ${photo.caption}`}><img src={photo.src} alt={photo.alt} width="600" height="700" loading="lazy" /><span>{photo.caption} ↗</span></button><figcaption><a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.credit}</a> · <a href={photo.license} target="_blank" rel="noopener noreferrer">LICENSE</a><small>Resized to WebP; cropped for display.</small></figcaption></figure>)}</div></details>
  </section>;
}
