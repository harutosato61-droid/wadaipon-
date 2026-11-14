/* Supabase の接続設定。ここだけ書き換えてください。
   url と anonKey は「公開してよい」値です（データはRLSで守られます）。service_role キーは絶対に書かないでください。
   空のままなら、ログイン・お題投稿・ライブ表示は自動的に無効になります（ガチャ本体は通常どおり動きます）。 */
window.WADAI_SUPABASE = {
  url: '',      // 例: 'https://abcdefghijklmnop.supabase.co'
  anonKey: '',  // Supabase > Project Settings > API の anon public キー
  // 管理画面を開ける Google アカウントの SHA-256（メールを小文字にした文字列のハッシュ）。画面表示用の補助で、実際の制限は DB 側の RLS が行います。
  adminEmailSha256: 'bc094b5b9dfa7481a7ff0baed634edfb14719ecbcedb68772c43dc3530fb0026'
};
