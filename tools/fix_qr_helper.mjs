import fs from 'node:fs';
const path = '/home/ubuntu/paizomath-contact-work/js/app.js';
const source = fs.readFileSync(path, 'utf8');
const start = source.indexOf('function qrTroubleshooting() {');
const end = source.indexOf('function home() {', start);
if (start < 0 || end < 0) throw new Error('QR helper boundaries not found');
const replacement = `function qrTroubleshooting() {
  const el = state.lang === "el";
  const title = el ? "Αν δεν σκανάρεται το QR" : "If the QR does not scan";
  const text = el ? "Αυξήστε τη φωτεινότητα, καθαρίστε τον φακό και κρατήστε το κινητό σταθερό περίπου 15–30 cm από την οθόνη. Ανοίξτε το QR σε πλήρες μέγεθος και δοκιμάστε Κάμερα ή Google Lens. Αν βλέπετε παλιά εικόνα, κάντε ανανέωση ή ανοίξτε ιδιωτική καρτέλα." : "Increase brightness, clean the camera lens and hold the phone steady about 15–30 cm from the screen. Open the QR at full size and try Camera or Google Lens. If an old image appears, refresh or use a private tab.";
  return '<details class="qr-troubleshooting"><summary>' + title + '</summary><p>' + text + '</p></details>';

}
`;
fs.writeFileSync(path, source.slice(0, start) + replacement + source.slice(end));
