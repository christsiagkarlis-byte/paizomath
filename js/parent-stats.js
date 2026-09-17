(() => {
  'use strict';

  const STORAGE_KEY = 'paizomath.portable.family.v3';
  const app = document.getElementById('app');
  const topicNames = {
    math: 'Μαθηματικά', knowledge: 'Γνώσεις', language: 'Γλώσσα', science: 'Επιστήμες',
    history: 'Ιστορία', geography: 'Γεωγραφία', digital: 'Ψηφιακές δεξιότητες',
    arts: 'Καλλιτεχνικά και Μουσική', english: 'Αγγλικά',
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[char]));

  const readFamily = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  };

  const profileStats = (profile) => {
    const rounds = Number(profile.rounds) || 0;
    const correct = Number(profile.correct) || 0;
    const mistakes = Number(profile.mistakes) || 0;
    const possible = Math.max(1, rounds * 10);
    const accuracy = Math.min(100, Math.round((correct / possible) * 100));
    return { rounds, correct, mistakes, accuracy, stars: Number(profile.stars) || 0 };
  };

  const render = () => {
    if (!app?.querySelector('.parent-page')) return;
    if (app.querySelector('[data-parent-stats]')) return;
    const family = readFamily();
    const profiles = Array.isArray(family.profiles) ? family.profiles : [];
    if (!profiles.length) return;

    const panel = document.createElement('section');
    panel.className = 'parent-stats-panel';
    panel.dataset.parentStats = 'true';
    panel.innerHTML = `
      <div class="parent-stats-heading">
        <div>
          <div class="eyebrow">ΠΑΡΑΚΟΛΟΥΘΗΣΗ ΠΡΟΟΔΟΥ</div>
          <h2>Η πορεία του παιδιού</h2>
          <p>Μια ήρεμη εικόνα της προσπάθειας, χωρίς πίεση. Οι επιδόσεις αποθηκεύονται μόνο σε αυτή τη συσκευή.</p>
        </div>
        <span class="parent-stats-badge">Τοπικά δεδομένα</span>
      </div>
      <div class="parent-stats-grid">
        ${profiles.map((profile) => {
          const stats = profileStats(profile);
          const message = stats.rounds === 0 ? 'Έτοιμος/η για την πρώτη ανακάλυψη.'
            : stats.accuracy >= 80 ? 'Εξαιρετική σταθερότητα!' : stats.accuracy >= 50 ? 'Όμορφη πρόοδος — συνεχίζουμε.' : 'Κάθε προσπάθεια είναι ένα βήμα.';
          const cycles = profile.questionCycles && typeof profile.questionCycles === 'object'
            ? Object.entries(profile.questionCycles).slice(0, 4) : [];
          return `<article class="child-stat-card">
            <div class="child-stat-top"><div class="child-stat-avatar">${escapeHtml((profile.name || '?').slice(0, 1).toUpperCase())}</div><div><h3>${escapeHtml(profile.name || 'Προφίλ')}</h3><span>${escapeHtml(String(profile.age || ''))} ετών</span></div><strong>${stats.accuracy}%</strong></div>
            <div class="stat-progress"><span style="width:${stats.accuracy}%"></span></div>
            <p class="child-stat-message">${message}</p>
            <div class="child-stat-metrics"><span><b>${stats.rounds}</b><small>γύροι</small></span><span><b>${stats.correct}</b><small>σωστές</small></span><span><b>${stats.mistakes}</b><small>λάθη</small></span><span><b>${stats.stars}</b><small>αστέρια</small></span></div>
            ${cycles.length ? `<div class="topic-stat-list">${cycles.map(([topic, value]) => `<span><em>${escapeHtml(topicNames[topic] || topic)}</em><b>${typeof value === 'number' ? value : Number(value?.correct || 0)}</b></span>`).join('')}</div>` : ''}
          </article>`;
        }).join('')}
      </div>`;
    const grid = app.querySelector('.parent-grid');
    grid?.before(panel);
  };

  document.addEventListener('click', () => window.setTimeout(render, 0), true);
  window.setTimeout(render, 500);
})();
