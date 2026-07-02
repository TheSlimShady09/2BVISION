import { clsx } from "clsx"
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Scroll to an in-page section reliably across browsers.
 *
 * `element.scrollIntoView({ behavior: 'smooth' })` silently does nothing on
 * several Android browsers (Samsung Internet, Xiaomi/MIUI), so tapping a nav
 * link appeared to do nothing on those phones. This computes the target
 * position manually, offsets for the fixed navbar, and falls back to an
 * instant jump when smooth scrolling isn't supported — so it ALWAYS reacts.
 *
 * @param {string} id - The id of the target section.
 * @returns {boolean} true if the target element was found.
 */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return false;

  // Offset for the fixed navbar so the section isn't hidden underneath it.
  const nav = document.querySelector('nav');
  const offset = nav ? nav.offsetHeight : 0;

  const top =
    el.getBoundingClientRect().top +
    (window.pageYOffset || document.documentElement.scrollTop || 0) -
    offset;

  const supportsSmooth =
    'scrollBehavior' in document.documentElement.style;

  if (supportsSmooth) {
    try {
      window.scrollTo({ top, left: 0, behavior: 'smooth' });
      return true;
    } catch {
      // fall through to the instant jump below
    }
  }

  // Legacy / unsupported browsers: jump instantly so the tap still works.
  window.scrollTo(0, top);
  return true;
}
