/* わだいぽん！ — お題データの読み込み（js/topics.js ← data/topics.json から tools/build.py が生成） */
(function () {
'use strict';
const SRC = window.WADAI_TOPICS;
const TOPICS = SRC.topics.map((t) => Object.freeze(Object.assign({}, t)));
const BY_ID = {};
const BY_TEXT = {};
TOPICS.forEach((t) => { BY_ID[t.id] = t; BY_TEXT[t.text] = t; });
const pool = (name) => TOPICS.filter((t) => t.genre === name).map((t) => t.text);
const DATA = SRC.genres.filter((g) => g.pool === 'normal').map((g) => ({ name: g.name, show: g.show, topics: pool(g.name) }));
const ALL = DATA.map((c, i) => i).filter((i) => DATA[i].show);
// 初期状態では「配信向け」は含めない（配信者が自分で選ぶカテゴリ）
const DEFAULT_SEL = ALL.filter((i) => DATA[i].name !== '配信向け');
const HEADS = { anime: '＼＼ アニメわだいはこれ ／／', memory: '＼＼ 思い出わだいはこれ ／／', ogiri: '＼＼ 次のおだいはこれ ／／', moshimo: '＼＼ もしもわだいはこれ ／／' };
const TYPES = {};
Object.keys(HEADS).forEach((k) => { const g = SRC.genres.find((x) => x.key === k); TYPES[k] = { name: g.name, head: HEADS[k], topics: pool(g.name) }; });
TYPES.fav = { name: 'お気に入り', head: '＼＼ お気に入りわだい ／／', topics: [] };
const SCENES = ['初対面', '友達', '家族', 'オンライン通話', '配信', '大人数'];
// 承認済みの投稿お題（Supabase から取得）用のジャンル。取得できるまでは一覧に出さない。
DATA.push({ name: 'みんなの投稿', show: false, topics: [] });
const USER_IDX = DATA.length - 1;
const addUserOdais = (rows) => {
  const texts = [];
  rows.forEach((r) => {
    const text = String(r.content || '').trim();
    if (!text || BY_TEXT[text]) { return; }
    const item = Object.freeze({ id: 'odai:' + r.id, text, genre: 'みんなの投稿', mood: 'ライト', scenes: SCENES.filter((x) => x !== '初対面'), size: 'any', firstMeet: false });
    BY_ID[item.id] = item; BY_TEXT[text] = item; texts.push(text);
  });
  if (!texts.length) { return; }
  DATA[USER_IDX].topics = DATA[USER_IDX].topics.concat(texts);
  DATA[USER_IDX].show = true;
  if (ALL.indexOf(USER_IDX) === -1) { ALL.push(USER_IDX); }
};
window.WADAI = window.WADAI || {};
Object.assign(window.WADAI, { DATA, ALL, DEFAULT_SEL, TYPES, TOPICS, BY_ID, BY_TEXT, SCENES, addUserOdais });
})();
