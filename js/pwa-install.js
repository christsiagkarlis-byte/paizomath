(() => {
  'use strict';

  let deferredPrompt = null;
  let promptConsumed = false;
  const app = document.getElementById('app');

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    promptConsumed = false;
    renderInstallControl();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    promptConsumed = true;
    renderInstallControl();
  });

  const isParentUnlockedScreen = () => Boolean(
    app?.querySelector('.child-profile-picker'),
  );

  const isStandalonePWA = () => Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches
      || window.matchMedia?.('(display-mode: fullscreen)').matches
      || window.navigator.standalone === true
      || document.referrer.startsWith('android-app://'),
  );

  const installInstructions = () => {
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isFirefox = /Firefox/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    if (isIOS) {
      return 'Σε Safari: πάτησε Κοινοποίηση (□↑) → Προσθήκη στην οθόνη Αφετηρίας → Προσθήκη.';
    }
    if (isAndroid && isFirefox) {
      return 'Σε Firefox: πάτησε ⋮ → Εγκατάσταση ή Προσθήκη στην αρχική οθόνη → Προσθήκη.';
    }
    if (isAndroid) {
      return 'Σε Chrome: πάτησε ⋮ → Προσθήκη στην αρχική οθόνη → Προσθήκη. Δεν είναι APK.';
    }
    return 'Στον browser: άνοιξε το μενού της σελίδας και επίλεξε Εγκατάσταση εφαρμογής ή Προσθήκη στην αρχική οθόνη.';
  };

  const renderInstallControl = () => {
    if (!app || !isParentUnlockedScreen() || isStandalonePWA()) return;
    if (app.querySelector('[data-pwa-install]')) return;

    const actions = app.querySelector('.child-profile-picker')?.parentElement;
    if (!actions) return;

    const panel = document.createElement('section');
    panel.className = 'pwa-install-panel';
    panel.innerHTML = `
      <strong>Γονέας: βάλε τη συντόμευση στο κινητό</strong>
      <p>Δεν είναι APK. Είναι η offline εφαρμογή στην αρχική οθόνη.</p>
      <button type="button" class="button coral" data-pwa-install>
        Προσθήκη στην αρχική οθόνη
      </button>
      <small data-pwa-install-help hidden></small>
    `;
    actions.insertBefore(panel, actions.firstChild);

    panel.querySelector('[data-pwa-install]')?.addEventListener('click', async () => {
      const button = panel.querySelector('[data-pwa-install]');
      const help = panel.querySelector('[data-pwa-install-help]');
      if (deferredPrompt && !promptConsumed) {
        promptConsumed = true;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        renderInstallControl();
        return;
      }

      button.hidden = true;
      help.hidden = false;
      help.textContent = `${installInstructions()} Μετά άνοιξε τη συντόμευση από την αρχική οθόνη.`;
    });
  };

  document.addEventListener('click', () => {
    window.setTimeout(renderInstallControl, 0);
  }, true);
  window.setTimeout(renderInstallControl, 400);
})();
