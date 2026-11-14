#!/usr/bin/env python3
"""data/topics.json（お題の唯一のデータソース）から、js/topics.js・用途別ページ・sitemap.xml を生成する。
使い方: python3 tools/build.py   （お題を追加・修正したら必ず実行）"""
import json, os, re, html, datetime
from urllib.parse import quote
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SRC = json.load(open('data/topics.json', encoding='utf-8'))
GENRES = SRC['genres']
ALLT = SRC['topics']
PUB = [t for t in ALLT if not t.get('hidden')]          # ガチャ・一覧に出る公開お題
BASE = 'https://wadaipon.pages.dev'
TODAY = datetime.date.today().isoformat()
e = html.escape
assert len({t['text'] for t in ALLT}) == len(ALLT), '完全一致の重複があります'
assert len({t['id'] for t in ALLT}) == len(ALLT), 'IDの重複があります'

# ---- js/topics.js
open('js/topics.js', 'w', encoding='utf-8').write(
    '/* 自動生成ファイル。直接編集せず、data/topics.json を編集して python3 tools/build.py を実行してください。 */\nwindow.WADAI_TOPICS = '
    + json.dumps({'genres': GENRES, 'topics': ALLT}, ensure_ascii=False, separators=(',', ':')) + ';\n')

def S(genre=None, mood=None, tag=None, level=None, scene=None, fm=None, n=None, genres=None, skip=0):
    r = [t for t in PUB
         if (genre is None or t['genre'] == genre) and (genres is None or t['genre'] in genres)
         and (mood is None or t['mood'] == mood) and (tag is None or tag in t.get('tags', []))
         and (level is None or t.get('level') == level) and (scene is None or scene in t['scenes'])
         and (fm is None or t['firstMeet'] == fm)]
    return r[skip:skip + n] if n else r[skip:]

def ul(items):
    return '<ul class="tl">' + ''.join(f'<li>{e(t["text"])}</li>' for t in items) + '</ul>'
def sec(h, body, lead=''):
    return f'<section><h2>{e(h)}</h2>' + (f'<p>{lead}</p>' if lead else '') + body + '</section>'
def steps(items):
    return '<ol class="tp">' + ''.join(f'<li><b>{e(re.sub(r"^\d+\.\s*", "", a))}</b>{b}</li>' for a, b in items) + '</ol>'
def gl(**p):
    return '/?' + '&'.join(f'{k}={quote(v)}' for k, v in p.items())

PAGES = [('topics', '雑談ネタ一覧'), ('nomikai', '飲み会の話題'), ('haishin', '配信・OBS向けお題'), ('ogiri', '大喜利お題'), ('online', 'オンライン通話の話題')]
BLURB = {'topics': '全お題を検索・絞り込み', 'nomikai': '幹事向け・大人数で盛り上がる', 'haishin': 'OBS導入とコメント参加型お題',
         'ogiri': '難易度別の大喜利お題', 'online': '沈黙を防ぐ・初対面向け'}

def page(slug, title, desc, h1, lead, body, cta, faq=None, script=False):
    url = f'{BASE}/{slug}/'
    ld = [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "わだいぽん！", "item": BASE + '/'},
        {"@type": "ListItem", "position": 2, "name": h1, "item": url}]},
        {"@context": "https://schema.org", "@type": "WebPage", "name": title, "url": url, "inLanguage": "ja", "dateModified": TODAY,
         "isPartOf": {"@type": "WebSite", "name": "わだいぽん！", "url": BASE + '/'}}]
    faqh = ''
    if faq:
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]})
        faqh = '<section><h2>よくある質問</h2>' + ''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in faq) + '</section>'
    ldh = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in ld)
    nav = ''.join(f'<a href="/{s}/"' + (' aria-current="page"' if s == slug else '') + f'>{e(n)}</a>' for s, n in PAGES)
    rel = '<section><h2>ほかの使い方も見る</h2><ul class="rel">' + ''.join(
        f'<li><a href="/{s}/">{e(n)}</a><span>{e(BLURB[s])}</span></li>' for s, n in PAGES if s != slug) + '</ul></section>'
    cta_h = f'<p class="cta"><a href="{cta[1]}">{e(cta[0])}</a></p>'
    img = f'{BASE}/assets/e8d5dbaa069a6652a78911e64f6f37c8.jpg'
    return f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#fecc5c">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="わだいぽん！">
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(desc)}">
<meta name="twitter:image" content="{img}">
<link rel="icon" href="{BASE}/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="{BASE}/favicon.png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
{ldh}<link rel="stylesheet" href="/css/pages.css">
</head>
<body>
<a class="skip" href="#main">本文へ移動</a>
<header class="hd"><a class="logo" href="/"><img src="/assets/71b719b9245d8a863fe940a97056536b.png" alt="わだいぽん！" width="150" height="82"></a><a class="cta-s" href="/">お題を引く</a></header>
<main id="main">
<nav class="bc" aria-label="パンくず"><a href="/">ホーム</a> ＞ <span>{e(h1)}</span></nav>
<h1>{e(h1)}</h1>
<p class="lead">{lead}</p>
{cta_h}
{body}
{faqh}
{rel}
{cta_h}
</main>
<footer><nav aria-label="お題ページ一覧">{nav}</nav><p>© わだいぽん！ <a href="/">ホームへ戻る</a></p></footer>
{'<script src="/js/topics-page.js" defer></script>' if script else ''}
</body>
</html>
'''
OUT = {}
N = len(PUB)
cnt = {g['name']: len([t for t in PUB if t['genre'] == g['name']]) for g in GENRES}

# ===== /topics/ （全お題マスター：検索・絞り込み）
moods = ['ライト', '盛り上がる', 'もしも', 'ディープ', '大喜利', '無茶ぶり', '配信向け']
scenes = ['初対面', '友達', '家族', 'オンライン通話', '配信', '大人数']
ctrl = ('<section class="flt"><h2>お題を探す</h2><div class="fr"><label>キーワード<input type="search" id="q" placeholder="例：旅行、アニメ、朝" autocomplete="off"></label>'
        '<label>ジャンル<select id="fg"><option value="">すべて</option>' + ''.join(f'<option>{e(g["name"])}</option>' for g in GENRES if g['show']) + '</select></label>'
        '<label>雰囲気<select id="fm"><option value="">すべて</option>' + ''.join(f'<option>{m}</option>' for m in moods) + '</select></label>'
        '<label>利用シーン<select id="fs"><option value="">すべて</option>' + ''.join(f'<option>{s}</option>' for s in scenes) + '</select></label></div>'
        f'<p id="cnt" role="status" aria-live="polite">全{N}個を表示中</p><p id="none" hidden>条件に合うお題がありません。条件を変えてみてください。</p></section>')
body = ctrl
for g in GENRES:
    if not g['show']: continue
    items = [t for t in PUB if t['genre'] == g['name']]
    lis = ''.join(f'<li data-g="{e(t["genre"])}" data-m="{e(t["mood"])}" data-s="{e(",".join(t["scenes"]))}">{e(t["text"])}</li>' for t in items)
    link = f'/?type={g["key"]}' if g['pool'] != 'normal' else gl(genre=g['name'])
    body += f'<section class="grp" data-grp="{e(g["name"])}"><h2>{e(g["name"])}（<span class="gc">{len(items)}</span>個）</h2><ul class="tl">{lis}</ul><p class="gl"><a href="{link}">「{e(g["name"])}」のお題をランダムに引く</a></p></section>'
OUT['topics'] = page('topics', f'雑談ネタ・トークテーマ一覧（{N}個）｜検索・絞り込みできる話題集｜わだいぽん！',
    f'雑談・飲み会・配信・オンライン通話で使えるお題{N}個を、ジャンル・雰囲気・利用シーンで絞り込めます。キーワード検索にも対応。気に入ったジャンルはそのままランダムに引けます。',
    f'雑談ネタ・トークテーマ一覧（{N}個）',
    f'「わだいぽん！」に登録されている{N}個のお題を、検索や絞り込みで探せるマスターページです。ジャンルごとの「ランダムに引く」から、そのままガチャを回せます。',
    body, ('わだいぽん！でお題を引く', '/'), script=True)

# ===== /nomikai/
b = sec('乾杯のあと最初の10分：初対面でも答えやすい話題', ul(S(genre='日常', skip=0, n=8, fm=True) if False else [t for t in S(genre='日常', fm=True) if 'tags' not in t][:8] + S(genre='グルメ', fm=True, n=4)),
        '好みの分かれにくい日常・食べ物の話から始めると、誰でも一言目を出しやすくなります。')
b += sec('大人数で全員が答えられる「二択」', ul(S(genre='みんなで', tag='二択')),
         '幹事が読み上げて、全員が「せーの」で答えるだけ。話すのが苦手な人も参加できます。')
b += sec('意見が分かれて盛り上がる話題', ul(S(genre='グルメ', mood='盛り上がる') + S(genre='エンタメ', mood='盛り上がる') + S(genre='価値観', mood='盛り上がる')),
         '正解がなく、人によって答えが違うお題です。「なんで？」と聞き返すだけで話が続きます。')
b += sec('会話が途切れたときの小さな質問', ul(S(tag='沈黙対策')),
         '重い質問ではなく、その場で思いつく一言で答えられるものを選びました。')
b += sec('複数人でできる簡単なゲーム：せーので指さし', ul(S(genre='みんなで', tag='指さし')) + steps([
    ('1. お題を読み上げる。', '幹事がスマホのお題を読みます。'), ('2. 「せーの」で指さす。', '全員が同時に、該当すると思う人を指さします。'),
    ('3. 一番多く指された人が理由を話す。', '自分では気づかない印象が聞けて、盛り上がります。')]),
    '道具なしで、座ったままできる定番の遊び方です。')
b += sec('最後は無茶ぶりで締める（パスOK）', ul(S(genre='無茶ぶり', n=6)), '苦手な人は無理せずパスしてOK。「わだいチェンジ」で次のお題に変えられます。')
b += sec('90分の飲み会での使い方（例）', steps([
    ('〜20分：', '日常・グルメで全員が一言ずつ。まだお酒が回っていない時間帯は軽い質問を。'),
    ('20〜50分：', '二択と「意見が分かれる話題」で全員参加。席が離れたグループもつながります。'),
    ('50〜80分：', '指さしゲームや昔話で、普段話さない一面を引き出します。'),
    ('80分〜：', '無茶ぶりで締め。ガチャを回す係を回していくと幹事の負担が減ります。')]))
OUT['nomikai'] = page('nomikai', '飲み会の話題ネタと盛り上げ方｜初対面・大人数・沈黙対策【幹事向け】｜わだいぽん！',
    '飲み会・宴会の幹事向けに、初対面でも答えやすい話題、大人数で盛り上がる二択、意見が分かれるお題、会話が途切れたときの質問、せーので指さしゲームの進め方をまとめました。',
    '飲み会の話題ネタと盛り上げ方',
    '幹事さんが「次、何を話そう」で困らないよう、飲み会の流れに合わせて使えるお題と遊び方を整理しました。スマホを1台出して、読み上げるだけで使えます。',
    b, ('大人数向けのお題を引く', gl(scene='大人数')))

# ===== /haishin/
obs_url = f'{BASE}/?mode=obs'
b = sec('OBSで「わだいぽん！」を表示する方法', steps([
    ('1. OBSでブラウザソースを追加する。', f'「ソース」の＋から「ブラウザ」を選び、URL欄に <code>{obs_url}</code> を入力します。'),
    ('2. サイズを合わせる。', '幅1920・高さ1080（またはキャンバスと同じ値）に設定します。1280×720の配信でも、お題は画面幅に合わせて自動で調整されます。'),
    ('3. 背景は透明のまま使える。', 'OBSモードは背景が透明です。ほかのソースの上に重ねて表示できます。'),
    ('4. お題を切り替える。', 'OBSのブラウザソースを右クリックして「インタラクト」を開き、お題をクリックするか→キーで切り替えます。通常画面に戻るときは Esc キーです。'),
    ('5. 最初のカードを指定したいとき。', f'URLに <code>&amp;type=ogiri</code>（大喜利）、<code>&amp;genre={quote("配信向け")}</code>（配信向け）などを付けると、最初から決まったお題の種類で始まります。')]),
    'OBSモードの設定はブラウザに保存されます。URLで指定しておくと、OBSを開き直しても同じ状態で始まります。')
b += sec('一人配信でも使いやすいお題', ul([t for t in S(genre='日常', fm=True) if 'tags' not in t][:6] + S(genre='ネット', n=4) + S(genre='妄想', n=4)),
         '視聴者のコメントを待たずに、自分で答えて話を広げられるお題です。')
b += sec('初見さんが参加しやすいお題', ul(S(genre='配信向け', tag='初見さん')), '配信を見に来たきっかけなど、答えが簡単で、正解のない質問です。')
b += sec('コメント欄が参加しやすいお題', ul(S(genre='配信向け', tag='参加型')), 'コメントで一言返せる形にしています。')
b += sec('視聴者に二択で聞くお題', ul(S(genre='配信向け', tag='二択')), '「A」「B」や「1」「2」だけで答えられるので、コメントのハードルが下がります。')
b += sec('ゲストとの会話に使えるお題', ul(S(genre='配信向け', tag='ゲスト')), 'ゲストが答えやすい、軽めの質問を集めました。')
b += sec('大喜利・参加型配信向けのお題', ul(S(genre='大喜利', level='初心者', n=6) + S(genre='大喜利', level='短時間')),
         '短時間で答えられるものを中心に選びました。難易度別の一覧は大喜利ページにあります。')
faq = [('配信や動画で使ってもいいですか？', 'はい。YouTube、Twitch、ツイキャス、ニコニコ生放送など、配信や動画でご自由にお使いいただけます。'),
       ('収益化しているチャンネルでも使えますか？', 'はい。個人・法人を問わず、収益化されている配信でも無料でご利用いただけます。'),
       ('事前の連絡や許可は必要ですか？', '不要です。事前連絡なしでお使いいただけます。'),
       ('クレジット表記は必要ですか？', '任意です。記載しなくても問題ありませんが、概要欄やSNSでご紹介いただけると励みになります。'),
       ('アーカイブや切り抜き動画に残っても問題ないですか？', '問題ありません。切り抜き動画やアーカイブでもそのままご利用いただけます。')]
OUT['haishin'] = page('haishin', '配信・OBSで使えるお題ツール｜透明背景・URL指定・コメント参加型お題｜わだいぽん！',
    'OBSのブラウザソースにそのまま追加できる無料のお題ツール。背景透明のOBSモード、URLでの初期設定、初見さん向け・コメント参加型・二択・ゲスト会話のお題を紹介します。',
    '配信・OBSで使えるお題ツール',
    '雑談配信や参加型配信のネタ切れ対策に。OBSのブラウザソースに追加するだけで、背景透明のお題カードが配信画面に重なります。導入手順と、配信の場面別お題をまとめました。',
    b, ('配信向けのお題を引く', gl(genre='配信向け')), faq)

# ===== /ogiri/
LV = [('初心者', '「こんな〜は嫌だ」の形で、思いついたことをそのまま答えられます。'), ('標準', 'ひとひねり加えると面白くなります。'),
      ('状況想像', '場面を思い浮かべて、その場の一言を答えるお題です。'), ('難しめ', '設定を理解してから答える、少し考えるお題です。'),
      ('短時間', '5秒で答える、テンポ重視のお題です。')]
b = ''
for lv, d in LV:
    items = S(genre='大喜利', level=lv)
    b += sec(f'{lv}（{len(items)}個）', ul(items), d)
b += sec('大喜利の進め方', steps([('制限時間を決める。', '1つのお題につき30秒〜1分で区切ると、テンポよく進みます。'),
    ('点数をつけない。', '「一番笑った人が勝ち」くらいのゆるさのほうが、答えやすくなります。'),
    ('答えが出ないときは変える。', '無理に答えず、「わだいチェンジ」で次のお題へ。')]))
OUT['ogiri'] = page('ogiri', f'大喜利お題一覧（{cnt["大喜利"]}個）｜初心者・難しめ・5秒回答まで難易度別｜わだいぽん！',
    f'大喜利のお題{cnt["大喜利"]}個を、初心者向け・標準・状況想像・難しめ・短時間の難易度別に紹介。飲み会・配信・オンライン通話で遊べます。',
    '大喜利お題一覧（難易度別）',
    '大喜利のお題を、答えやすさで5つに分けました。初めての人は「初心者」から、慣れてきたら「状況想像」や「難しめ」へ進んでください。',
    b, ('大喜利のお題を引く', '/?type=ogiri'))

# ===== /online/
b = sec('初対面でも答えやすい話題', ul(S(genre='みんなで', tag='二択', n=6) + [t for t in S(genre='日常', fm=True) if 'tags' not in t][:6]),
        '相手のことを知らなくても答えられる、軽いお題から始めます。')
b += sec('沈黙を防ぐ小さな質問', ul(S(tag='沈黙対策') + S(genre='ネット', n=4)),
         '誰かが黙ってしまったときに、読み上げるだけで場がつながります。')
b += sec('順番に答えるとき', steps([('名簿順などで順番を決める。', 'オンラインは話し出しが重なりやすいので、順番を先に決めておきます。'),
    ('パスしてもOKにする。', '答えづらいお題は「わだいチェンジ」で次に進めるルールにすると気楽です。'),
    ('読み上げ役は1人。', 'お題を表示するのは1人で十分です。画面共有は必須ではありません。')]) + ul(S(genre='妄想', n=6)),
    '正解のない「もしも」の話は、順番に答える形と相性が良いお題です。')
b += sec('仲良くなってから使いたい話題', ul(S(genre='価値観', n=8) + S(genre='思い出', n=6)),
         '価値観や思い出の話は、場が温まってから使うと深まります。初対面では避けたほうが無難です。')
b += sec('通話でできる簡単なゲーム', ul(S(genre='無茶ぶり', n=5)), '無茶ぶりは一人ずつ順番に。苦手な人はパスしてOKです。')
OUT['online'] = page('online', 'オンライン通話・初対面で使える話題｜Discordで沈黙を防ぐお題集｜わだいぽん！',
    'Discord・Zoom・LINE通話などで会話が止まったときに使える話題を、初対面向け・沈黙対策・順番に答える形・仲良くなってから、の場面別にまとめました。',
    'オンライン通話・初対面で使える話題',
    'Discordやオンライン飲み会、初対面の集まりで、顔が見えない分だけ気まずくなりやすい沈黙。場面に合わせて選べるお題と、順番の決め方をまとめました。',
    b, ('オンライン通話向けのお題を引く', gl(scene='オンライン通話')))

for s, h in OUT.items():
    os.makedirs(s, exist_ok=True)
    open(f'{s}/index.html', 'w', encoding='utf-8').write(h)

# ---- sitemap.xml
urls = [''] + [s + '/' for s, _ in PAGES]
open('sitemap.xml', 'w', encoding='utf-8').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
    f'  <url>\n    <loc>{BASE}/{u}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>{"1.0" if not u else "0.8"}</priority>\n  </url>\n' for u in urls) + '</urlset>\n')

# ---- index.html の件数表記を実データに合わせる
h = open('index.html', encoding='utf-8').read()
approx = (N // 50) * 50
h2 = re.sub(r'\d+(種類|個)以上', f'{approx}個以上', h)
if h2 != h: open('index.html', 'w', encoding='utf-8').write(h2)
print(f'公開お題 {N}個（非公開 {len(ALLT) - N}個）', cnt)
