(() => {
  'use strict';

  let context = null;
  const getContext = () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    try {
      context ||= window.__paizoAudioContext || (window.__paizoAudioContext = new Context());
      if (context.state === 'suspended') void context.resume();
      return context;
    } catch { return null; }
  };

  const enabled = () => {
    const toggle = document.getElementById('sound-toggle');
    return !toggle || toggle.getAttribute('aria-pressed') !== 'false';
  };

  const play = (correct) => {
    if (!enabled()) return;
    const audio = getContext();
    if (!audio) return;
    const now = audio.currentTime;
    const notes = correct
      ? [[523.25, 0, .16], [659.25, .11, .16], [783.99, .22, .25]]
      : [[260, 0, .14], [190, .12, .2]];
    notes.forEach(([frequency, start, duration]) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = correct ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, now + start);
      gain.gain.setValueAtTime(.0001, now + start);
      gain.gain.linearRampToValueAtTime(.07, now + start + .015);
      gain.gain.linearRampToValueAtTime(.0001, now + start + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + duration + .03);
    });
  };

  const unlock = (event) => {
    if (event.target instanceof Element && event.target.closest('.answer')) getContext();
  };
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('touchstart', unlock, { capture: true, passive: true });

  document.addEventListener('click', (event) => {
    const answer = event.target instanceof Element ? event.target.closest('.answer') : null;
    if (!answer || answer.disabled) return;
    window.setTimeout(() => {
      const card = document.querySelector('.question-card');
      if (card?.classList.contains('answered-correct')) {
        play(true);
        document.body.classList.add('answer-celebration');
        window.setTimeout(() => document.body.classList.remove('answer-celebration'), 650);
      } else if (card?.classList.contains('answered-wrong')) {
        play(false);
      }
    }, 45);
  }, true);
})();
