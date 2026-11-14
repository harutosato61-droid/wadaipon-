/* わだいぽん！ — アプリ本体（DCLogicコンポーネント） */
(function () {
'use strict';
window.WADAI = window.WADAI || {};
window.WADAI.createComponent = function (DCLogic) {
const { DATA, ALL, DEFAULT_SEL, TYPES, FONTS, SCENES, BY_ID, BY_TEXT, themeFor, loadSaved, saveState } = window.WADAI;
return class Component extends DCLogic {
constructor(props) {
super(props);
this.state = { started: false, lobby: true, menu: false, sel: DEFAULT_SEL, copied: false, favs: [], scene: '', note: '', lives: [], cloudReady: false, odaiText: '', odaiMsg: '', odaiBusy: false, history: [], type: 'normal', cat: -1, topic: null, anim: null, noRepeat: true, seen: [], fs: 1, mode: 'normal', chroma: false, ff: 0, main: null, authReady: false, user: null, authErr: '', authBusy: false };
Object.assign(this.state, loadSaved());
let launch = false;
try {
const qp = new URLSearchParams(window.location.search);
const qt = qp.get('type'); const qg = qp.get('genre'); const qs = qp.get('scene'); const qm = qp.get('mode');
if (qt && TYPES[qt] && qt !== 'fav') { this.state.type = qt; launch = true; }
else if (qg) { const gi = DATA.findIndex((c) => c.name === qg && c.show); if (gi !== -1) { this.state.type = 'normal'; this.state.sel = [gi]; launch = true; } }
if (qs && SCENES.indexOf(qs) !== -1) { this.state.scene = qs; launch = true; }
if (qm === 'obs') { this.state.mode = 'obs'; launch = true; }
if (launch) { this.state.lobby = false; this.state.seen = []; }
} catch (err) {}
if (this.state.type === 'fav') { this.state.type = 'normal'; }
const st0 = this.state;
const first = this.pickFrom(-1, null, st0.started && !launch ? st0.seen : [], st0.noRepeat);
st0.topic = first.topic;
if (launch && st0.mode === 'normal') {
st0.seen = st0.noRepeat ? first.seen : [];
st0.history = [first.topic];
st0.started = true;
} else if (st0.mode !== 'normal') {
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
pool(cat, type, sel, scene) {
const st = this.state;
const ty = type || st.type;
if (ty === 'fav') { return st.favs.map((id) => BY_ID[id]).filter(Boolean).map((t) => t.text); }
let list = (ty && ty !== 'normal') ? TYPES[ty].topics : (sel || st.sel).flatMap((i) => DATA[i].topics);
const sc = scene === undefined ? st.scene : scene;
if (sc) { list = list.filter((t) => BY_TEXT[t] && BY_TEXT[t].scenes.indexOf(sc) !== -1); }
return list;
}
pickFrom(cat, prev, seen, noRepeat, type, sel, scene) {
const list = this.pool(cat, type, sel, scene);
if (!list.length) { return { topic: prev, seen, wrapped: false }; }
let cand = list;
let nextSeen = seen;
let wrapped = false;
if (noRepeat) {
cand = list.filter((t) => seen.indexOf(t) === -1);
if (!cand.length) {
wrapped = list.length > 1;
nextSeen = seen.filter((t) => list.indexOf(t) === -1);
cand = list.filter((t) => t !== prev);
}
if (!cand.length) { cand = list; }
} else if (list.length > 1) {
cand = list.filter((t) => t !== prev);
}
const topic = cand[Math.floor(Math.random() * cand.length)];
return { topic, seen: noRepeat ? nextSeen.concat([topic]) : seen, wrapped };
}
setSel(sel) {
const st = this.state;
const list = this.pool(-1, 'normal', sel);
if (!list.length || list.indexOf(st.topic) !== -1) { this.setState({ sel, note: '' }); return; }
const r = this.pickFrom(-1, st.topic, st.seen, st.noRepeat, 'normal', sel);
this.setState({ started: true, sel, topic: r.topic, seen: r.seen, anim: 1 - (st.anim || 0), history: this.pushHist(st, r.topic), note: '' });
}
setScene(scene) {
const st = this.state;
const list = this.pool(-1, st.type, undefined, scene);
if (!list.length || list.indexOf(st.topic) !== -1) { this.setState({ scene, note: '' }); return; }
const r = this.pickFrom(-1, st.topic, st.seen, st.noRepeat, st.type, undefined, scene);
this.setState({ started: true, scene, topic: r.topic, seen: r.seen, anim: 1 - (st.anim || 0), history: this.pushHist(st, r.topic), note: '' });
}
change(cat) {
const st = this.state;
if (!this.pool(cat, st.type).length) { return; }
const r = this.pickFrom(cat, st.topic, st.seen, st.noRepeat);
this.setState({ started: true, cat, topic: r.topic, seen: r.seen, anim: 1 - (st.anim || 0), history: this.pushHist(st, r.topic), note: r.wrapped ? '全部のお題を一巡したので、最初から出題します。' : '' });
}
syncFavs() {
const c = window.WADAI_CLOUD;
if (!c) { return; }
c.listFavorites().then((remote) => {
const st = this.state;
const valid = remote.filter((id) => BY_ID[id]);
const merged = st.favs.concat(valid.filter((id) => st.favs.indexOf(id) === -1)).slice(0, 200);
this.setState({ favs: merged });
st.favs.filter((id) => remote.indexOf(id) === -1 && BY_ID[id]).forEach((id) => { c.addFavorite(id).catch(() => {}); });
}).catch(() => {});
}
loadLive() {
const c = window.WADAI_CLOUD;
if (!c) { return; }
c.fetchLive().then((items) => this.setState({ lives: items })).catch(() => {});
}
cloudFav(id, on) {
const c = window.WADAI_CLOUD;
if (!c || !this.state.user || !id) { return; }
(on ? c.addFavorite(id) : c.removeFavorite(id)).catch(() => {});
}
copyText(text) {
const done = () => { this.setState({ copied: true }); clearTimeout(this._ct); this._ct = setTimeout(() => this.setState({ copied: false }), 1600); };
const fallback = () => { try { const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); document.body.removeChild(ta); if (ok) { done(); } } catch (err) {} };
try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); } } catch (err) { fallback(); }
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
this._auth = (e) => { const a = (e && e.detail) || window.WADAI_AUTH; if (a) { const was = !!this.state.user; this.setState((p) => ({ authReady: p.authReady || !!a.ready, user: a.user || null, authErr: a.error || '', authBusy: !!a.busy })); if (!was && a.user) { this.syncFavs(); } } };
this._cloud = () => { this.setState({ cloudReady: true }); this.loadLive(); clearInterval(this._lvt); this._lvt = setInterval(() => this.loadLive(), 300000); if (this.state.user) { this.syncFavs(); } };
this._odais = () => { this.setState({ odaiTick: Date.now() }); if (this.state.user) { this.syncFavs(); } };
window.addEventListener('wadai-cloud', this._cloud);
window.addEventListener('wadai-odais', this._odais);
if (window.WADAI_CLOUD) { this._cloud(); }
window.addEventListener('wadai-auth', this._auth);
this._auth();
this._at = setTimeout(() => { if (!this.state.authReady) { this.setState({ authReady: true }); } }, 5000);
window.addEventListener('keydown', this._kd);
window.addEventListener('keyup', this._ku);
}
componentWillUnmount() {
clearInterval(this._rt);
clearTimeout(this._rd);
window.removeEventListener('wadai-auth', this._auth);
window.removeEventListener('wadai-cloud', this._cloud);
window.removeEventListener('wadai-odais', this._odais);
clearInterval(this._lvt);
clearTimeout(this._at);
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
const au = st.user;
const curItem = BY_TEXT[st.topic];
const isFav = !!curItem && st.favs.indexOf(curItem.id) !== -1;
const canShare = typeof navigator !== 'undefined' && !!navigator.share;
const hintText = st.note || (curItem && curItem.pass ? '苦手ならパスしてOK。「わだいチェンジ」で次のお題に変えられます。' : '');
const favItems = st.favs.map((id) => BY_ID[id]).filter(Boolean);
return {
isFav, isFavStr: String(isFav), notFav: !isFav, favLabel: isFav ? 'お気に入りを解除' : 'お気に入りに追加', toggleFav: () => { if (!curItem) { return; } this.setState({ favs: isFav ? st.favs.filter((x) => x !== curItem.id) : [curItem.id].concat(st.favs).slice(0, 200) }); this.cloudFav(curItem.id, !isFav); },
favList: favItems.map((t) => ({ t: t.text, show: () => this.setState({ topic: t.text, anim: 1 - (st.anim || 0), note: '' }), del: () => { this.setState({ favs: st.favs.filter((x) => x !== t.id) }); this.cloudFav(t.id, false); } })),
cloudOn: st.cloudReady && !window.WADAI_AUTH_DISABLED, cloudOff: !(st.cloudReady && !window.WADAI_AUTH_DISABLED),
odaiText: st.odaiText, odaiMsg: st.odaiMsg, hasOdaiMsg: !!st.odaiMsg, odaiBusy: st.odaiBusy, odaiCount: Array.from(st.odaiText).length + '/80',
odaiInput: (e) => { this.setState({ odaiText: String(e.target.value).slice(0, 80), odaiMsg: '' }); },
submitOdai: async () => { const c = window.WADAI_CLOUD; const t = st.odaiText.trim(); if (!c || st.odaiBusy) { return; } if (Array.from(t).length < 5) { this.setState({ odaiMsg: 'お題は5文字以上で入力してください。' }); return; } this.setState({ odaiBusy: true, odaiMsg: '' }); try { await c.submitOdai(t); this.setState({ odaiText: '', odaiBusy: false, odaiMsg: '投稿しました。管理者が確認して、承認されると公開されます。' }); } catch (err) { this.setState({ odaiBusy: false, odaiMsg: (err && err.message) || '投稿に失敗しました。' }); } },
hasLives: st.lives.length > 0,
liveList: st.lives.slice(0, 6).map((l) => ({ href: 'https://www.youtube.com/watch?v=' + encodeURIComponent(l.video_id), bg: 'background-image: url(\'' + l.thumbnail_url + '\')', title: l.title, channel: l.channel_title })),
favTitle: 'お気に入り（' + favItems.length + '）', hasFavs: favItems.length > 0, noFavs: favItems.length === 0, favCount: favItems.length, favActive: st.type === 'fav', favIdle: st.type !== 'fav',
startFav: () => { if (!favItems.length) { return; } const r = this.pickFrom(-1, st.topic, [], false, 'fav'); this.setState({ type: 'fav', started: true, topic: r.topic, seen: [], anim: 1 - (st.anim || 0), history: this.pushHist(st, r.topic), note: '' }); },
stopFav: () => { const r = this.pickFrom(-1, st.topic, st.seen, st.noRepeat, 'normal'); this.setState({ type: 'normal', topic: r.topic, seen: r.seen, anim: 1 - (st.anim || 0), history: this.pushHist(st, r.topic), note: '' }); },
sceneList: ['指定なし'].concat(SCENES).map((x) => { const on = x === '指定なし' ? !st.scene : st.scene === x; return { label: x, sel: on, off: !on, pick: () => this.setScene(x === '指定なし' ? '' : x) }; }),
hintText, hasHint: !!hintText,
shareLabel: canShare ? 'シェア' : 'リンクをコピー',
shareNative: () => { const u = window.location.href.split('#')[0].split('?')[0]; const text = 'お題：' + st.topic + '\n#わだいぽん'; if (canShare) { navigator.share({ title: 'わだいぽん！', text, url: u }).catch(() => {}); } else { this.copyText(text + '\n' + u); } },

cats,
authIn: !!au, authOut: !au && st.authReady && !window.WADAI_AUTH_DISABLED, authBusy: st.authBusy,
userName: au ? au.name : '', photoStyle: au && /^https:\/\/[^\s"')(]+$/.test(au.photo) ? 'background-image:url("' + au.photo + '")' : '', userInitial: au ? Array.from(au.name)[0] || '' : '',
hasAuthErr: !!st.authErr, authErr: st.authErr,
login: () => { const api = window.WADAI_AUTH_API; if (!api) { this.setState({ authErr: 'ログイン機能を読み込めませんでした。通信状況を確認して、ページを再読み込みしてください。' }); return; } api.login(); },
logout: () => { const api = window.WADAI_AUTH_API; if (api) { api.logout(); } },
dismissAuthErr: () => { const api = window.WADAI_AUTH_API; if (api) { api.clearError(); } this.setState({ authErr: '' }); },
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
copyTopic: () => this.copyText(st.topic),
histList: st.history.map((t, i) => ({ t, k: i + 1, show: () => this.setState({ topic: t, anim: 1 - (st.anim || 0), note: '' }), del: () => this.setState({ history: st.history.filter((x, j) => j !== i) }) })),
clearHist: () => this.setState({ history: [st.topic] }),
typeCls: st.type === 'normal' ? '' : 't-' + st.type,
headText: st.type === 'normal' ? '＼＼ 次のわだいはこれ ／／' : TYPES[st.type].head,
catHide: st.type === 'normal' ? '' : 'hide',
catLabel: (pool.length === 0 && (st.type !== 'normal' || st.sel.length > 0)) ? (st.type === 'fav' ? '- お気に入りがありません -' : '- この条件に合うお題がありません -') : st.type !== 'normal' ? '- 「' + TYPES[st.type].name + '」カード -' : st.sel.length === ALL.length ? '- すべてのカテゴリ -' : st.sel.length === 0 ? '- カテゴリを選んでください -' : st.sel.length === 1 ? '- 「' + DATA[st.sel[0]].name + '」カテゴリ -' : '- ' + st.sel.length + '個のカテゴリから出題 -',
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
