/* わだいぽん！ — アプリ本体（DCLogicコンポーネント） */
(function () {
'use strict';
window.WADAI = window.WADAI || {};
window.WADAI.createComponent = function (DCLogic) {
const { DATA, ALL, TYPES, FONTS, themeFor, loadSaved, saveState } = window.WADAI;
return class Component extends DCLogic {
constructor(props) {
super(props);
this.state = { started: false, lobby: true, menu: false, sel: ALL, copied: false, history: [], type: 'normal', cat: -1, topic: null, anim: null, noRepeat: true, seen: [], fs: 1, mode: 'normal', chroma: false, ff: 0, main: null };
Object.assign(this.state, loadSaved());
const st0 = this.state;
const first = this.pickFrom(-1, null, st0.started ? st0.seen : [], st0.noRepeat);
st0.topic = first.topic;
if (st0.mode !== 'normal') {
st0.history = this.pushHist(st0, first.topic);
st0.seen = st0.noRepeat ? first.seen : [];
st0.started = true;
st0.hint = st0.mode === 'obs';
} else if (!st0.started) {
st0.seen = first.seen;
st0.history = [first.topic];
}
}
componentDidUpdate() {
saveState(this.state);
}
pool(cat, type, sel) {
const ty = type || this.state.type;
if (ty && ty !== 'normal') { return TYPES[ty].topics; }
return (sel || this.state.sel).flatMap((i) => DATA[i].topics);
}
pickFrom(cat, prev, seen, noRepeat, type, sel) {
const list = this.pool(cat, type, sel);
if (!list.length) { return { topic: prev, seen }; }
let cand = list;
let nextSeen = seen;
if (noRepeat) {
cand = list.filter((t) => seen.indexOf(t) === -1);
if (!cand.length) {
nextSeen = seen.filter((t) => list.indexOf(t) === -1);
cand = list.filter((t) => t !== prev);
}
if (!cand.length) { cand = list; }
} else if (list.length > 1) {
cand = list.filter((t) => t !== prev);
}
const topic = cand[Math.floor(Math.random() * cand.length)];
return { topic, seen: noRepeat ? nextSeen.concat([topic]) : seen };
}
setSel(sel) {
const st = this.state;
const list = this.pool(-1, 'normal', sel);
if (!list.length || list.indexOf(st.topic) !== -1) { this.setState({ sel }); return; }
const r = this.pickFrom(-1, st.topic, st.seen, st.noRepeat, 'normal', sel);
this.setState({ started: true, sel, topic: r.topic, seen: r.seen, anim: 1 - (st.anim || 0), history: this.pushHist(st, r.topic) });
}
change(cat) {
const st = this.state;
if (!this.pool(cat, st.type).length) { return; }
const r = this.pickFrom(cat, st.topic, st.seen, st.noRepeat);
this.setState({ started: true, cat, topic: r.topic, seen: r.seen, anim: 1 - (st.anim || 0), history: this.pushHist(st, r.topic) });
}
pushHist(st, t) {
return (st.started ? [t].concat(st.history) : [t]).slice(0, 30);
}
animVars(st) {
return { tqCls: '', tcatCls: '', shownTopic: st.topic };
}
componentDidMount() {
this._lt = this.state.topic;
const onHome = (e) => {
try {
const path = e.composedPath ? e.composedPath() : [];
for (const n of path) {
if (n && n.getRootNode) { const r = n.getRootNode(); const h = r.getElementById ? r.getElementById('pg-home') : null; if (h) { return h.checked; } }
}
const h = document.getElementById('pg-home');
return h ? h.checked : true;
} catch (err) { return true; }
};
const typing = (e) => {
const t = (e.composedPath ? e.composedPath()[0] : e.target) || e.target;
if (!t || !t.tagName) { return false; }
const tag = t.tagName;
if (tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) { return true; }
return tag === 'INPUT' && t.type !== 'radio' && t.type !== 'checkbox' && t.type !== 'button';
};
this._kd = (e) => {
if (e.key === 'Escape' && this.state.menu) { this.setState({ menu: false }); return; }
if (this.state.mode === 'obs' && e.key === 'Escape') { this.setState({ mode: 'normal' }); return; }
if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) { return; }
const spin = e.key === ' ' || e.key === 'Enter' || (e.key === 'ArrowRight' && this.state.mode === 'obs');
if (!spin || typing(e) || !onHome(e) || (this.state.lobby && this.state.mode === 'normal')) { return; }
const tg = (e.composedPath ? e.composedPath()[0] : e.target) || e.target;
try { if (tg && tg.matches && tg.matches('button, a, summary, label, [role="switch"]') && tg.matches(':focus-visible')) { return; } } catch (err) {}
e.preventDefault();
if (e.key === ' ') { this._swallow = true; }
if (e.repeat) { return; }
this.change(this.state.cat);
};
this._ku = (e) => {
if (e.key === ' ' && this._swallow) { this._swallow = false; e.preventDefault(); }
};
window.addEventListener('keydown', this._kd);
window.addEventListener('keyup', this._ku);
}
componentWillUnmount() {
clearInterval(this._rt);
clearTimeout(this._rd);
window.removeEventListener('keydown', this._kd);
window.removeEventListener('keyup', this._ku);
}
renderVals() {
const st = this.state;
const cats = DATA.map((c, i) => ({ c, i })).filter((x) => x.c.show).map((x) => ({
label: x.c.name,
sel: st.sel.indexOf(x.i) !== -1,
off: st.sel.indexOf(x.i) === -1,
pick: () => this.setSel(st.sel.indexOf(x.i) !== -1 ? st.sel.filter((n) => n !== x.i) : st.sel.concat([x.i]).sort((a, b) => a - b)),
}));
const pool = this.pool(st.cat);
const seenN = pool.filter((t) => st.seen.indexOf(t) !== -1).length;
const mult = [0.85, 1, 1.3, 1.7];
return {
cats,
topic: st.topic,
anim: st.anim === null ? '' : 'sa' + st.anim,
types: [{ id: 'normal', name: 'ノーマル' }, { id: 'anime', name: 'アニメ' }, { id: 'memory', name: '思い出' }, { id: 'ogiri', name: '大喜利' }, { id: 'moshimo', name: 'もしも' }].map((y) => ({
label: y.name,
sel: y.id === st.type,
off: y.id !== st.type,
pick: () => { if (y.id === st.type) { return; } const r = this.pickFrom(st.cat, null, [], st.noRepeat, y.id); this.setState({ type: y.id, topic: r.topic, seen: st.noRepeat ? r.seen : [], anim: 1 - (st.anim || 0), history: [r.topic].concat(st.history).slice(0, 30) }); },
})),
lobby: st.lobby && st.mode === 'normal', notLobby: !(st.lobby && st.mode === 'normal'),
goLobby: () => this.setState({ menu: false, lobby: true }),
lobbyTypes: [['normal','ノーマル'],['anime','アニメ'],['memory','思い出'],['ogiri','大喜利'],['moshimo','もしも']].map((y, yi) => ({ name: y[1], ico: { normal: '💬', anime: '✨', memory: '📷', ogiri: '🎤', moshimo: '🌈' }[y[0]], cls: yi === 0 ? 'lbtn first' : 'lbtn', sub: {"normal": "ジャンルいろいろ、ふつうのわだい", "anime": "アニメ好きのためのわだい", "memory": "むかしの話で盛り上がろう", "ogiri": "ひとボケ考えてみよう", "moshimo": "もしもの世界を想像しよう"}[y[0]], open: () => { const r = this.pickFrom(st.cat, null, st.started ? st.seen : [], st.noRepeat, y[0]); this.setState({ started: true, lobby: false, type: y[0], topic: r.topic, seen: st.noRepeat ? r.seen : [], anim: 1 - (st.anim || 0), history: this.pushHist(st, r.topic) }); } })),
menuCls: st.menu ? 'open' : '',
menuAria: String(st.menu),
menuClosed: !st.menu,
menuOpenFlag: st.menu,
toggleMenu: () => this.setState({ menu: !st.menu }),
closeMenu: () => { if (st.menu) { this.setState({ menu: false }); } },
selAll: () => this.setSel(ALL),
selNone: () => this.setSel([]),
copyIdle: !st.copied,
copyDone: st.copied,
copyLabel: st.copied ? 'コピーしました' : '',
copyTopic: () => {
const text = st.topic;
const done = () => { this.setState({ copied: true }); clearTimeout(this._ct); this._ct = setTimeout(() => this.setState({ copied: false }), 1600); };
const fallback = () => { try { const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done(); } catch (e) {} };
try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); } } catch (e) { fallback(); }
},
histList: st.history.map((t, i) => ({ t, k: i + 1 })),
clearHist: () => this.setState({ history: [st.topic] }),
typeCls: st.type === 'normal' ? '' : 't-' + st.type,
headText: st.type === 'normal' ? '＼＼ 次のわだいはこれ ／／' : TYPES[st.type].head,
catHide: st.type === 'normal' ? '' : 'hide',
catLabel: st.type !== 'normal' ? '- 「' + TYPES[st.type].name + '」カード -' : st.sel.length === ALL.length ? '- すべてのカテゴリ -' : st.sel.length === 0 ? '- カテゴリを選んでください -' : st.sel.length === 1 ? '- 「' + DATA[st.sel[0]].name + '」カテゴリ -' : '- ' + st.sel.length + '個のカテゴリから出題 -',
next: () => this.change(st.cat),
...this.animVars(st),
fsm: mult[st.fs],
ffCss: FONTS[st.ff].css,
ffList: FONTS.map((f, i) => ({ label: f.name, css: f.css, cls: i === st.ff ? 'seg on' : 'seg', sel: String(i === st.ff), pick: () => this.setState({ ff: i }) })),
modeCls: st.mode === 'compact' ? 'm-compact' + (st.chroma ? ' chroma' : '') : st.mode === 'obs' ? 'm-obs' + (st.hint ? ' hint' : '') : (st.lobby ? 'lobbyp' : ''),
exitObs: () => this.setState({ mode: 'normal' }),
chrCls: st.chroma ? 'chrbtn on' : 'chrbtn',
chrAria: String(st.chroma),
toggleChroma: () => this.setState({ chroma: !st.chroma }),
cmAria: String(st.mode === 'compact'),
toggleCompact: () => this.setState({ started: st.started || st.mode === 'normal', mode: st.mode === 'compact' ? 'normal' : 'compact' }),
shareX: () => { try { const u = window.location.href.split('#')[0]; const text = 'お題：' + st.topic + '\n#わだいぽん'; window.open('https://x.com/intent/post?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(u), '_blank', 'noopener,noreferrer'); } catch (e) {} },
cardTap: () => { if (st.mode === 'obs') { this.change(st.cat); } },
modeList: [
{ id: 'normal', label: '通常モード', sub: 'リスナー向け・全要素表示' },
{ id: 'compact', label: 'コンパクトモード', sub: '配信者手元用・最小UI' },
{ id: 'obs', label: 'OBSモード', sub: '配信画面取り込み用・背景透明' },
].map((m) => ({ label: m.label, sub: m.sub, cls: st.mode === m.id ? 'opt on' : 'opt', sel: String(st.mode === m.id), pick: (e) => { if (m.id !== 'normal') { try { const r = e && e.currentTarget && e.currentTarget.getRootNode ? e.currentTarget.getRootNode() : document; const h = r.getElementById ? r.getElementById('pg-home') : null; if (h) { h.checked = true; } } catch (err) {} } this.setState({ started: st.started || m.id !== 'normal', mode: m.id, hint: m.id === 'obs' }); } })),
fsList: ['小', '中', '大', '極大'].map((label, i) => ({ label, cls: i === st.fs ? 'seg on' : 'seg', sel: String(i === st.fs), pick: () => this.setState({ fs: i }) })),
themeVars: (() => { const T = themeFor(st.main); return ['bg','bg2','hd','card','ac','ac2','bd','soft','soft2','deep','hov','line'].map((k) => '--' + k + ':' + T[k]).join(';'); })(),
dkCls: themeFor(st.main).dk ? 'dk' : '',
mainHex: st.main || '#ffdf5c',
onMain: (e) => { const v = String(e.target.value || '').toLowerCase(); if (/^#[0-9a-f]{6}$/.test(v)) { this.setState({ main: v }); } },
normalCls: st.main ? 'swb' : 'swb on',
normalSel: String(!st.main),
onNormal: () => this.setState({ main: null }),
derived: (() => { const T = themeFor(st.main); return [['カード', T.card], ['背景', T.bg], ['ヘッダー', T.hd], ['アクセント', T.ac], ['ボタン', T.ac2]].map((x) => ({ label: x[0], col: x[1] })); })(),
nrOn: st.noRepeat,
nrCls: st.noRepeat ? 'on' : '',
nrAria: String(st.noRepeat),
seenText: '表示済み ' + seenN + ' / ' + pool.length + '（' + (st.type !== 'normal' ? TYPES[st.type].name : st.sel.length === ALL.length ? 'すべて' : st.sel.length + 'カテゴリ') + '）',
toggleNR: () => this.setState({ noRepeat: !st.noRepeat, seen: !st.noRepeat ? [st.topic] : [] }),
resetSeen: () => this.setState({ seen: [st.topic] }),
};
}
};
};
})();
