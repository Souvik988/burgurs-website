import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart, formatMoney, commerce } from './CartContext';
import { brand } from '../data/brand';
import { Sticker } from '../components/Sketch';
import './commerce.css';

export function DirectOffer({ compact = false }) {
  return <div className={`direct-offer ${compact ? 'offer-compact' : ''}`}><span>GOOD TASTE. BETTER DEAL.</span><strong>10% OFF.<br />WHEN YOU ORDER DIRECT.</strong><p>Save 10% on food and add-ons at direct-order launch. Delivery is quoted separately.</p><Link to="/menu">BUILD YOUR BURGER BAG ↗</Link><small>Direct checkout is in preview. Zomato ordering is available now.</small></div>;
}

export function AddToBag({ item, extras = [], className = '' }) {
  const { add } = useCart();
  return <button className={`button button-primary add-to-bag ${className}`} onClick={() => add(item.id, extras)}>ADD TO BAG <span aria-hidden="true">+</span></button>;
}

function OrderSummary({ children }) {
  const cart = useCart();
  return <aside className="order-summary"><span className="eyebrow">YOUR NEXT GOOD BITE</span><h2>THE GOOD<br />KIND OF MATH.</h2><dl><div><dt>Food &amp; add-ons</dt><dd>{formatMoney(cart.subtotal)}</dd></div><div className="summary-saving"><dt>Direct-order offer · 10%</dt><dd>−{formatMoney(cart.discount)}</dd></div><div><dt>Delivery &amp; applicable charges</dt><dd>At launch</dd></div><div className="summary-total"><dt>Food total</dt><dd>{formatMoney(cart.total)}</dd></div></dl><p className="summary-savings">You save {formatMoney(cart.discount)} on this bag.</p>{children}<p className="checkout-status">DIRECT ORDERING PREVIEW<br />Payments and delivery are not live yet.</p><a className="zomato-alternative" href={brand.order} target="_blank" rel="noopener noreferrer">WANT IT NOW? ORDER ON ZOMATO ↗</a></aside>;
}

export function CartPage() {
  const { lines, count, setQuantity, remove, add } = useCart();
  const [removed, setRemoved] = useState(null);
  const removeLine = line => { setRemoved(line);remove(line.key); };
  return <div className="route-page cart-page"><section className="commerce-hero page-hero"><Sticker>YOUR APPETITE HAS GOOD TASTE.</Sticker><h1>THE BURGER<br />BAG.</h1><p>{count ? `${count} ${count === 1 ? 'good reason' : 'good reasons'} to get hungry.` : 'A very good meal starts here.'}</p><span className="offer-disc">10%<small>DIRECT-ORDER<br />SAVINGS</small></span></section><section className="cart-content section-space">{removed && <div className="cart-undo" role="status">{removed.item.name} removed. <button onClick={() => { for (let i = 0; i < removed.quantity; i++) add(removed.id, removed.extras);setRemoved(null); }}>UNDO</button></div>}{lines.length ? <><div className="cart-lines">{lines.map(line => <article className="cart-line" key={line.key}><Link to="/menu" className="cart-line-photo" aria-label={`Browse menu for ${line.item.name}`}>{line.item.image ? <img src={line.item.image} alt={line.item.name} width="180" height="150" /> : <span>DRE’S<br />{line.item.name}</span>}</Link><div className="cart-line-copy"><span>{line.item.category}</span><h2>{line.item.name}</h2><p>{line.options.length ? line.options.map(option => `Extra ${option.name}`).join(' · ') : 'Just the way Dre’s makes it.'}</p><span className="cart-unit">{formatMoney(line.unitPrice)} each</span><div className="cart-line-actions"><div className="quantity-stepper"><button aria-label={`Decrease ${line.item.name} quantity`} disabled={line.quantity <= 1} onClick={() => setQuantity(line.key, line.quantity - 1)}>−</button><output aria-label={`${line.item.name} quantity`}>{line.quantity}</output><button aria-label={`Increase ${line.item.name} quantity`} disabled={line.quantity >= 20} onClick={() => setQuantity(line.key, line.quantity + 1)}>+</button></div><button className="remove-line" onClick={() => removeLine(line)}>REMOVE</button></div></div><strong className="cart-line-total">{formatMoney(line.total)}</strong></article>)}<Link className="cart-keep-browsing" to="/menu">← THERE’S ALWAYS ROOM FOR FRIES</Link></div><OrderSummary><Link className="button button-primary" to="/checkout">REVIEW DIRECT ORDER ↗</Link></OrderSummary></> : <div className="empty-bag"><img src="/assets/kolkata/kolkata-adda-v3.webp" alt="Illustrated Kolkata friends sharing burgers" width="900" height="450" /><h2>YOUR NEXT CRUSH<br />GOES HERE.</h2><p>Pick a burger, add a little extra, and let’s build something good.</p><Link className="button button-primary" to="/menu">MEET THE MENU ↗</Link></div>}</section><section className="commerce-offer-section section-space"><DirectOffer /></section></div>;
}

const initialDetails = { name: '', phone: '', address: '', area: '', city: 'Kolkata', pincode: '', notes: '' };
function validate(details) {
  const errors = {};
  if (details.name.trim().length < 2) errors.name = 'Enter your name so we know who the order is for.';
  if (!/^[6-9]\d{9}$/.test(details.phone.replace(/\s/g, ''))) errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (details.address.trim().length < 8) errors.address = 'Add your flat or house number and street.';
  if (!details.area.trim()) errors.area = 'Add your Kolkata neighbourhood.';
  if (!/^700\d{3}$/.test(details.pincode)) errors.pincode = 'Enter a six-digit Kolkata PIN starting with 700. Delivery availability will be checked at launch.';
  return errors;
}

export function CheckoutPage() {
  const cart = useCart();
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState({});
  const [review, setReview] = useState(false);
  const form = useRef(null);
  const reviewPanel = useRef(null);
  const change = event => { const { name, value } = event.target;setDetails(previous => ({ ...previous, [name]: value }));setReview(false);setErrors(previous => ({ ...previous, [name]: undefined })); };
  const submit = event => {
    event.preventDefault();const next = validate(details);setErrors(next);
    const first = Object.keys(next)[0];
    if (first) { form.current.elements[first]?.focus();return; }
    setReview(true);requestAnimationFrame(() => reviewPanel.current?.focus());
  };
  if (!cart.lines.length) return <section className="commerce-hero page-hero empty-checkout"><Sticker>ONE GOOD THING AT A TIME.</Sticker><h1>FIRST,<br />THE BURGERS.</h1><p>Add something delicious before reviewing your order.</p><Link to="/menu" className="button button-primary">BUILD YOUR BAG ↗</Link></section>;
  return <div className="route-page checkout-page"><section className="commerce-hero page-hero"><Sticker>FROM BECK BAGAN, WITH LOVE.</Sticker><h1>LET’S GET<br />THIS RIGHT.</h1><p>Review your direct-order bag and save 10% on food at launch.</p></section><section className="checkout-content section-space"><div><div className="checkout-preview-note"><strong>A LITTLE HEADS-UP.</strong><p>This is a checkout preview. Your details stay in this page, and no order, payment or delivery booking is created.</p></div><form ref={form} onSubmit={submit} noValidate className="checkout-form"><h2>WHO’S HUNGRY?</h2><div className="checkout-fields">{[
    ['name', 'Your name', 'text', 'name', 'e.g. Riya Sen…'], ['phone', 'Mobile number', 'tel', 'tel-national', 'e.g. 9876543210…'], ['address', 'Flat, house & street', 'text', 'street-address', 'e.g. Flat 2B, 12 Park Street…'], ['area', 'Kolkata neighbourhood', 'text', 'address-level3', 'e.g. Ballygunge…'], ['pincode', 'PIN code', 'text', 'postal-code', 'e.g. 700017…'],
  ].map(([name,label,type,complete,placeholder]) => <label key={name} className={name === 'address' ? 'field-wide' : ''} htmlFor={`checkout-${name}`}><span id={`checkout-label-${name}`}>{label}</span><input aria-labelledby={`checkout-label-${name}`} id={`checkout-${name}`} name={name} type={type} autoComplete={complete} inputMode={['phone', 'pincode'].includes(name) ? 'numeric' : undefined} maxLength={name === 'pincode' ? 6 : name === 'phone' ? 12 : 180} value={details[name]} onChange={change} placeholder={placeholder} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `error-${name}` : undefined} required />{errors[name] && <small id={`error-${name}`}>{errors[name]}</small>}</label>)}<label htmlFor="checkout-city"><span>City</span><input id="checkout-city" name="city" value="Kolkata" autoComplete="address-level2" readOnly /></label><label className="field-wide" htmlFor="checkout-notes"><span>Anything we should know? <small>Optional</small></span><textarea id="checkout-notes" name="notes" value={details.notes} onChange={change} maxLength={500} rows={3} placeholder="A landmark, a doorbell tip…" /></label></div><p className="form-error-summary" role="status">{Object.values(errors).some(Boolean) ? 'A few details need another look. Check the fields above.' : ''}</p><button className="button button-primary" type="submit">REVIEW MY ORDER ↗</button></form>{review && <section className="checkout-review" ref={reviewPanel} tabIndex={-1} aria-label="Order review"><span className="eyebrow">READY FOR YOUR REVIEW</span><h2>LOOKING GOOD,<br />{details.name.split(' ')[0].toUpperCase()}.</h2><p>{details.address}<br />{details.area}, Kolkata {details.pincode}<br />{details.phone}</p>{details.notes && <p>{details.notes}</p>}<ul>{cart.lines.map(line => <li key={line.key}>{line.quantity} × {line.item.name}<span>{formatMoney(line.total)}</span></li>)}</ul><strong>Food total after 10% off: {formatMoney(cart.total)}</strong><p>Payment and local delivery will be enabled when direct ordering launches. No order has been placed.</p><button className="button button-outline" disabled>PAYMENTS OPENING SOON</button><a href={brand.order} target="_blank" rel="noopener noreferrer">ORDER NOW ON ZOMATO ↗</a></section>}</div><OrderSummary><Link className="checkout-edit-bag" to="/cart">EDIT MY BAG ↗</Link></OrderSummary></section></div>;
}

export function ItemExtras({ item, onSelectionChange }) {
  const [selected, setSelected] = useState([]);
  const toggle = name => { const next = selected.includes(name) ? selected.filter(value => value !== name) : [...selected, name];setSelected(next);onSelectionChange(next); };
  return item.customizations.length ? <fieldset className="cart-item-extras"><legend>MAKE IT YOURS.</legend>{item.customizations.map(extra => <label key={extra.name}><input type="checkbox" checked={selected.includes(extra.name)} onChange={() => toggle(extra.name)} /><span>Extra {extra.name}</span><strong>+{formatMoney(extra.price)}</strong></label>)}</fieldset> : null;
}

export function ItemOrderActions({ item }) {
  const [extras, setExtras] = useState([]);
  return <div className="item-order-actions"><ItemExtras item={item} onSelectionChange={setExtras} /><AddToBag item={item} extras={extras} /><Link to="/cart">VIEW MY BAG ↗</Link></div>;
}
