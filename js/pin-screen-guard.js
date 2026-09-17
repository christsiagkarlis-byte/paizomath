(() => {
  'use strict';

  const app = document.getElementById('app');
  const applyPinScreenGuard = () => {
    if (!app) return;
    const pinScreen = Boolean(app.querySelector('#unlock-pin'));
    document.body.classList.toggle('parent-pin-screen', pinScreen);
    const brand = app.querySelector('.bar .brand');
    if (brand) {
      brand.setAttribute('aria-hidden', pinScreen ? 'true' : 'false');
      brand.tabIndex = pinScreen ? -1 : 0;
      brand.style.pointerEvents = pinScreen ? 'none' : '';
      brand.style.visibility = pinScreen ? 'hidden' : '';
    }
  };

  document.addEventListener('click', () => window.setTimeout(applyPinScreenGuard, 0), true);
  window.setTimeout(applyPinScreenGuard, 250);
})();
