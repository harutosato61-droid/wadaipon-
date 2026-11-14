/* わだいぽん！ — Supabase 連携（Googleログイン / お気に入り同期 / お題投稿 / みんなの投稿 / ライブ配信） */
const cfg = window.WADAI_SUPABASE || {};
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.url || '') && String(cfg.anonKey || '').length > 20;

export let supabase = null;
const state = { ready: false, busy: false, user: null, error: '' };
window.WADAI_AUTH = state;
const emit = () => window.dispatchEvent(new CustomEvent('wadai-auth', { detail: state }));

if (!configured) {
  window.WADAI_AUTH_DISABLED = true;   // 未設定のあいだは、ログイン関連の表示をすべて隠す
  state.ready = true; emit();
} else {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.119.0');
  supabase = createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });

  const toUser = (session) => {
    const u = session && session.user; if (!u) { return null; }
    const m = u.user_metadata || {};
    return { id: u.id, name: m.full_name || m.name || m.user_name || m.global_name || u.email || 'ユーザー', photo: m.avatar_url || m.picture || '' };
  };
  window.WADAI_AUTH_API = {
    async login(provider = 'google') {
      state.busy = true; state.error = ''; emit();
      const options = { redirectTo: window.location.origin + window.location.pathname };
      const { error } = await supabase.auth.signInWithOAuth({ provider, options });
      if (error) { state.busy = false; state.error = 'ログインに失敗しました。時間をおいて、もう一度お試しください。'; emit(); }
    },
    async logout() { await supabase.auth.signOut(); },
    clearError() { state.error = ''; emit(); }
  };
  supabase.auth.onAuthStateChange((_e, session) => { state.user = toUser(session); state.ready = true; state.busy = false; emit(); });
  supabase.auth.getSession().then(({ data }) => { state.user = toUser(data.session); state.ready = true; emit(); });

  /* ---- お気に入り: 組み込みお題は topic_id、承認済みの投稿お題は 'odai:<uuid>' ---- */
  const col = (id) => (id.startsWith('odai:') ? ['odai_id', id.slice(5)] : ['topic_id', id]);
  const cloud = {
    async listFavorites() {
      const { data, error } = await supabase.from('favorites').select('topic_id, odai_id').order('created_at', { ascending: false });
      if (error) { throw error; }
      return data.map((r) => (r.odai_id ? 'odai:' + r.odai_id : r.topic_id));
    },
    async addFavorite(id) { const [c, v] = col(id); const { error } = await supabase.from('favorites').insert({ [c]: v }); if (error && error.code !== '23505') { throw error; } },
    async removeFavorite(id) { const [c, v] = col(id); const { error } = await supabase.from('favorites').delete().eq(c, v); if (error) { throw error; } },
    async submitOdai(content) {
      const text = String(content || '').trim();
      if (text.length < 5 || text.length > 80) { throw new Error('お題は5〜80文字で入力してください。'); }
      const { error } = await supabase.from('odais').insert({ content: text });     // user_id / status は送らない（DB側で決まる）
      if (error) { throw new Error(String(error.message).includes('rate_limit') ? '投稿は1日5件までです。' : '投稿に失敗しました。'); }
    },
    async fetchLive() {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();            // 1時間以上更新がないものは出さない
      const { data, error } = await supabase.from('live_streams').select('video_id, title, channel_title, thumbnail_url, updated_at').gte('updated_at', since).order('updated_at', { ascending: false });
      if (error) { throw error; }
      return data.filter((r) => /^[A-Za-z0-9_-]{11}$/.test(r.video_id) && /^https:\/\/i\.ytimg\.com\//.test(r.thumbnail_url));
    }
  };
  window.WADAI_CLOUD = cloud;
  window.dispatchEvent(new CustomEvent('wadai-cloud'));

  // 承認済みの投稿お題を「みんなの投稿」ジャンルとして追加
  supabase.from('odais').select('id, content').eq('status', 'approved').order('created_at', { ascending: false }).limit(300)
    .then(({ data }) => { if (data && data.length && window.WADAI && window.WADAI.addUserOdais) { window.WADAI.addUserOdais(data); window.dispatchEvent(new CustomEvent('wadai-odais')); } }, () => {});
}
