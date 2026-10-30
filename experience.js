(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const appear = [...document.querySelectorAll('.card,.beneficio-item,.new-models article,.product-rail article,.galeria a,.new-social .container,.new-indicators h2')];
  appear.forEach((el, index) => { el.classList.add('reveal'); el.style.setProperty('--delay', `${Math.min(index % 4, 3) * 85}ms`); });
  const show = el => el.classList.add('visible');
  if (!('IntersectionObserver' in window) || reduced) appear.forEach(show);
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { show(entry.target); observer.unobserve(entry.target); }
    }), {threshold: .12, rootMargin: '0px 0px -30px 0px'});
    appear.forEach(el => observer.observe(el));
  }
  const counters = [...document.querySelectorAll('[data-count]')];
  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    const goal = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    if (reduced) {el.textContent = goal.toLocaleString('pt-BR') + suffix; return;}
    const start = performance.now(), duration = 1450;
    const tick = now => {
      const p = Math.min(1, (now-start)/duration), eased = 1-Math.pow(1-p, 4);
      el.textContent = Math.round(goal*eased).toLocaleString('pt-BR') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  if (!('IntersectionObserver' in window)) counters.forEach(animateCounter);
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {animateCounter(entry.target); observer.unobserve(entry.target);}
    }), {threshold:.35});
    counters.forEach(el=>observer.observe(el));
  }
})();
