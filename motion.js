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
