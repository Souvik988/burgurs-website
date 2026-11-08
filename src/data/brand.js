export const brand = {
  name: "Dre’s Burgers",
  founder: 'Andre Dragwidge',
  neighborhood: 'Beck Bagan, Kolkata',
  address: '102, Ustad Enayet Khan Avenue, Lower Range, Beck Bagan, Kolkata',
  phone: '+91 62923 25082',
  phoneHref: 'tel:+916292325082',
  order: 'https://www.zomato.com/kolkata/dres-burgers-park-circus-area/order',
  maps: 'https://www.google.com/maps/dir/?api=1&destination=22.539729,88.363142',
  instagram: 'https://www.instagram.com/d.r.es/',
  source: 'https://www.zomato.com/kolkata/dres-burgers-park-circus-area',
};

export { menu } from './menu';

export const photos = [
  { src: '/assets/media/dres-food-1.jpg', alt: 'A loaded Dre’s burger with lettuce and melted cheese', caption: 'THAT FIRST-BITE FEELING.', source: 'https://wanderlog.com/place/details/12152445/dres-burgers', credit: 'Business photo gallery · via Wanderlog' },
  { src: '/assets/media/mini-smash-real.jpg', alt: 'Dre’s Mini Smash Burger', caption: 'SMALL BURGER. BIG PERSONALITY.', source: brand.order, credit: 'Dre’s Burgers · Zomato menu photo' },
  { src: '/assets/media/dres-food-3.jpg', alt: 'The Dre’s Burgers takeaway storefront in Kolkata', caption: 'YOUR NEXT FOOD STOP.', source: 'https://wanderlog.com/place/details/12152445/dres-burgers', credit: 'Business photo gallery · via Wanderlog' },
  { src: '/assets/media/herbed-potato-real.jpg', alt: 'Dre’s Herbed Potato Burger with fresh vegetables', caption: 'PLANTS CAN PARTY TOO.', source: brand.order, credit: 'Dre’s Burgers · Zomato menu photo' },
  { src: '/assets/media/dres-food-2.jpg', alt: 'An interior photo from the Dre’s Burgers business gallery', caption: 'A LITTLE PEEK INSIDE.', source: 'https://wanderlog.com/place/details/12152445/dres-burgers', credit: 'Business photo archive · via Wanderlog' },
];

export const videos = [
  { id: '7_I9hhHw4fY', type: 'youtube', title: 'The chicken fillet taste test', label: 'YOUTUBE SHORT', creator: 'Food review · YouTube', image: '/assets/media/video-chicken.jpg', url: 'https://www.youtube.com/shorts/7_I9hhHw4fY', embed: 'https://www.youtube-nocookie.com/embed/7_I9hhHw4fY?autoplay=1&rel=0' },
  { id: 'DTrp92mjLM1', type: 'instagram', title: 'Tiny kiosk. Big burger love.', label: 'KOLKATA DELITES', creator: 'Kolkata Delites · Instagram', image: '/assets/media/dres-food-3.jpg', url: 'https://www.instagram.com/reel/DTrp92mjLM1/', embed: 'https://www.instagram.com/reel/DTrp92mjLM1/embed/' },
  { id: 'DUTJiRokvyg', type: 'instagram', title: 'A Kolkata burger obsession', label: 'FROM THE FEED', creator: 'Food review · Instagram', image: '/assets/media/dres-food-1.jpg', url: 'https://www.instagram.com/reel/DUTJiRokvyg/', embed: 'https://www.instagram.com/reel/DUTJiRokvyg/embed/' },
];
