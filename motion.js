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
  const update = () => {
    scheduled = false;
    const sticky = getComputedStyle(header).position === 'sticky';
    const height = sticky ? header.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
    let current = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= height + 80) current = index;
    });
    // The final section may be too short to reach the top of the viewport.
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections.length - 1;
    }
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
