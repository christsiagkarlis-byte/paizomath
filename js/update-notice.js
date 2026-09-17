(() => {
  'use strict';

  const RELOADED_KEY = 'paizomath-update-reloaded';
  const SHOW_KEY = 'paizomath-show-update-notice';
  const DELETE_KEY = 'paizomath-data-deleted';
  const wasReloadedForUpdate = sessionStorage.getItem(RELOADED_KEY) === '1';
  if (wasReloadedForUpdate) {
    sessionStorage.removeItem(RELOADED_KEY);
    sessionStorage.setItem(SHOW_KEY, '1');
  }

  const showNotice = (title, message, key) => {
    if (document.querySelector(`[data-notice="${key}"]`)) return;
    const notice = document.createElement('aside');
    notice.className = 'update-notice';
    notice.dataset.notice = key;
    notice.setAttribute('role', 'status');
    notice.innerHTML = `
      <div><strong>${title}</strong><span>${message}</span></div>
      <button type="button" aria-label="Κλείσιμο">Εντάξει</button>
    `;
    document.body.appendChild(notice);
    notice.querySelector('button')?.addEventListener('click', () => notice.remove());
  };

  const showUpdateNotice = () => {
    if (sessionStorage.getItem(SHOW_KEY) !== '1') return;
    sessionStorage.removeItem(SHOW_KEY);
    showNotice(
      'Η εφαρμογή ενημερώθηκε',
      'Έχεις πλέον την τελευταία έκδοση. Το PIN, τα προφίλ και η πρόοδος παραμένουν στη συσκευή.',
      'update',
    );
  };

  const showDeleteNotice = () => {
    if (sessionStorage.getItem(DELETE_KEY) !== '1') return;
    sessionStorage.removeItem(DELETE_KEY);
    showNotice(
      'Τα δεδομένα διαγράφηκαν',
      'Για πλήρη αφαίρεση, διέγραψε και τη συντόμευση από την αρχική οθόνη. Android: παρατεταμένο πάτημα → Κατάργηση. iPhone/iPad: παρατεταμένο πάτημα → Αφαίρεση από την οθόνη Αφετηρίας.',
      'delete',
    );
  };

  const nativeConfirm = window.confirm.bind(window);
  window.confirm = (message) => {
    const accepted = nativeConfirm(message);
    if (accepted) sessionStorage.setItem(DELETE_KEY, '1');
    return accepted;
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(showUpdateNotice, 350);
    window.setTimeout(showDeleteNotice, 250);
  });
  document.addEventListener('click', () => {
    window.setTimeout(showDeleteNotice, 150);
  }, true);
  window.setTimeout(showUpdateNotice, 700);
})();
