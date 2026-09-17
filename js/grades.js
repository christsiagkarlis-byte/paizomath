(function () {
  'use strict';

  var STORAGE_KEY = 'paizomath-selected-grade';
  var grades = [
    { id: 'a', label: 'Α΄ Δημοτικού' },
    { id: 'b', label: 'Β΄ Δημοτικού' },
    { id: 'c', label: 'Γ΄ Δημοτικού' },
    { id: 'd', label: 'Δ΄ Δημοτικού' },
    { id: 'e', label: 'Ε΄ Δημοτικού' },
    { id: 'st', label: 'ΣΤ΄ Δημοτικού' },
    { id: 'g1', label: 'Α΄ Γυμνασίου' },
    { id: 'g2', label: 'Β΄ Γυμνασίου' },
    { id: 'g3', label: 'Γ΄ Γυμνασίου' }
  ];

  function getGrade() {
    var value = localStorage.getItem(STORAGE_KEY);
    return grades.some(function (grade) { return grade.id === value; }) ? value : '';
  }

  function setGrade(value) {
    if (!grades.some(function (grade) { return grade.id === value; })) return;
    localStorage.setItem(STORAGE_KEY, value);
    document.dispatchEvent(new CustomEvent('paizomath:gradechange', { detail: { grade: value } }));
    renderAll();
  }

  function gradeLabel(value) {
    var found = grades.find(function (grade) { return grade.id === value; });
    return found ? found.label : 'Δεν έχει επιλεγεί τάξη';
  }

  function buildSelector() {
    var wrapper = document.createElement('section');
    wrapper.className = 'grade-selector paizomath-grade-selector';
    wrapper.setAttribute('aria-labelledby', 'grade-selector-title');
    wrapper.innerHTML = '<div class="grade-selector-copy"><div class="eyebrow">Προσωπική ρύθμιση</div>' +
      '<h2 id="grade-selector-title">Επίλεξε την τάξη σου</h2>' +
      '<p>Διάλεξε μία τάξη για να θυμάται η εφαρμογή το επίπεδο του παιδιού.</p></div>' +
      '<div class="grade-options" role="group" aria-label="Τάξη Δημοτικού ή Γυμνασίου"></div>' +
      '<p class="grade-selector-status" aria-live="polite"></p>';
    var options = wrapper.querySelector('.grade-options');
    grades.forEach(function (grade) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'grade-option';
      button.dataset.grade = grade.id;
      button.textContent = grade.label;
      button.addEventListener('click', function () { setGrade(grade.id); });
      options.appendChild(button);
    });
    return wrapper;
  }

  function updateSelector(selector) {
    var selected = getGrade();
    selector.querySelectorAll('.grade-option').forEach(function (button) {
      var active = button.dataset.grade === selected;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    selector.querySelector('.grade-selector-status').textContent = selected
      ? 'Επιλεγμένη τάξη: ' + gradeLabel(selected)
      : 'Δεν έχει επιλεγεί τάξη ακόμη.';
  }

  function injectHomeSelector() {
    var app = document.getElementById('app');
    var lessonSection = app && app.querySelector('.lesson-section');
    if (!app || !lessonSection || app.querySelector('.paizomath-grade-selector')) return;
    var selector = buildSelector();
    lessonSection.parentNode.insertBefore(selector, lessonSection);
    updateSelector(selector);
  }

  function injectGradeBadge() {
    var app = document.getElementById('app');
    var selected = getGrade();
    if (!app || !selected) return;
    var quiz = app.querySelector('.quiz-main');
    if (!quiz || quiz.querySelector('.paizomath-grade-badge')) return;
    var badge = document.createElement('div');
    badge.className = 'paizomath-grade-badge';
    badge.textContent = 'Τάξη: ' + gradeLabel(selected);
    quiz.insertBefore(badge, quiz.firstChild);
  }

  function renderAll() {
    injectHomeSelector();
    injectGradeBadge();
    var selector = document.querySelector('.paizomath-grade-selector');
    if (selector) updateSelector(selector);
  }

  var observer = new MutationObserver(renderAll);
  observer.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  document.addEventListener('paizomath:gradechange', renderAll);
  window.addEventListener('DOMContentLoaded', renderAll);
  renderAll();
}());
