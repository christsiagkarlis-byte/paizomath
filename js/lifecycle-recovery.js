(() => {
  'use strict';

  let recoveryScheduled = false;
  const RECOVERY_KEY = 'paizomath.blank-screen-recovery';

  const appIsBlank = () => {
    const app = document.getElementById('app');
    if (!app) return true;
    return !app.children.length || app.textContent.trim().length < 8;
  };

  const recoverIfBlank = () => {
    recoveryScheduled = false;
    if (document.visibilityState === 'hidden' || !appIsBlank()) return;
    if (sessionStorage.getItem(RECOVERY_KEY) === '1') return;
    sessionStorage.setItem(RECOVERY_KEY, '1');
    window.location.reload();
  };

  const scheduleRecoveryCheck = () => {
    if (recoveryScheduled) return;
    recoveryScheduled = true;
    window.setTimeout(recoverIfBlank, 700);
  };

  window.addEventListener('pageshow', scheduleRecoveryCheck);
  window.addEventListener('focus', scheduleRecoveryCheck);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleRecoveryCheck();
  });

  // Clear the one-reload guard after a successful, non-blank render.
  window.setTimeout(() => {
    if (!appIsBlank()) sessionStorage.removeItem(RECOVERY_KEY);
  }, 1600);
})();
