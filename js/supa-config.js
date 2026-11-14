/* Supabase の接続設定。ここだけ書き換えてください。
   url と anonKey は「公開してよい」値です（データはRLSで守られます）。service_role キーは絶対に書かないでください。
   空のままなら、ログイン・お題投稿・ライブ表示は自動的に無効になります（ガチャ本体は通常どおり動きます）。 */
window.WADAI_SUPABASE = {
  url: 'https://peglvlpsydtrkujwgeii.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZ2x2bHBzeWR0cmt1andnZWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NDQwNDUsImV4cCI6MjExMDIyMDA0NX0.dOwaTMS9cmFRvuOzqj1oydTvbcbid-YqxOBd9tECNqs',
  // 管理画面を開ける Google アカウントの SHA-256（メールを小文字にした文字列のハッシュ）。画面表示用の補助で、実際の制限は DB 側の RLS が行います。
  adminEmailSha256: 'bc094b5b9dfa7481a7ff0baed634edfb14719ecbcedb68772c43dc3530fb0026'
};
