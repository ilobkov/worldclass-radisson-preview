/* No analytics SDK or third-party requests are loaded here.
 * Existing site analytics can consume the radisson_action dataLayer events
 * or window's radisson:action event. See the deployment instructions.
 */
(() => {
  const allowedParameters = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const incoming = new URLSearchParams(location.search);
  document.querySelectorAll('a[data-outbound]').forEach(link => {
    const destination = new URL(link.href);
    for (const key of allowedParameters) {
      const value = incoming.get(key);
      if (value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
    }
    link.href = destination.href;
  });

  function track(action) {
    const event = { event: 'radisson_action', action, campaign: 'radisson_2026' };
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(event);
    window.dispatchEvent(new CustomEvent('radisson:action', { detail: event }));
  }

  let toastTimer;
  let promoTimer;
  async function copyPromo() {
    try {
      await navigator.clipboard.writeText('Worldclass2026');
      const toast = document.getElementById('copy-status');
      toast.textContent = 'Промокод скопирован';
      const promo = document.querySelector('.promo-button');
      promo.classList.add('is-copied');
      promo.querySelector('.promo-label').textContent = '✓ Промокод скопирован';
      clearTimeout(promoTimer);
      promoTimer = setTimeout(() => {
        promo.classList.remove('is-copied');
        promo.querySelector('.promo-label').textContent = 'Промокод для бронирования';
      }, 2400);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.textContent = ''; }, 3000);
    } catch {
      const dialog = document.getElementById('copy-dialog');
      dialog.showModal();
      const field = document.getElementById('promo-code');
      field.focus();
      field.select();
    }
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    track(target.dataset.action);
    if (target.dataset.action === 'copy_promo') copyPromo();
  });
})();
