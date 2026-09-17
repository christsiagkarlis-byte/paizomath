(() => {
  'use strict';

  const STORAGE_KEY = 'paizomath.portable.family.v3';
  const isEnglish = () => localStorage.getItem('paizomath.portable.language.v3') === 'en';
  const removeUntouchedDefault = () => {
    try {
      const family = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const profile = family.profiles?.length === 1 ? family.profiles[0] : null;
      const untouched = profile && profile.id === 'explorer'
        && (profile.name === 'Μικρός Εξερευνητής' || profile.name === 'Little Explorer')
        && !profile.rounds && !profile.correct && !profile.mistakes && !profile.stars;
      if (!untouched) return false;
      family.profiles = [];
      family.activeId = null;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(family));
      return true;
    } catch { return false; }
  };

  if (removeUntouchedDefault()) {
    window.location.replace('./index.html?profiles-reset=' + Date.now());
    return;
  }

  const renderEmpty = () => {
    const app = document.getElementById('app');
    const picker = app?.querySelector('.child-profile-picker');
    if (!picker || picker.querySelector('[data-empty-profile-message]')) return;
    if (picker.querySelector('[data-select-profile]')) return;
    const english = isEnglish();
    const message = document.createElement('div');
    message.dataset.emptyProfileMessage = 'true';
    message.className = 'empty-profile-message';
    message.innerHTML = `<strong>${english ? 'No child profile yet' : 'Δεν υπάρχει ακόμη παιδικό προφίλ'}</strong><p>${english ? 'The parent must add the child’s name before the game can start.' : 'Ο γονέας πρέπει να προσθέσει το όνομα του παιδιού πριν ξεκινήσει το παιχνίδι.'}</p><button type="button" class="button coral" data-route="parent">${english ? 'Go to parent management' : 'Μετάβαση στη διαχείριση γονέα'}</button>`;
    picker.appendChild(message);
  };
  window.setTimeout(renderEmpty, 0);
  document.addEventListener('click', () => window.setTimeout(renderEmpty, 0), true);
})();
