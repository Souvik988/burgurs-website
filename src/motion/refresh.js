import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Asset/font events share one layout refresh instead of refreshing once per image.
// A full ScrollTrigger.refresh() re-measures every trigger on the page, which is expensive on
// phones, so it never runs mid-scroll and is skipped when the page height hasn't changed.
let timer;
let lastHeight = 0;
let lastScroll = 0;
let forced = false;
if (typeof window !== 'undefined') addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });

function run() {
  if (!ScrollTrigger.getAll().length) return;
  if (performance.now() - lastScroll < 250) { timer = setTimeout(run, 260); return; }
  const height = document.documentElement.scrollHeight;
  if (!forced && height === lastHeight) return;
  forced = false;
  lastHeight = height;
  ScrollTrigger.refresh();
}

export function requestScrollRefresh(force = false) {
  if (force) forced = true;
  clearTimeout(timer);
  timer = setTimeout(run, 120);
}

// Route changes and resizes always need a real refresh.
ScrollTrigger.addEventListener('refresh', () => { lastHeight = document.documentElement.scrollHeight; });
