(() => {
  'use strict';

  const unlockAudio = () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    try {
      const context = window.__paizoAudioContext || (window.__paizoAudioContext = new Context());
      if (context.state === 'suspended') void context.resume();
    } catch { /* audio remains optional */ }
  };

  // Unlock Web Audio in the original touch/mouse gesture for iOS, Android,
  // Chrome, Firefox, Windows and WebViews.
  document.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && event.target.closest('.answer')) unlockAudio();
  }, true);
  document.addEventListener('touchstart', (event) => {
    if (event.target instanceof Element && event.target.closest('.answer')) unlockAudio();
  }, { capture: true, passive: true });

  document.addEventListener('click', (event) => {
    const answer = event.target instanceof Element ? event.target.closest('.answer') : null;
    if (!answer || answer.disabled) return;
    window.setTimeout(() => {
      const card = document.querySelector('.question-card');
      if (!card?.classList.contains('answered-correct')) return;
      document.body.classList.add('answer-celebration');
      window.setTimeout(() => document.body.classList.remove('answer-celebration'), 650);
    }, 35);
  }, true);
})();
