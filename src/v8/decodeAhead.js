// Decode images in idle time as soon as they finish downloading, so the expensive decode
// doesn't land in the middle of a scroll frame when the image first appears on screen.
const idle = window.requestIdleCallback || (cb => setTimeout(cb, 60));
export function startDecodeAhead() {
  const onLoad = e => {
    const img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.decoded) return;
    img.dataset.decoded = '1';
    idle(() => { img.decode?.().catch(() => {}); }, { timeout: 800 });
  };
  document.addEventListener('load', onLoad, true);
  return () => document.removeEventListener('load', onLoad, true);
}
