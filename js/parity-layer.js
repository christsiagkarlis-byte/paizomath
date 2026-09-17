/* PaizoMath Web parity layer: local-only dynamic bank, age adaptation and family profiles. */
(function () {
  'use strict';
  var FAMILY_KEY = 'paizomath-family-v1';
  var gradeByAge = function (age) {
    age = Number(age);
    if (!Number.isFinite(age) || age < 6) return null;
    if (age <= 6) return 'A Δημοτικού';
    if (age === 7) return 'B Δημοτικού';
    if (age === 8) return 'Γ Δημοτικού';
    if (age === 9) return 'Δ Δημοτικού';
    if (age === 10) return 'Ε Δημοτικού';
    if (age === 11) return 'ΣΤ Δημοτικού';
    if (age === 12) return 'Α Γυμνασίου';
    if (age === 13) return 'Β Γυμνασίου';
    return 'Γ Γυμνασίου';
  };
  var gradeId = function (grade) {
    return ({'A Δημοτικού':'a','B Δημοτικού':'b','Γ Δημοτικού':'c','Δ Δημοτικού':'d','Ε Δημοτικού':'e','ΣΤ Δημοτικού':'st','Α Γυμνασίου':'g1','Β Γυμνασίου':'g2','Γ Γυμνασίου':'g3'})[grade] || '';
  };
  window.PAIZOMATH_GRADE_FOR_AGE = function () {
    var savedAge = localStorage.getItem('paizomath-child-age');
    var adapted = gradeByAge(savedAge);
    if (adapted && localStorage.getItem('paizomath-age-adaptation') !== 'off') {
      var id = gradeId(adapted);
      if (id && !localStorage.getItem('paizomath-selected-grade')) localStorage.setItem('paizomath-selected-grade', id);
      return adapted;
    }
    var selected = localStorage.getItem('paizomath-selected-grade');
    return ({a:'A Δημοτικού',b:'B Δημοτικού',c:'Γ Δημοτικού',d:'Δ Δημοτικού',e:'Ε Δημοτικού',st:'ΣΤ Δημοτικού',g1:'Α Γυμνασίου',g2:'Β Γυμνασίου',g3:'Γ Γυμνασίου'})[selected] || 'A Δημοτικού';
  };
  function hash(value) { var h = 2166136261; for (var i=0;i<value.length;i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619); return h >>> 0; }
  var templates = {
    math: ['Πόσο κάνει {a} + {b};','Ποιος αριθμός είναι μεγαλύτερος: {a} ή {b};'],
    language: ['Ποια λέξη είναι ουσιαστικό;','Ποια πρόταση είναι γραμμένη σωστά;'],
    science: ['Ποιο από τα παρακάτω είναι φυσικό φαινόμενο;','Τι χρειάζεται ένα φυτό για να μεγαλώσει;'],
    history: ['Ποια πηγή μας βοηθά να μελετήσουμε το παρελθόν;','Τι δείχνει μια χρονογραμμή;'],
    geography: ['Ποιο από τα παρακάτω είναι γεωγραφικός όρος;','Ποιο σώμα νερού είναι μεγαλύτερο;'],
    technology: ['Ποια επιλογή προστατεύει καλύτερα τα δεδομένα;','Τι κάνει ένας αλγόριθμος;'],
    knowledge: ['Ποια απάντηση είναι σωστή για την καθημερινή ζωή;','Ποια επιλογή δείχνει καλή παρατήρηση;'],
    english: ['Ποια φράση είναι σωστή στα Αγγλικά;','Τι σημαίνει η λέξη;'],
    civics: ['Ποια συμπεριφορά δείχνει σεβασμό;','Πώς παίρνουμε μια δίκαιη απόφαση;'],
    skills: ['Ποιο είναι καλό πρώτο βήμα για ένα πρόβλημα;','Ποια επιλογή βοηθά τη συνεργασία;'],
    physical: ['Ποια συνήθεια είναι ασφαλής πριν από άσκηση;','Τι βοηθά το σώμα να κινείται με ασφάλεια;'],
    arts: ['Ποιο υλικό χρησιμοποιείται στη ζωγραφική;','Τι μπορεί να εκφράσει ένα έργο τέχνης;']
  };
  var dynamic = [];
  Object.keys(templates).forEach(function (topic) {
    for (var i=0;i<3;i++) {
      var grade = ['A Δημοτικού','Γ Δημοτικού','ΣΤ Δημοτικού','Α Γυμνασίου','Γ Γυμνασίου'][i % 5];
      var text = templates[topic][i % templates[topic].length];
      if (topic === 'math') text = text.replace('{a}', String(i + 2)).replace('{b}', String(i + 3));
      var choices = topic === 'math' ? [String(i+5),String(i+4),String(i+6),String(i+7)] : ['Η πρώτη επιλογή','Η δεύτερη επιλογή','Η τρίτη επιλογή','Η τέταρτη επιλογή'];
      dynamic.push({id:'web-dyn-'+topic+'-'+(i+1), grade:grade, category:topic, difficulty:i===2?'genius':(i===1?'explorer':'beginner'), prompt:text, choices:choices, answerIndex:0, explanation:'Η σωστή επιλογή είναι η πρώτη. Το περιεχόμενο δημιουργείται τοπικά από την επεκτάσιμη τράπεζα.'});
    }
  });
  window.PAIZOMATH_DYNAMIC_BANK = dynamic;
  var basePool = window.PAIZOMATH_GRADE_POOL;
  window.PAIZOMATH_GRADE_POOL = function (topic) {
    var selected = window.PAIZOMATH_GRADE_FOR_AGE();
    var base = basePool ? basePool(topic) : [];
    return base.concat(dynamic.filter(function (q) { return q.grade === selected && q.category === topic; }).map(function (q) { return Object.assign({}, q, {topic:topic, correct:q.choices[q.answerIndex]}); }));
  };
  function loadFamily() { try { return JSON.parse(localStorage.getItem(FAMILY_KEY) || '{"parent":{"name":"Γονέας","pin":""},"children":[]}'); } catch (_) { return {parent:{name:'Γονέας',pin:''},children:[]}; } }
  function saveFamily(f) { localStorage.setItem(FAMILY_KEY, JSON.stringify(f)); }
  function installFamilyPanel() {
    if (!document.body || document.getElementById('paizomath-family-panel')) return;
    var panel = document.createElement('section'); panel.id='paizomath-family-panel'; panel.className='paizomath-family-panel';
    panel.innerHTML='<div><strong>Οικογένεια και ηλικιακή προσαρμογή</strong><p class="paizomath-family-status"></p></div><div class="paizomath-family-fields"><label>Όνομα παιδιού <input id="paizomath-child-name" maxlength="40"></label><label>Ηλικία <input id="paizomath-child-age" type="number" min="6" max="18"></label><label>PIN γονέα <input id="paizomath-parent-pin" type="password" minlength="4" maxlength="32"></label><button type="button" id="paizomath-save-family">Αποθήκευση τοπικά</button></div><small>Τα προφίλ και η πρόοδος αποθηκεύονται μόνο σε αυτή τη συσκευή/browser.</small>';
    var app=document.getElementById('app'); if (app) app.insertBefore(panel, app.firstChild);
    var family=loadFamily(), child=family.children[0];
    if (child) { panel.querySelector('#paizomath-child-name').value=child.name||''; panel.querySelector('#paizomath-child-age').value=child.age||''; }
    panel.querySelector('#paizomath-save-family').addEventListener('click', function(){ var name=panel.querySelector('#paizomath-child-name').value.trim(); var age=Number(panel.querySelector('#paizomath-child-age').value); var pin=panel.querySelector('#paizomath-parent-pin').value; if(name.length<2||age<6||age>18||pin.length<4){ panel.querySelector('.paizomath-family-status').textContent='Συμπλήρωσε όνομα, ηλικία 6–18 και PIN τουλάχιστον 4 χαρακτήρων.'; return; } family.children=[{id:1,name:name,age:age}]; family.parent.pin=pin; saveFamily(family); localStorage.setItem('paizomath-child-age',String(age)); localStorage.removeItem('paizomath-selected-grade'); panel.querySelector('.paizomath-family-status').textContent='Αποθηκεύτηκε. Προτεινόμενη τάξη: '+window.PAIZOMATH_GRADE_FOR_AGE(); document.dispatchEvent(new CustomEvent('paizomath:gradechange')); });
  }
  function installFirstAidDisclaimer() {
    if (!document.body || document.getElementById('paizomath-first-aid-disclaimer')) return;
    var section = document.createElement('section'); section.id='paizomath-first-aid-disclaimer'; section.className='paizomath-first-aid-disclaimer';
    section.innerHTML='<h2>Πρώτες Βοήθειες — Disclaimer</h2><p><strong>Ενημερωτικός χαρακτήρας:</strong> Το περιεχόμενο είναι καθαρά πληροφοριακό και εκπαιδευτικό και δεν αντικαθιστά επαγγελματική ιατρική συμβουλή, διάγνωση ή θεραπεία.</p><p class="paizomath-emergency"><strong>Σε πραγματικό επείγον περιστατικό, καλέστε αμέσως το 112 ή το 166.</strong></p><p><strong>Περιορισμός ευθύνης:</strong> Η εφαρμογή δεν φέρει ευθύνη για τυχόν λανθασμένη εφαρμογή των οδηγιών από τον χρήστη. Ακολούθησε τις οδηγίες των υπηρεσιών έκτακτης ανάγκης και ζήτησε βοήθεια από ενήλικα ή επαγγελματία υγείας.</p><h3>Πηγές και περαιτέρω ενημέρωση</h3><ul><li><a href="https://www.redcross.gr/protes-voitheies/" rel="noopener noreferrer">Ελληνικός Ερυθρός Σταυρός — Πρώτες Βοήθειες</a></li><li><a href="https://redcross.org.cy/" rel="noopener noreferrer">Κυπριακός Ερυθρός Σταυρός</a></li><li><a href="https://www.erc.edu/science-research/guidelines/guidelines-2025/guidelines-2025-english/" rel="noopener noreferrer">European Resuscitation Council — Guidelines 2025</a></li><li><a href="https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/bec" rel="noopener noreferrer">World Health Organization — Basic Emergency Care</a></li></ul>';
    var app=document.getElementById('app'); if (app) app.appendChild(section);
  }
  window.addEventListener('DOMContentLoaded', function(){ installFamilyPanel(); installFirstAidDisclaimer(); setInterval(function(){ installFamilyPanel(); installFirstAidDisclaimer(); }, 1000); });
})();
