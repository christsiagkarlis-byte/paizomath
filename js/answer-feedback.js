(() => {
  'use strict';

  let context = null;
  const getContext = () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    try {
      if (!context) context = window.__paizoAudioContext || (window.__paizoAudioContext = new Context());
      if (context.state === 'suspended') void context.resume();
      return context;
    } catch { return null; }
  };
  const enabled = () => {
    const toggle = document.getElementById('sound-toggle');
    return !toggle || toggle.getAttribute('aria-pressed') !== 'false';
  };
  const speakFeedback = (correct) => {
    if (!enabled() || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const selectedLanguage = localStorage.getItem('paizomath.portable.language.v3')
        || document.querySelector('.language button.active')?.dataset.language
        || (document.documentElement.lang === 'en' ? 'en' : 'el');
      const isEnglish = selectedLanguage === 'en';
      const message = isEnglish
        ? (correct ? 'Well done! Congratulations!' : 'Good try! Try again.')
        : (correct ? 'Μπράβο! Συγχαρητήρια!' : 'Καλή προσπάθεια! Ξαναδοκίμασε.');
      const voice = new SpeechSynthesisUtterance(message);
      voice.lang = isEnglish ? 'en-US' : 'el-GR';
      voice.rate = 0.92;
      voice.pitch = correct ? 1.12 : 1;
      voice.volume = 1;
      window.speechSynthesis.speak(voice);
    } catch { /* speech is optional and must never interrupt the game */ }
  };
  const note = (frequency, duration, type = 'sine') => {
    const audio = getContext();
    if (!audio || !enabled()) return;
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.linearRampToValueAtTime(.045, now + .01);
    gain.gain.linearRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  };
  const play = (correct) => {
    if (!enabled()) return;
    const notes = correct ? [[523.25, 0, .14], [659.25, .11, .14], [783.99, .22, .23]] : [[260, 0, .14], [190, .12, .2]];
    const audio = getContext();
    if (!audio) return;
    const now = audio.currentTime;
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

  const unlockAndPrime = (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('.answer')) return;
    // Creating/resuming and briefly touching the audio graph here is required
    // by iOS Safari and strict Android WebViews before delayed feedback plays.
    getContext();
    note(440, .035);
  };
  document.addEventListener('pointerdown', unlockAndPrime, true);
  document.addEventListener('touchstart', unlockAndPrime, { capture: true, passive: true });

  document.addEventListener('click', (event) => {
    const answer = event.target instanceof Element ? event.target.closest('.answer') : null;
    if (!answer || answer.disabled) return;
    window.setTimeout(() => {
      const card = document.querySelector('.question-card');
      if (card?.classList.contains('answered-correct')) {
        play(true);
        speakFeedback(true);
        document.body.classList.add('answer-celebration');
        window.setTimeout(() => document.body.classList.remove('answer-celebration'), 650);
      } else if (card?.classList.contains('answered-wrong')) {
        play(false);
        speakFeedback(false);
      }
    }, 45);
  }, true);
})();
