(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  function reveal(section) {
    if (reduced.matches || !section.animate) return;
    const animation = section.animate([
      { transform: 'translateY(8px)' },
      { transform: 'translateY(0)' }
    ], { duration: 400, easing: 'cubic-bezier(.2,.7,.2,1)' });
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  reduced.addEventListener('change', () => {
    if (reduced.matches) running.forEach(animation => animation.cancel());
  });
  const hero = document.getElementById('hero');
  // Keep the first screen and partner logos still and immediately visible.

  if ('IntersectionObserver' in window) {
    const warm = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.loading = 'eager';
      warm.unobserve(entry.target);
    }), { rootMargin: '600px 0px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(img => warm.observe(img));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const img = entry.target.querySelector('img');
        // Do not start a late animation while someone is already reading.
        if (img.complete && img.naturalWidth) reveal(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -35px 0px' });
    document.querySelectorAll('#intro, #guests, #members, #hotels').forEach(s => {
      if (s.getBoundingClientRect().top >= innerHeight) observer.observe(s);
    });
  }

  const nav = document.querySelector('.floating-nav');
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  const conditions = document.getElementById('text-version');
  const mobile = matchMedia('(max-width: 900px)');
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.prepend(indicator);
  let lastY = scrollY, travel = 0, hidden = false, holdUntil = 0;
  let scheduled = false;
  function updateNav() {
    scheduled = false;
    const delta = scrollY - lastY;
    lastY = scrollY;
    if (delta) travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
    if (travel > 36) hidden = true;
    if (travel < -12) hidden = false;
    const focused = nav.contains(document.activeElement);
    nav.classList.toggle('is-visible', focused || (hero.getBoundingClientRect().bottom < 80 && (!mobile.matches || !hidden || performance.now() < holdUntil)));
    let active = null;
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= Math.max(110, innerHeight * .3)) active = section.id;
    });
    let current;
    links.forEach(link => {
      if (link.hash === '#' + active) {
        link.setAttribute('aria-current', 'location');
        current = link;
      }
      else link.removeAttribute('aria-current');
    });
    indicator.style.opacity = current ? '1' : '0';
    if (current) {
      indicator.style.width = current.offsetWidth + 'px';
      indicator.style.transform = `translateX(${current.offsetLeft}px)`;
    }
  }
  function scheduleNav() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNav); }
  }
  addEventListener('scroll', scheduleNav, { passive: true });
  addEventListener('resize', scheduleNav);
  function openConditions() {
    if (location.hash === '#text-version') conditions.open = true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.hash === '#text-version') conditions.open = true;
    holdUntil = performance.now() + 1200;
    hidden = false;
    travel = 0;
    scheduleNav();
  });
  addEventListener('hashchange', openConditions);
  nav.addEventListener('focusin', scheduleNav);
  nav.addEventListener('focusout', scheduleNav);
  // Font loading can change link widths after the initial layout.
  if (document.fonts) document.fonts.ready.then(scheduleNav);
  openConditions();
  updateNav();
})();
