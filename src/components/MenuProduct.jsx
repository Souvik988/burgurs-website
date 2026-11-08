import React, { useEffect, useState } from 'react';
import { Sketch } from './Sketch';
import './menu-product.css';

export default function MenuProduct({ item, onOpen, detail = false }) {
  const [original, setOriginal] = useState(false);
  const [selected, setSelected] = useState(0);
  useEffect(() => { setOriginal(false);setSelected(0); }, [item.id]);
  const src = original ? item.gallery[selected] || item.originalImage : item.image;
  const visual = <div className={`product-photo ${original ? 'showing-original' : ''} ${!src ? 'photo-pending' : ''}`}>
    <span className="product-photo-halo" aria-hidden="true" />
    <Sketch type={item.spicy ? 'chilli' : 'spark'} className="product-photo-spark" />
    {src ? <img src={src} alt={`${item.name} · ${original ? 'original Dre’s Zomato photo' : 'imagegen edit of Dre’s Zomato photo'}`} loading={detail ? 'eager' : 'lazy'} /> : <div className="product-photo-ticket"><span>DRE’S / KOLKATA</span><strong>{item.name}</strong><small>GOOD THINGS TAKE A LITTLE TIME.</small><p>Photo not listed on Zomato.</p></div>}
    <span className="product-photo-stamp" aria-hidden="true">DRE’S<br />KOLKATA</span>
  </div>;
  return <div className={`menu-product ${detail ? 'product-detail' : ''}`}>
    {onOpen ? <button className="menu-image-button" onClick={onOpen} aria-label={`View ${item.name}`}>{visual}<span className="menu-image-view">TAKE A CLOSER LOOK ↗</span></button> : visual}
    {item.image && <div className="product-photo-tools"><span>{original ? 'ORIGINAL ZOMATO PHOTO' : 'PHOTO EDIT · DRE’S'}</span><button onClick={() => { setOriginal(v => !v);setSelected(0); }} aria-label={`${original ? 'Show edited' : 'Show original'} photo of ${item.name}`} aria-pressed={original}>{original ? 'SEE THE EDIT ↗' : 'SEE ORIGINAL ↗'}</button></div>}
    {detail && item.gallery.length > 1 && <div className="product-thumbnails" aria-label="More original Zomato photographs">{item.gallery.map((image,i) => <button key={image} className={original && selected === i ? 'active' : ''} onClick={() => { setOriginal(true);setSelected(i); }} aria-label={`Show original photograph ${i + 1} of ${item.name}`}><img src={image} alt="" /></button>)}</div>}
    {detail && <p className="product-source-note">{item.image ? <>{item.sharedPhoto ? 'Zomato uses this photograph for both Stacked and Racked burgers. ' : ''}Photo edits use the linked Dre’s photograph as their source. <a href={item.imageSource} target="_blank" rel="noopener noreferrer">SOURCE PHOTO ↗</a></> : 'This item has no photograph in the restaurant’s Zomato listing.'}</p>}
  </div>;
}
