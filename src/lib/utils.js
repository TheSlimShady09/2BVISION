import { clsx } from "clsx"
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Scroll to an in-page section reliably across ALL browsers.
 *
 * Native `scrollIntoView({ behavior: 'smooth' })` and
 * `window.scrollTo({ behavior: 'smooth' })` are unreliable on several Android
 * browsers (Samsung Internet, Xiaomi/MIUI) — the animation silently does
 * nothing or stalls when the address bar shows/hides, so tapping a nav link
 * appeared dead on those phones. To avoid depending on native smooth scroll at
 * all, we animate the scroll ourselves with requestAnimationFrame, which
 * behaves identically everywhere. Also offsets for the fixed navbar.
 *
 * @param {string} id - The id of the target section.
 * @returns {boolean} true if the target element was found.
 */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return false;

  const getScrollTop = () =>
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  // Offset for the fixed navbar so the section isn't hidden underneath it.
  // NOTE: we must NOT use nav.offsetHeight — on mobile the open hamburger
  // menu is still in the DOM (animating closed) when this runs, so the <nav>
  // measures ~300px+ instead of the real bar. That over-offset made it stop
  // too high, showing only half the section. Use the fixed bar height instead.
  const NAVBAR_HEIGHT = 80; // must match the fixed bar (h-20) in Navbar.jsx
  const offset = NAVBAR_HEIGHT;

  const start = getScrollTop();
  const target = Math.max(
    0,
    el.getBoundingClientRect().top + start - offset
  );

  const distance = target - start;
  if (Math.abs(distance) < 2) return true;

  // Respect users who prefer reduced motion — jump instantly.
  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || typeof requestAnimationFrame !== 'function') {
    window.scrollTo(0, target);
    return true;
  }

  const duration = 500; // ms
  const startTime = performance.now();
  // easeInOutQuad
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const step = (now) => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    window.scrollTo(0, Math.round(start + distance * ease(t)));
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      // Layout can shift during the animation (mobile menu collapses, address
      // bar hides). Recompute from the element's live position and snap exactly.
      const finalTarget = Math.max(
        0,
        el.getBoundingClientRect().top + getScrollTop() - offset
      );
      window.scrollTo(0, Math.round(finalTarget));
    }
  };

  requestAnimationFrame(step);
  return true;
}
