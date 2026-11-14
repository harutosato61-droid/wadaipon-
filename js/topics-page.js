/* /topics/ の検索・絞り込み（外部ライブラリなし。JSが無効でも全件が表示される） */
(function () {
'use strict';
var q = document.getElementById('q'), fg = document.getElementById('fg'), fm = document.getElementById('fm'), fs = document.getElementById('fs');
var cnt = document.getElementById('cnt'), none = document.getElementById('none');
if (!q || !fg) { return; }
var items = Array.prototype.slice.call(document.querySelectorAll('.grp li'));
var groups = Array.prototype.slice.call(document.querySelectorAll('.grp'));
var total = items.length;
function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }
function apply() {
  var kw = norm(q.value), g = fg.value, m = fm.value, s = fs.value, shown = 0;
  items.forEach(function (li) {
    var ok = (!g || li.getAttribute('data-g') === g) && (!m || li.getAttribute('data-m') === m) &&
      (!s || li.getAttribute('data-s').split(',').indexOf(s) !== -1) && (!kw || norm(li.textContent).indexOf(kw) !== -1);
    li.hidden = !ok; if (ok) { shown++; }
  });
  groups.forEach(function (gr) {
    var n = gr.querySelectorAll('li:not([hidden])').length;
    gr.hidden = n === 0; var c = gr.querySelector('.gc'); if (c) { c.textContent = n; }
  });
  cnt.textContent = (shown === total) ? '全' + total + '個を表示中' : total + '個中 ' + shown + '個を表示中';
  none.hidden = shown !== 0;
}
[q, fg, fm, fs].forEach(function (el) { el.addEventListener('input', apply); el.addEventListener('change', apply); });
})();
