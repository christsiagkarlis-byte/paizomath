(() => {
  'use strict';

  // The child-only session starts after the parent PIN has unlocked the
  // profile picker. It ends when the child chooses Exit or reaches Home.
  let childGameMode = false;
  let exiting = false;

  const app = document.getElementById('app');

  const isChildPicker = () => Boolean(app?.querySelector('.child-profile-picker'));
  const isHome = () => Boolean(app?.querySelector('.hero'));
  const isGamePage = () => Boolean(
    app?.querySelector('.app-shell, .quiz-page, .result-page'),
  );

  const exitToHome = () => {
    if (exiting) return;
    exiting = true;
    document.body.classList.remove('child-game-mode');

    // Reuse the application's own route handling so the current session and
    // offline state remain intact. The temporary button is only a bridge for
    // the quiz screen, which otherwise has no Home route button.
    const homeButton = document.createElement('button');
    homeButton.type = 'button';
    homeButton.dataset.route = 'home';
    homeButton.hidden = true;
    app?.appendChild(homeButton);
    homeButton.click();
    homeButton.remove();

    window.setTimeout(() => {
      exiting = false;
      childGameMode = false;
    }, 0);
  };

  const applyChildGameMode = () => {
    if (!app) return;

    if (isChildPicker()) childGameMode = true;
    if (isHome()) childGameMode = false;

    const active = childGameMode && isGamePage();
    document.body.classList.toggle('child-game-mode', active);
    if (!active) return;

    const desktopBrand = app.querySelector('.bar .brand');
    if (desktopBrand) {
      desktopBrand.classList.add('child-exit-control');
      desktopBrand.setAttribute('aria-label', 'Έξοδος');
      desktopBrand.innerHTML = '<span>Έξοδος</span>';
      desktopBrand.dataset.gameExit = 'true';
    }

    const quizExit = app.querySelector('.quiz-header > button:first-child');
    if (quizExit) {
      quizExit.classList.add('child-exit-control');
      quizExit.textContent = 'Έξοδος';
      quizExit.setAttribute('aria-label', 'Έξοδος');
      quizExit.dataset.gameExit = 'true';
      quizExit.removeAttribute('data-route');
    }
  };

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('[data-game-exit]')
      : null;
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    exitToHome();
  }, true);

  new MutationObserver(applyChildGameMode).observe(app, {
    childList: true,
    subtree: true,
  });
  applyChildGameMode();
})();
