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
    return { rounds, correct, mistakes, accuracy: Math.min(100, Math.round((correct / possible) * 100)), stars: Number(profile.stars) || 0 };
  };
  const getProfiles = () => {
    const family = readFamily();
    return Array.isArray(family.profiles) ? family.profiles : [];
  };

  const exportPdf = () => {
    const profiles = getProfiles();
    const report = window.open('', '_blank');
    if (!report) return;
    const date = new Intl.DateTimeFormat('el-GR', { dateStyle: 'long' }).format(new Date());
    report.document.write(`<!doctype html><html lang="el"><head><meta charset="utf-8"><title>Αναφορά προόδου PaizoMath</title><style>
      @page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#173f46;background:#fff;font-family:Arial,Helvetica,sans-serif}header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:3px solid #e46a4d;padding-bottom:15px;margin-bottom:22px}h1{margin:0;font-size:26px}h2{margin:0 0 5px;font-size:20px}h3{margin:0;font-size:16px}.muted{color:#607872;font-size:11px;line-height:1.5}.date{color:#607872;font-size:11px;text-align:right}.card{page-break-inside:avoid;border:1px solid #d7e9df;border-radius:14px;padding:16px;margin:0 0 14px;background:#f7fcf8}.top{display:flex;justify-content:space-between;align-items:center;gap:12px}.age{color:#607872;font-size:11px;margin-top:4px}.score{color:#d85c4a;font-size:24px;font-weight:900}.bar{height:10px;border-radius:20px;background:#e1eee7;overflow:hidden;margin:15px 0 12px}.bar span{display:block;height:100%;background:#43ad80;border-radius:inherit}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.metric{padding:9px 4px;text-align:center;border-radius:8px;background:#fff}.metric b,.metric small{display:block}.metric b{font-size:16px}.metric small{color:#607872;font-size:9px;margin-top:3px}.topics{margin-top:13px;border-top:1px solid #dfece5;padding-top:10px}.topic{display:flex;justify-content:space-between;font-size:10px;margin:5px 0}.footer{margin-top:26px;color:#607872;font-size:10px;line-height:1.5}@media print{.no-print{display:none}}
    </style></head><body><header><div><h1>Αναφορά προόδου παιδιού</h1><div class="muted">PaizoMath · Τοπική αναφορά για γονείς</div></div><div class="date">${escapeHtml(date)}<br>Τα δεδομένα παραμένουν στη συσκευή</div></header>${profiles.map((profile) => {
      const stats = profileStats(profile);
      const cycles = profile.questionCycles && typeof profile.questionCycles === 'object' ? Object.entries(profile.questionCycles).slice(0, 8) : [];
      return `<section class="card"><div class="top"><div><h2>${escapeHtml(profile.name || 'Προφίλ')}</h2><div class="age">${escapeHtml(String(profile.age || ''))} ετών</div></div><div class="score">${stats.accuracy}%</div></div><div class="bar"><span style="width:${stats.accuracy}%"></span></div><div class="metrics"><div class="metric"><b>${stats.rounds}</b><small>γύροι</small></div><div class="metric"><b>${stats.correct}</b><small>σωστές</small></div><div class="metric"><b>${stats.mistakes}</b><small>λάθη</small></div><div class="metric"><b>${stats.stars}</b><small>αστέρια</small></div></div>${cycles.length ? `<div class="topics"><h3>Επιδόσεις ανά μάθημα</h3>${cycles.map(([topic, value]) => `<div class="topic"><span>${escapeHtml(topicNames[topic] || topic)}</span><b>${typeof value === 'number' ? value : Number(value?.correct || 0)}</b></div>`).join('')}</div>` : ''}</section>`;
    }).join('')}<p class="footer">Η αναφορά δημιουργήθηκε τοπικά από τη συσκευή του γονέα. Δεν αποστέλλεται σε διακομιστή και δεν αποτελεί επίσημη αξιολόγηση.</p><button class="no-print" onclick="window.print()">Εκτύπωση / Αποθήκευση ως PDF</button></body></html>`);
    report.document.close();
    report.focus();
    window.setTimeout(() => report.print(), 350);
  };

  const render = () => {
    if (!app?.querySelector('.parent-page') || app.querySelector('[data-parent-stats]')) return;
    const profiles = getProfiles();
    if (!profiles.length) return;
    const panel = document.createElement('section');
    panel.className = 'parent-stats-panel';
    panel.dataset.parentStats = 'true';
    panel.innerHTML = `<div class="parent-stats-heading"><div><div class="eyebrow">ΠΑΡΑΚΟΛΟΥΘΗΣΗ ΠΡΟΟΔΟΥ</div><h2>Η πορεία του παιδιού</h2><p>Μια ήρεμη εικόνα της προσπάθειας, χωρίς πίεση. Οι επιδόσεις αποθηκεύονται μόνο σε αυτή τη συσκευή.</p></div><div class="parent-stats-actions"><span class="parent-stats-badge">Τοπικά δεδομένα</span><button type="button" class="button quiet small" data-export-stats>Εξαγωγή PDF</button></div></div><div class="parent-stats-grid">${profiles.map((profile) => {
      const stats = profileStats(profile);
      const message = stats.rounds === 0 ? 'Έτοιμος/η για την πρώτη ανακάλυψη.' : stats.accuracy >= 80 ? 'Εξαιρετική σταθερότητα!' : stats.accuracy >= 50 ? 'Όμορφη πρόοδος — συνεχίζουμε.' : 'Κάθε προσπάθεια είναι ένα βήμα.';
      const cycles = profile.questionCycles && typeof profile.questionCycles === 'object' ? Object.entries(profile.questionCycles).slice(0, 4) : [];
      return `<article class="child-stat-card"><div class="child-stat-top"><div class="child-stat-avatar">${escapeHtml((profile.name || '?').slice(0, 1).toUpperCase())}</div><div><h3>${escapeHtml(profile.name || 'Προφίλ')}</h3><span>${escapeHtml(String(profile.age || ''))} ετών</span></div><strong>${stats.accuracy}%</strong></div><div class="stat-progress"><span style="width:${stats.accuracy}%"></span></div><p class="child-stat-message">${message}</p><div class="child-stat-metrics"><span><b>${stats.rounds}</b><small>γύροι</small></span><span><b>${stats.correct}</b><small>σωστές</small></span><span><b>${stats.mistakes}</b><small>λάθη</small></span><span><b>${stats.stars}</b><small>αστέρια</small></span></div>${cycles.length ? `<div class="topic-stat-list">${cycles.map(([topic, value]) => `<span><em>${escapeHtml(topicNames[topic] || topic)}</em><b>${typeof value === 'number' ? value : Number(value?.correct || 0)}</b></span>`).join('')}</div>` : ''}</article>`;
    }).join('')}</div>`;
    app.querySelector('.parent-grid')?.before(panel);
  };

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-export-stats]')) exportPdf();
    window.setTimeout(render, 0);
  }, true);
  window.setTimeout(render, 500);
})();
