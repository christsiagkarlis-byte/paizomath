(() => {
  'use strict';

  // Change this value on every new deployment.
  const APP_VERSION = '2026.09.05';
  const VERSION_KEY = 'paizomath.last-seen-version';
  const DISMISSED_KEY = 'paizomath.dismissed-update-version';

  const banner = document.getElementById('update-banner');
  const updateNowButton = document.getElementById('update-now');
  const updateLaterButton = document.getElementById('update-later');

  if (!banner || !updateNowButton || !updateLaterButton) {
    return;
  }

  const showBanner = () => {
    banner.hidden = false;
  };

  const hideBanner = () => {
    banner.hidden = true;
  };

  const checkSavedVersion = () => {
    const lastSeenVersion = localStorage.getItem(VERSION_KEY);
    const dismissedVersion = localStorage.getItem(DISMISSED_KEY);

    if (!lastSeenVersion) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      return;
    }

    if (lastSeenVersion !== APP_VERSION && dismissedVersion !== APP_VERSION) {
      showBanner();
    }
  };

  const clearOldCachesWithoutTouchingUserData = async () => {
    if (!('caches' in window)) {
      return;
    }

    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith('paizomath-'))
        .filter((cacheName) => cacheName !== `paizomath-${APP_VERSION}`)
        .map((cacheName) => caches.delete(cacheName)),
    );
  };

  const reloadToNewVersion = async () => {
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    localStorage.removeItem(DISMISSED_KEY);
    await clearOldCachesWithoutTouchingUserData();
    window.location.reload();
  };

  updateNowButton.addEventListener('click', () => {
    void reloadToNewVersion();
  });

  updateLaterButton.addEventListener('click', () => {
    localStorage.setItem(DISMISSED_KEY, APP_VERSION);
    hideBanner();
  });

  checkSavedVersion();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('PaizoMath Service Worker registration failed:', error);
      });
    });
  }
})();
