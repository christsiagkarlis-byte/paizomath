(() => {
  'use strict';

  let deferredPrompt = null;
  let promptConsumed = false;
  let unlockedPickerMarkup = null;
  let parentLandingMode = false;
  const app = document.getElementById('app');
  const PARENT_EXIT_KEY = 'paizomath.parent-pin-request';
  const isEnglish = () => localStorage.getItem('paizomath.portable.language.v3') === 'en';

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

  const isParentPickerScreen = () => Boolean(
    app?.querySelector('.child-profile-picker'),
  );
  const isParentLandingScreen = () => Boolean(
    parentLandingMode && app?.querySelector('.hero'),
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
    if (isEnglish()) {
      if (isIOS) return 'In Safari: Share (□↑) → Add to Home Screen → Add.';
      if (isAndroid && isFirefox) return 'In Firefox: ⋮ → Install or Add to Home screen → Add.';
      if (isAndroid) return 'In Chrome: ⋮ → Add to Home screen → Add. This is not an APK.';
      return 'In your browser: page menu → Install app or Add to Home screen.';
    }
    if (isIOS) return 'Σε Safari: Κοινοποίηση (□↑) → Προσθήκη στην οθόνη Αφετηρίας → Προσθήκη.';
    if (isAndroid && isFirefox) return 'Σε Firefox: ⋮ → Εγκατάσταση ή Προσθήκη στην αρχική οθόνη → Προσθήκη.';
    if (isAndroid) return 'Σε Chrome: ⋮ → Προσθήκη στην αρχική οθόνη → Προσθήκη. Δεν είναι APK.';
    return 'Στον browser: μενού σελίδας → Εγκατάσταση εφαρμογής ή Προσθήκη στην αρχική οθόνη.';
  };

  const installHost = () => {
    if (isParentLandingScreen()) return app.querySelector('.hero-actions');
    if (isParentPickerScreen()) return app.querySelector('.child-profile-picker')?.parentElement;
    return null;
  };

  const renderInstallControl = () => {
    if (!app || (!isParentPickerScreen() && !isParentLandingScreen()) || isStandalonePWA()) return;
    if (app.querySelector('[data-pwa-install]')) return;
    const host = installHost();
    if (!host) return;
    const panel = document.createElement('section');
    panel.className = 'pwa-install-panel';
    panel.innerHTML = isEnglish() ? `
      <strong>Parent: add the shortcut to the device</strong>
      <p>This is not an APK. It is the offline app on the Home Screen.</p>
      <button type="button" class="button coral" data-pwa-install>Add to Home Screen</button>
      <small data-pwa-install-help hidden></small>
    ` : `
      <strong>Γονέας: βάλε τη συντόμευση στο κινητό</strong>
      <p>Δεν είναι APK. Είναι η offline εφαρμογή στην αρχική οθόνη.</p>
      <button type="button" class="button coral" data-pwa-install>Προσθήκη στην αρχική οθόνη</button>
      <small data-pwa-install-help hidden></small>
    `;
    host.appendChild(panel);
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
      help.textContent = isEnglish()
        ? `${installInstructions()} Then open the shortcut from the Home Screen.`
        : `${installInstructions()} Μετά άνοιξε τη συντόμευση από την αρχική οθόνη.`;
    });
  };

  const showParentLanding = () => {
    if (!app || !isParentPickerScreen() || !app.querySelector('[data-select-profile]')) return;
    unlockedPickerMarkup = app.innerHTML;
    parentLandingMode = true;
    const homeButton = document.createElement('button');
    homeButton.type = 'button';
    homeButton.dataset.route = 'home';
    homeButton.hidden = true;
    app.appendChild(homeButton);
    homeButton.click();
    homeButton.remove();
    window.setTimeout(renderInstallControl, 0);
  };

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-route]') : null;
    if (target?.dataset.route === 'child-access' && sessionStorage.getItem(PARENT_EXIT_KEY) === '1') {
      sessionStorage.removeItem(PARENT_EXIT_KEY);
      parentLandingMode = false;
      unlockedPickerMarkup = null;
    }
    if (target?.dataset.route === 'child-access' && parentLandingMode && unlockedPickerMarkup) {
      event.preventDefault();
      event.stopImmediatePropagation();
      app.innerHTML = unlockedPickerMarkup;
      window.setTimeout(renderInstallControl, 0);
      return;
    }

    window.setTimeout(() => {
      if (isParentPickerScreen() && app.querySelector('[data-select-profile]')
        && !parentLandingMode && !unlockedPickerMarkup
        && !app.querySelector('#unlock-child-access')) {
        showParentLanding();
      } else {
        renderInstallControl();
      }
    }, 0);
  }, true);

  // The PIN handler finishes by rendering the unlocked child picker. Replace
  // that first unlocked render with the parent landing screen.
  window.setTimeout(() => {
    if (isParentPickerScreen() && app.querySelector('[data-select-profile]')
      && !parentLandingMode && !unlockedPickerMarkup
      && app.querySelector('#unlock-child-access')) {
      const pinButton = app.querySelector('#unlock-child-access');
      if (pinButton) {
        pinButton.addEventListener('click', () => window.setTimeout(showParentLanding, 0), { once: true });
      }
    }
    renderInstallControl();
  }, 400);
})();
