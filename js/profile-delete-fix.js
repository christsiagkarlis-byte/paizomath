(() => {
  'use strict';

  const STORAGE_KEY = 'paizomath.portable.family.v3';
  const CHILD_ACTIVE_KEY = 'paizomath.child-session-active';

  document.addEventListener('click', (event) => {
    const control = event.target instanceof Element
      ? event.target.closest('[data-delete-profile]') : null;
    if (!control) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const id = control.dataset.deleteProfile;
    try {
      const family = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!Array.isArray(family.profiles) || family.profiles.length <= 1) return;
      const remaining = family.profiles.filter((profile) => profile.id !== id);
      if (!remaining.length) return;
      family.profiles = remaining;
      if (family.activeId === id) family.activeId = remaining[0].id;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(family));
      localStorage.removeItem(CHILD_ACTIVE_KEY);
      sessionStorage.removeItem('paizomath.child-game-session');
      window.location.reload();
    } catch {
      // Leave the existing application handler available if storage is unavailable.
    }
  }, true);
})();
