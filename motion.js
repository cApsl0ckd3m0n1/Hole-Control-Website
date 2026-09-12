// Accessible disclosure menu, independent of the optional entrance animations.
(() => {
  const header = document.querySelector('header');
  const button = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-navigation');
  if (!header || !button || !nav) return;
  const mobile = window.matchMedia('(max-width: 48rem)');
  const close = (restoreFocus = false) => {
    button.setAttribute('aria-expanded', 'false');
    nav.hidden = mobile.matches;
    if (restoreFocus) button.focus();
  };
  const sync = () => {
    const focused = document.activeElement;
    button.hidden = !mobile.matches;
    close();
    if (mobile.matches && nav.contains(focused)) button.focus();
    else if (!mobile.matches && focused === button) nav.querySelector('a').focus();
  };
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    nav.hidden = !expanded;
  });
  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !mobile.matches) return;
    close();
    const target = document.getElementById(link.hash.slice(1));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobile.matches && !nav.hidden) close(true);
  });
  document.addEventListener('click', (event) => {
    if (mobile.matches && !header.contains(event.target)) close();
  });
  header.addEventListener('focusout', (event) => {
    if (mobile.matches && event.relatedTarget && !header.contains(event.relatedTarget)) close();
  });
  mobile.addEventListener('change', sync);
  header.classList.add('nav-ready');
  sync();
})();

// Content remains visible if scripting or animation support is unavailable.
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window) ||
      typeof Element.prototype.animate !== 'function') return;

  const running = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (preference.matches || entry.target.matches(':focus-within')) continue;
      const animation = entry.target.animate([
        { opacity: .55, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
      running.add(animation);
      const cleanup = () => running.delete(animation);
      animation.onfinish = cleanup;
      animation.oncancel = cleanup;
    }
  }, { threshold: .08 });

  document.querySelectorAll('.about > h2, .about > div, .section-heading, .life-lead, .life-details article, .columns article, .charter > div')
    .forEach((element) => observer.observe(element));

  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    observer.disconnect();
    running.forEach((animation) => animation.cancel());
    running.clear();
  });
})();

// Navigation remains functional with reduced motion and without animation APIs.
(() => {
  const header = document.querySelector('header');
  const links = [...document.querySelectorAll('nav a[href^="#"]')];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  if (!header || sections.some((section) => !section)) return;

  let scheduled = false;
  let lastHeight = -1;
  let lastCurrent = -2;
  const update = () => {
    scheduled = false;
    const sticky = getComputedStyle(header).position === 'sticky';
    const height = sticky ? header.getBoundingClientRect().height : 0;
    if (height !== lastHeight) {
      document.documentElement.style.setProperty('--header-height', `${height}px`);
      lastHeight = height;
    }
    let current = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= height + 80) current = index;
    });
    // The final section may be too short to reach the top of the viewport.
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections.length - 1;
    }
    if (current === lastCurrent) return;
    lastCurrent = current;
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(header);
  update();
})();

// Pointer depth runs only during desktop interaction; no background animation loop.
(() => {
  const surface = document.querySelector('.hero-visual');
  const art = document.querySelector('.hero-art');
  if (!surface || !art) return;
  const enabled = window.matchMedia('(min-width: 56.251rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let frame = null;
  let bounds = null;
  let x = 0;
  let y = 0;
  const reset = () => {
    if (bounds === null && frame === null) return;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    bounds = null;
    art.classList.remove('is-tilting');
    art.style.removeProperty('--tilt-x');
    art.style.removeProperty('--tilt-y');
  };
  surface.addEventListener('pointermove', (event) => {
    if (!enabled.matches || event.pointerType !== 'mouse') return;
    bounds ??= surface.getBoundingClientRect();
    x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      art.classList.add('is-tilting');
      art.style.setProperty('--tilt-x', `${(-y * 2).toFixed(2)}deg`);
      art.style.setProperty('--tilt-y', `${(x * 3).toFixed(2)}deg`);
    });
  }, { passive: true });
  surface.addEventListener('pointerleave', reset);
  surface.addEventListener('pointercancel', reset);
  window.addEventListener('scroll', reset, { passive: true });
  window.addEventListener('resize', reset);
  window.addEventListener('blur', reset);
  enabled.addEventListener('change', reset);
})();
