import React from 'react';

const stickerCells = { spark: [0, 0], arrow: [1, 0], heart: [2, 0], chilli: [3, 0], taxi: [0, 1], bridge: [1, 1], burger: [2, 1], fries: [3, 1], wing: [2, 1] };

export function Sketch({ type = 'spark', className = '', style, ...props }) {
  if (type === 'pin') return <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className={`sketch functional-pin ${className}`} aria-hidden="true" {...props}><path d="M50 94S16 58 16 36C16-3 85-4 84 36c0 23-34 58-34 58Z" /><circle cx="50" cy="35" r="12" /></svg>;
  const [column, row] = stickerCells[type] || stickerCells.spark;
  return <span className={`sketch generated-doodle ${className}`} aria-hidden="true" data-art-source="imagegen" style={{ backgroundImage: "url('/assets/kolkata/doodle-stickers-v4.webp')", backgroundSize: '400% 200%', backgroundPosition: `${column * 100 / 3}% ${row * 100}%`, backgroundRepeat: 'no-repeat', ...style }} {...props} />;
}

export function Sticker({ children, className = '' }) {
  return <span className={`sticker ${className}`}>{children}</span>;
}

export function Art({ name, alt = '', className = '', eager = false, ...props }) {
  return <img src={`/assets/images/${name.replace(/\.png$/, '.webp')}`} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" {...props} />;
}

export function Wave({ color = 'var(--red)', className = '' }) {
  return <svg className={`wave ${className}`} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 57C180-35 260 0 440 70S710 98 850 46s235 45 380 4 130-50 210-35v105H0Z" fill={color} /></svg>;
}

export function DoodleField({ className = '' }) {
  return <div className={`doodle-field ${className}`} aria-hidden="true">{['burger', 'spark', 'fries', 'chilli', 'heart', 'taxi', 'spark', 'bridge'].map((type, i) => <Sketch key={i} type={type} className={`field-${i}`} />)}</div>;
}

export function Marquee({ children = 'GOOD BURGERS. GOOD MOOD.', light = false }) {
  return <div className={`marquee ${light ? 'marquee-light' : ''}`} aria-label={children}><div aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i}>{children}<Sketch type="spark" /></span>)}</div></div>;
}
