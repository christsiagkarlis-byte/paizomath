(() => {
  'use strict';

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
