/* わだいぽん！ — フォント定義・テーマカラー計算 */
(function () {
'use strict';
const FONTS = [
{ name: '標準', css: "Meiryo, 'Yu Gothic', 'Hiragino Sans', sans-serif" },
{ name: '丸ゴシック', css: "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif" },
{ name: '明朝体', css: "'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif" },
{ name: 'ポップ体', css: "'Hachi Maru Pop', 'Hiragino Maru Gothic ProN', sans-serif" },
{ name: '手書き風', css: "'Yomogi', 'Hiragino Maru Gothic ProN', sans-serif" },
{ name: '極太', css: "'Dela Gothic One', 'Yu Gothic', sans-serif" },
];
const hx = (h, s, l) => { const a = s * Math.min(l, 1 - l); const f = (n) => { const k = (n + h / 30) % 12; const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(255 * c).toString(16).padStart(2, '0'); }; return '#' + f(0) + f(8) + f(4); };
const toHsl = (hex) => { const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let h = 0, s = 0; if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; } return { h, s, l }; };
const YEL = { bg: '#ffeda5', bg2: '#ffe997', hd: '#fecc5c', card: '#ffdf5c', ac: '#fdbd5b', ac2: '#fdd432', bd: '#f3d98a', soft: '#fff3c4', soft2: '#fff8dc', deep: '#b27a14', hov: '#ffd23f', line: 'rgba(74,44,42,.16)', dk: false };
const themeFor = (main) => {
  if (!main) { return YEL; }
  const { h, s, l } = toHsl(main);
  if (l < 0.45) { const t = Math.min(s, 0.45), u = Math.min(s, 0.35); return { bg: hx(h, t, 0.1), bg2: hx(h, t, 0.07), hd: hx(h, t, 0.05), card: hx(h, s, Math.max(l, 0.22)), ac: hx(h, u, 0.84), ac2: hx(h, u, 0.95), bd: hx(h, u, 0.8), soft: hx(h, u, 0.93), soft2: hx(h, u, 0.96), deep: hx(h, Math.min(s, 0.3), 0.3), hov: hx(h, s, Math.min(Math.max(l, 0.22) + 0.07, 0.5)), line: 'rgba(255,255,255,.2)', dk: true }; }
  return { bg: hx(h, s, 0.9), bg2: hx(h, s, 0.85), hd: hx(h, s, Math.min(l, 0.8)), card: main, ac: hx(h, s, Math.min(0.75, Math.max(0.55, l - 0.06))), ac2: hx(h, s, Math.min(0.7, Math.max(0.5, l - 0.1))), bd: hx(h, s * 0.6, 0.78), soft: hx(h, s, 0.93), soft2: hx(h, s, 0.96), deep: hx(h, Math.min(s, 0.6), 0.3), hov: hx(h, s, Math.min(0.96, l + 0.07)), line: 'rgba(74,44,42,.16)', dk: false };
};
window.WADAI = window.WADAI || {};
window.WADAI.FONTS = FONTS;
window.WADAI.themeFor = themeFor;
})();
