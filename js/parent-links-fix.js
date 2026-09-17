(() => {
  'use strict';

  const isParentLabel = (button) => {
    const text = (button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return text.includes('διαχείριση γονέα')
      || text.includes('για γονείς')
      || text.includes('parent management')
      || text.includes('for parents');
  };

  document.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (!button || !isParentLabel(button)) return;
    // Normalize every visible parent link before the app's route handler runs.
    button.dataset.route = 'parents';
  }, true);
})();
