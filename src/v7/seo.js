// Per-route search metadata and structured data. Applied on every route change.
import { brand, menu } from '../data/brand';

export const faq = [
  { q: 'Where exactly is Dre’s Burgers?', a: `${brand.address}. It’s a small takeaway kiosk on the Park Circus side of Ballygunge in central Kolkata. Tap “Get directions” for turn-by-turn.` },
  { q: 'What are the opening hours?', a: `Public listings don’t agree on timings, so please call ${brand.phone} for today’s hours before you head over.` },
  { q: 'Do you deliver?', a: 'Yes. Delivery is available through Zomato, depending on your area. Our own direct-order bag (with 10% off at launch) is in preview on this site.' },
  { q: 'Is there seating?', a: 'Dre’s is a tiny kiosk, so think grab-and-go: order at the hatch and take your burger with you.' },
  { q: 'Are there vegetarian options?', a: 'Yes. The Herbed Potato burger, Salted Fries and Peri Peri Fries are all vegetarian.' },
  { q: 'How much does a meal cost?', a: 'Zomato estimates about ₹200 for one. Burgers start at ₹150 and sides at ₹100; check the menu for current listed prices.' },
];

const SITE = 'Dre’s Burgers';
const routes = {
  '/': { title: 'Smash Burgers in Beck Bagan, Kolkata', description: 'Dre’s Burgers: smashed beef, crispy chicken fillet and herbed potato burgers from a tiny kiosk in Beck Bagan, Kolkata. Order direct, on Zomato, or walk up.' },
  '/menu': { title: 'The Menu · Smash Burgers, Chicken & Fries', description: 'The full Dre’s Burgers menu with listed prices: Smashburg, Hot Chick, Black Bear, Herbed Potato, peri peri fries, wings and more. Find your burger in three taps.' },
  '/story': { title: 'Our Story · From a Home Kitchen to Beck Bagan', description: 'How Andre Dragwidge went from home-kitchen experiments and a 2020 Lifestyle Asia feature to Kolkata’s crowd-favourite smash burger kiosk.' },
  '/kolkata': { title: 'Kolkata, In Every Bite', description: 'Trams, taxis, adda and pet pujo. A day at Dre’s Burgers in Beck Bagan, and six Kolkata words you’ll hear in the queue.' },
  '/stories': { title: 'Food Stories · Reels & Real Photos', description: 'Watch Kolkata food creators and Dre’s own reels, and flick through real photos from Dre’s Burgers in Beck Bagan.' },
  '/visit': { title: 'Find Dre’s · Address, Directions & FAQ', description: `Dre’s Burgers, ${brand.address}. Directions, live map, ways to order and answers to common questions. Call ${brand.phone}.` },
  '/cart': { title: 'Your Burger Bag', description: 'Review your Dre’s Burgers bag.', noindex: true },
  '/checkout': { title: 'Review Your Order', description: 'Review your Dre’s Burgers order.', noindex: true },
};

const restaurant = origin => ({
  '@context': 'https://schema.org', '@type': 'Restaurant', '@id': `${origin}/#restaurant`, name: 'Dre’s Burgers', url: `${origin}/`,
  image: `${origin}/assets/images/og-image.webp`, telephone: brand.phone, servesCuisine: ['Burgers', 'Fast Food'], priceRange: '₹200 for one (approx.)',
  address: { '@type': 'PostalAddress', streetAddress: '102, Ustad Enayet Khan Avenue, Lower Range', addressLocality: 'Beck Bagan, Kolkata', addressRegion: 'West Bengal', postalCode: '700019', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: 22.539729, longitude: 88.363142 },
  founder: { '@type': 'Person', name: brand.founder }, sameAs: [brand.instagram, brand.source], hasMenu: `${origin}/menu`,
});
const menuLd = origin => ({
  '@context': 'https://schema.org', '@type': 'Menu', name: 'Dre’s Burgers menu', url: `${origin}/menu`, inLanguage: 'en-IN',
  hasMenuSection: ['Beef', 'Chicken', 'Veggie', 'Sides'].map(cat => ({ '@type': 'MenuSection', name: cat, hasMenuItem: menu.filter(m => m.category === cat).map(m => ({ '@type': 'MenuItem', name: m.name, description: m.description, ...(m.vegetarian ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}), offers: { '@type': 'Offer', price: m.price, priceCurrency: 'INR' } })) })),
});
const faqLd = () => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const crumbs = (origin, path, name) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }, ...(path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name, item: `${origin}${path}` }])] });

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

export function applySeo(pathname) {
  const meta = routes[pathname] || { title: 'Page not found', description: 'This page doesn’t exist, but the burgers do.', noindex: true };
  const origin = location.origin;
  const title = `${meta.title} | ${SITE}`;
  document.title = title;
  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.noindex ? 'noindex, follow' : 'index, follow');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', origin + pathname);
  setMeta('property', 'og:type', 'restaurant');
  setMeta('property', 'og:image', `${origin}/assets/images/og-image.webp`);
  setMeta('name', 'twitter:card', 'summary_large_image');
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = origin + pathname;
  document.head.querySelectorAll('script[data-seo]').forEach(s => s.remove());
  const blocks = [restaurant(origin), crumbs(origin, pathname, meta.title.split(' · ')[0])];
  if (pathname === '/menu') blocks.push(menuLd(origin));
  if (pathname === '/visit') blocks.push(faqLd());
  blocks.forEach(b => { const s = document.createElement('script'); s.type = 'application/ld+json'; s.dataset.seo = ''; s.textContent = JSON.stringify(b); document.head.appendChild(s); });
}
