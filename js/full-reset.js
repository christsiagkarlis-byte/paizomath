(() => {
  'use strict';

  const STORAGE_KEY = 'paizomath.portable.family.v3';
  const RESET_NOTICE_KEY = 'paizomath.reset-complete';
  const resetKeys = [
    STORAGE_KEY,
    'paizomath.portable.language.v3',
    'paizomath.portable.music.v3',
    'paizomath.child-game-session',
    'paizomath.child-session-active',
    'paizomath.parent-pin-request',
    'paizomath.last-seen-version',
    'paizomath.dismissed-update-version',
    'paizomath-show-update-notice',
    'paizomath-update-reloaded',
    'paizomath.blank-screen-recovery',
  ];

  const clearEverything = async () => {
    resetKeys.forEach((key) => localStorage.removeItem(key));
    Object.keys(localStorage).filter((key) => key.startsWith('paizomath.'))
      .forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
    sessionStorage.setItem(RESET_NOTICE_KEY, '1');

    if ('caches' in window) {
      try {
        const names = await caches.keys();
        await Promise.all(names.filter((name) => name.startsWith('paizomath-portable-'))
          .map((name) => caches.delete(name)));
      } catch { /* cache deletion is best effort */ }
    }
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      } catch { /* unregister is best effort */ }
    }
    window.location.replace('./index.html?reset=' + Date.now());
  };

  document.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('#delete-local-data') : null;
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const english = document.documentElement.lang === 'en';
    const confirmed = window.confirm(english
      ? 'Delete all PaizoMath profiles, PIN, progress and offline data from this device?'
      : 'Να διαγραφούν όλα τα προφίλ, το PIN, η πρόοδος και τα offline δεδομένα του PaizoMath από αυτή τη συσκευή;');
    if (confirmed) void clearEverything();
  }, true);
})();
