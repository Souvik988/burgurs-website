// One-shot "the preloader has gone" signal, so first-screen entrances play
// when they can actually be seen instead of behind the loading screen.
let ready = false;
const waiting = new Set();

export function markSiteReady() {
  if (ready) return;
  ready = true;
  document.documentElement.dataset.siteReady = 'true';
  waiting.forEach(cb => cb());
  waiting.clear();
}

export function whenSiteReady(cb) {
  if (ready) { cb(); return () => {}; }
  waiting.add(cb);
  return () => waiting.delete(cb);
}

export const isSiteReady = () => ready;
