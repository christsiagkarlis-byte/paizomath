(() => {
  'use strict';

  // The child-only session starts after the parent PIN has unlocked the
  // profile picker. It ends when the child chooses Exit or reaches Home.
  let childGameMode = false;
  let exiting = false;
  const CHILD_SESSION_KEY = 'paizomath.child-game-session';

  const app = document.getElementById('app');

  const isChildPicker = () => Boolean(app?.querySelector('.child-profile-picker'));
  const isHome = () => Boolean(app?.querySelector('.hero'));
  const isGamePage = () => Boolean(
    app?.querySelector('.app-shell, .quiz-page, .result-page'),
  );

  const exitApplication = () => {
    if (exiting) return;
    exiting = true;
    sessionStorage.removeItem(CHILD_SESSION_KEY);
    document.body.classList.remove('child-game-mode');

    // Return directly to the protected parent PIN screen. Do not expose the
    // public Home screen or the presentation to the child after Exit.
    sessionStorage.setItem('paizomath.parent-pin-request', '1');
    const pinButton = document.createElement('button');
    pinButton.type = 'button';
    pinButton.dataset.route = 'child-access';
    pinButton.hidden = true;
    app?.appendChild(pinButton);
    pinButton.click();
    pinButton.remove();
    childGameMode = false;
    exiting = false;
  };

  const applyChildGameMode = () => {
    if (!app) return;

    if (isChildPicker()) childGameMode = true;
    if (isHome()) childGameMode = false;

    const active = childGameMode && isGamePage();
    document.body.classList.toggle('child-game-mode', active);
    if (!active) return;

    const desktopBrand = app.querySelector('.bar .brand');
    if (desktopBrand && !desktopBrand.matches('[data-game-exit="true"]')) {
      desktopBrand.classList.add('child-exit-control');
      desktopBrand.setAttribute('aria-label', 'Έξοδος');
      desktopBrand.innerHTML = '<span>Έξοδος</span>';
      desktopBrand.dataset.gameExit = 'true';
    }

    const quizExit = app.querySelector('.quiz-header > button:first-child');
    if (quizExit && !quizExit.matches('[data-game-exit="true"]')) {
      quizExit.classList.add('child-exit-control');
      quizExit.textContent = 'Έξοδος';
      quizExit.setAttribute('aria-label', 'Έξοδος');
      quizExit.dataset.gameExit = 'true';
      quizExit.removeAttribute('data-route');
    }
  };

  document.addEventListener('click', (event) => {
    const profile = event.target instanceof Element
      ? event.target.closest('[data-select-profile]')
      : null;
    if (profile) sessionStorage.setItem(CHILD_SESSION_KEY, '1');

    const target = event.target instanceof Element
      ? event.target.closest('[data-game-exit]')
      : null;
    if (target) {
      event.preventDefault();
      event.stopImmediatePropagation();
      exitApplication();
      return;
    }

    // The main app renders the game after handling the profile tap. Run the
    // child-mode decoration after that render without observing every DOM
    // mutation, which is safer on slower mobile browsers.
    window.setTimeout(applyChildGameMode, 0);
  }, true);

  // Some Android WebViews show the pressed state but do not dispatch the
  // delegated click reliably. Give profile buttons a one-shot fallback after
  // the pointer is released; if the normal click already worked, the picker
  // is gone and nothing is triggered.
  document.addEventListener('pointerup', (event) => {
    const profile = event.target instanceof Element
      ? event.target.closest('[data-select-profile]')
      : null;
    if (!profile) return;
    window.setTimeout(() => {
      if (app?.contains(profile) && isChildPicker()) profile.click();
    }, 180);
  }, true);

  // The main app starts from Home after a full reload. Restore the child
  // session into the child game menu without storing the parent's PIN.
  if (sessionStorage.getItem(CHILD_SESSION_KEY) === '1' && isHome()) {
    childGameMode = true;
    const restoreButton = document.createElement('button');
    restoreButton.type = 'button';
    restoreButton.dataset.route = 'play';
    restoreButton.hidden = true;
    app.appendChild(restoreButton);
    restoreButton.click();
    restoreButton.remove();
  }

  applyChildGameMode();
})();
