import React, { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Sketch } from './components/Sketch';
import MenuProduct from './components/MenuProduct';
import { AddToBag } from './commerce/CartPages';

// Shared site state and small UI pieces used by every page.
export const Site = createContext(null);
export const useSite = () => useContext(Site);
export const money = n => `₹${n}`;
export const external = { target: '_blank', rel: 'noopener noreferrer' };

export function Button({ to, href, children, className = '', outline = false, ...props }) {
  const classes = `button ${outline ? 'button-outline' : 'button-primary'} ${className}`;
  const content = <><span className="button-text">{children}</span><span aria-hidden="true" className="button-arrow">↗</span></>;
  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...(href.startsWith('https:') ? external : {})} {...props}>{content}</a>;
  return <button type="button" className={classes} {...props}>{content}</button>;
}


export function Headline({ lines, as: Tag = 'h2', className = '' }) {
  return <Tag className={`headline ${className}`}>{lines.map((line, i) => <span className="headline-line" key={i}><span>{line}</span></span>)}</Tag>;
}

export function Tilt({ children, className = '', ...props }) {
  const move = e => {
    if (e.pointerType === 'touch' || document.documentElement.dataset.motion === 'off') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--tilt-x', `${((e.clientY - r.top) / r.height - .5) * -6}deg`);
    e.currentTarget.style.setProperty('--tilt-y', `${((e.clientX - r.left) / r.width - .5) * 6}deg`);
  };
  const reset = e => { e.currentTarget.style.setProperty('--tilt-x', '0deg');e.currentTarget.style.setProperty('--tilt-y', '0deg'); };
  return <div className={`tilt ${className}`} onPointerMove={move} onPointerLeave={reset} {...props}>{children}</div>;
}


export function MenuCard({ item }) {
  const { favorites, toggleFavorite, setOverlay } = useSite();
  const saved = favorites.includes(item.id);
  return <article className={`menu-card ${item.real ? 'real-card' : ''}`} data-reveal><div className="menu-card-top"><span className={`diet-dot ${item.vegetarian ? 'veg' : ''}`} title={item.category}>{item.category}</span><button className={`favorite-button ${saved ? 'saved' : ''}`} aria-label={`${saved ? 'Remove' : 'Save'} ${item.name} ${saved ? 'from' : 'to'} craving list`} aria-pressed={saved} onClick={() => toggleFavorite(item.id)}><Sketch type="heart" /></button></div><MenuProduct item={item} onOpen={() => setOverlay({ type: 'item', data: item })} /><div className="menu-card-caption"><span>{item.tag}</span>{item.spicy && <Sketch type="chilli" />}</div><div className="menu-card-name"><h3>{item.name}</h3><span>{money(item.price)}</span></div><p>{item.description}</p><AddToBag item={item} /><button className="card-detail" onClick={() => setOverlay({ type: 'item', data: item })}>THAT’S MY KIND OF BURGER <span>↗</span></button></article>;
}
