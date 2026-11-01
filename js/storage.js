/* わだいぽん！ — 設定の保存・復元（localStorage） */
(function () {
'use strict';
const { ALL, FONTS } = window.WADAI;
const STORE_KEY = 'wadaipon:v1';
const loadSaved = () => {
try {
const raw = window.localStorage.getItem(STORE_KEY);
if (!raw) { return {}; }
const d = JSON.parse(raw);
if (!d || typeof d !== 'object') { return {}; }
const o = {};
const strs = (a, max) => (Array.isArray(a) ? a.filter((t) => typeof t === 'string').slice(0, max) : []);
if (Array.isArray(d.sel)) { o.sel = ALL.filter((i) => d.sel.indexOf(i) !== -1); }
if (typeof d.noRepeat === 'boolean') { o.noRepeat = d.noRepeat; }
if (Number.isInteger(d.fs) && d.fs >= 0 && d.fs <= 3) { o.fs = d.fs; }
if (Number.isInteger(d.ff) && d.ff >= 0 && d.ff < FONTS.length) { o.ff = d.ff; }
if (d.main === null || (typeof d.main === 'string' && /^#[0-9a-f]{6}$/.test(d.main))) { o.main = d.main; }
if (d.mode === 'normal' || d.mode === 'compact' || d.mode === 'obs') { o.mode = d.mode; }
if (typeof d.chroma === 'boolean') { o.chroma = d.chroma; }
if (typeof d.started === 'boolean') { o.started = d.started; }
if (d.history) { o.history = strs(d.history, 30); }
if (d.seen) { o.seen = strs(d.seen, 400); }
if (o.started && (!o.history || !o.history.length)) { o.started = false; delete o.history; }
return o;
} catch (e) { return {}; }
};
const saveState = (st) => {
try {
window.localStorage.setItem(STORE_KEY, JSON.stringify({ sel: st.sel, noRepeat: st.noRepeat, fs: st.fs, ff: st.ff, main: st.main, mode: st.mode, chroma: st.chroma, started: st.started, history: st.history, seen: st.seen }));
} catch (e) {}
};
window.WADAI.loadSaved = loadSaved;
window.WADAI.saveState = saveState;
})();
