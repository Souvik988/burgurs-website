const moments = [
  ['THE FIRST BITE.', 'BECK BAGAN KIND OF HAPPY.', 'A woman in a mustard kurta taking a bite of a burger, with Kolkata shutters and a yellow taxi behind her.'],
  ['BOOKS. BITES. REPEAT.', 'A COLLEGE STREET AFTERNOON.', 'A man in a red overshirt enjoying a burger beside Kolkata book stalls.'],
  ['THE GOOD AFTERNOON.', 'TAKE YOUR TIME. TAKE A BITE.', 'A woman in a cream and red sari enjoying a burger in an old Kolkata café.'],
  ['A RIVERSIDE CRUSH.', 'BIG APPETITE. BOTH HANDS.', 'A man with a burger beside the Hooghly, with Howrah Bridge behind him.'],
  ['THE USUAL, PLEASE.', 'GOOD FOOD HAS NO AGE LIMIT.', 'A man with glasses, a burger and a cup of chai beside green Kolkata shutters.'],
  ['RAIN CHECK? NEVER.', 'MONSOON MOOD. EXTRA FRIES.', 'A woman laughing with fries and a burger in a rainy Kolkata café.'],
  ['ONE MORE ROUND.', 'SAME CITY. A NEW FAVOURITE.', 'A woman with glasses taking a bite of a burger near Victoria Memorial.'],
];

export const campaign = moments.map(([caption, subtitle, alt], index) => ({
  src: `/assets/kolkata/kolkata-diner-${String(index + 1).padStart(2, '0')}.webp`,
  caption, subtitle, alt, credit: 'AI-created Kolkata campaign scene · fictional people, not customer testimonials.',
  rotation: [-5, 4, -3, 5, -4, 3, -5][index],
}));

export const cityPhotos = [
  { src: '/assets/kolkata/college-street.webp', caption: 'THE CITY TAKES THE LONG WAY.', alt: 'Yellow taxis and the everyday bustle of College Street, Kolkata.', credit: 'Billjones94 · CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Yellow_taxi_at_College_Street.jpg', license: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  { src: '/assets/kolkata/victoria-memorial.webp', caption: 'ROOM FOR A LITTLE WONDER.', alt: 'Visitors and the gardens at Victoria Memorial in Kolkata.', credit: 'Vyacheslav Argenberg · CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Victoria_Memorial,_Visitors,_Kolkata,_India.jpg', license: 'https://creativecommons.org/licenses/by/4.0/' },
];

// Canonical public posts found through Firecrawl. Original-host playback retains attribution.
export const founderPosts = [
  { id: 'DCjAOJ_vgBD', title: 'ANDRE IN THE KITCHEN.', url: 'https://www.instagram.com/p/DCjAOJ_vgBD/', image: '/assets/founder/food-story-source.jpg', year: '2024' },
  { id: 'CmtFT3wMWNc', title: 'WELCOME TO THE SMASH CLUB.', url: 'https://www.instagram.com/reel/CmtFT3wMWNc/', image: '/assets/founder/smash-club-source.jpg', year: '2022' },
  { id: 'CkKnKKCPzfk', title: 'FROM DRE’S FEED.', url: 'https://www.instagram.com/reel/CkKnKKCPzfk/', image: '/assets/founder/burger-social-source.jpg', year: '2022' },
  { id: 'CjZwS8yOzkn', title: 'FROM THE FOOD COMMUNITY.', url: 'https://www.instagram.com/reel/CjZwS8yOzkn/', image: '/assets/founder/kitchen-reel-source.jpg', year: '2022' },
];
