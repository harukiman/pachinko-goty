/*
 * story.js — キャラクター設定とストーリー式ムービー脚本（リッチ版）
 * 写真6枚＋別形態フィルター(dark/awaken/gold/neg/ghost)＋アニメ背景で人気実機級の演出に。
 */
(function () {
  const C = {
    peace:  { name: 'ピース小僧',     img: 'reel_peace.jpg',  color: '#3af0ff' },
    mosaic: { name: '謎のモザイク男', img: 'reel_mosaic.jpg', color: '#9d86c4' },
    hero:   { name: 'イエローヒーロー', img: 'reel_hero.jpg',  color: '#ffd23b' },
    doya:   { name: 'ドヤ皇帝',       img: 'reel_doya.jpg',   color: '#ff8a00' },
    legend: { name: '未来の賢者',     img: 'reel_legend.jpg', color: '#ff6ec7' },
    black:  { name: '闇のマスク',     img: 'reel_black.jpg',  color: '#ff3b3b' },
    // 追加キャスト
    gian:    { name: 'ガキ大将ガン太', img: 'char_gian.jpg',      color: '#ff8a00' },
    gorilla: { name: '豪腕ゴリ将軍',   img: 'char_gorilla.jpg',   color: '#b06a2a' },
    general: { name: '大元帥',         img: 'char_general.jpg',   color: '#d44' },
    gent:    { name: '紳士マスター',   img: 'char_gentleman.jpg', color: '#ffd23b' },
    cool:    { name: 'クール・ジョー', img: 'char_cool.jpg',      color: '#ffb000' },
    jono:    { name: '熱血のジョー',   img: 'char_jonouchi.jpg',  color: '#ffd23b' },
    pepper:  { name: '相棒ペッパー',   img: 'char_pepper.jpg',    color: '#9fe8ff' },
    dog:     { name: '幸運の子犬モモ', img: 'char_dog.jpg',       color: '#ffcf6e' },
    alien:   { name: '宇宙人ゼ',       img: 'char_alien.jpg',     color: '#9d86c4' },
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  // シーン生成ヘルパ
  const sc = (ch, text, o = {}) => ({
    char: ch && C[ch].img, name: ch && C[ch].name, color: o.color || (ch && C[ch].color),
    text, bgClass: o.bg, title: o.title, fx: o.fx, form: o.form, pos: o.pos, kb: o.kb,
    dur: o.dur || 1500, se: o.se, shock: o.shock,
  });
  const t = (title, text, o = {}) => ({ title, text, bgClass: o.bg, color: o.color,
    fx: o.fx, dur: o.dur || 1500, se: o.se, shock: o.shock });

  function opening() {
    return [
      t('FORTUNE FIRE', '〜200円から世界の頂点へ〜', { bg: 'bg-legend', color: '#ff6ec7', dur: 1800, fx: 'flash', shock: true }),
      { title: '', text: '西暦20XX——　ひしめくパチンコホール。', bgImg: 'bg_crowd.jpg', dur: 1600 },
      t('', 'パチンコで一億を稼ぎ「FIRE」を目指す者がいた。', { bg: 'bg-space', dur: 1700 }),
      { char: C.peace.img, name: C.peace.name, color: C.peace.color, text: 'オレはピース小僧！　一億稼いで、絶対FIREしてやる！', bgImg: 'bg_skytree.jpg', fx: 'zoom', kb: true, dur: 1700 },
      sc('pepper', '相棒のペッパーだ。データ分析は任せろ、ピピッ。', { bg: 'bg-space', kb: true, dur: 1500 }),
      sc('dog', '（幸運の子犬モモも応援してるワン！）', { bg: 'bg-aurora', kb: true, dur: 1300 }),
      sc('black', '……ククク。一億への道、容易くはないぞ。', { bg: 'bg-fire', form: 'dark', fx: 'shake', dur: 1700 }),
      sc('legend', '50年後の君よ。その手で運命を掴め——。', { bg: 'bg-legend', form: 'ghost', kb: true, dur: 1900 }),
      t('運命の一玉、放て。', '', { bg: 'bg-thunder', fx: 'flash', shock: true, dur: 1200, color: '#ffd23b' }),
    ];
  }

  // リーチ帯ごとに敵プールからランダム選出（毎回違う相手で飽きさせない）
  const POOL = {
    super:     ['doya', 'gian', 'gorilla', 'jono', 'alien'],
    cutin_red: ['black', 'general', 'gorilla', 'alien'],
    cutin_gold:['hero', 'gent', 'cool'],
    allreel:   ['legend'],
  };
  function battle(reachId) {
    const tier = POOL[reachId] ? reachId : 'super';
    const who = pick(POOL[tier]);
    // 金カットイン帯＝味方参戦型
    if (tier === 'cutin_gold') {
      const ally = C[who];
      return [
        sc('peace', 'もうダメだ…！だれか——！', { bg: 'bg-space', fx: 'shake', dur: 1200 }),
        t('その時！', '', { bg: 'bg-gold', fx: 'flash', shock: true, dur: 900, color: '#ffd23b' }),
        sc(who, `待たせたな！${ally.name}、参上！`, { bg: 'bg-gold', form: 'gold', fx: 'zoom', kb: true, se: 'kakutei' }),
        t('黄金共闘', '勝利を掴め！', { bg: 'bg-aurora', fx: 'burst', shock: true, dur: 1300, color: '#ffd23b' }),
      ];
    }
    // 激熱帯＝強敵闇型
    if (tier === 'cutin_red') {
      const en = C[who];
      return [
        t('— 強敵 襲来 —', '', { bg: 'bg-thunder', dur: 1000, color: '#ff3b3b' }),
        sc(who, `よく来た…${en.name}が相手だ。容赦はせん。`, { bg: 'bg-fire', form: 'dark', fx: 'shake', kb: true }),
        sc('peace', 'うっ…こいつ、ケタ違いに強い…！', { bg: 'bg-speed', fx: 'speed', dur: 1300 }),
        sc(who, '砕け散れェ——！', { bg: 'bg-fire', form: 'dark', fx: 'burst', se: 'cutin', dur: 1300 }),
        t('激 闘', '運命の一撃——！！', { bg: 'bg-thunder', fx: 'flash', shock: true, dur: 1200, color: '#ff3b3b' }),
      ];
    }
    if (tier === 'allreel') return legend();
    // スーパー帯＝挑戦型
    const en = C[who];
    return [
      t('— 強敵出現 —', '', { bg: 'bg-fire', dur: 1000, color: '#ff8a00' }),
      sc(who, `フハハ！${en.name}、いざ尋常に勝負！`, { bg: 'bg-fire', fx: 'zoom', kb: true }),
      sc('peace', '負けるか…伝説はオレが掴む！', { bg: 'bg-speed', fx: 'speed', dur: 1300 }),
      t('激突！', '勝負の行方は…！？', { bg: 'bg-thunder', fx: 'flash', shock: true, dur: 1100, color: '#ff8a00' }),
    ];
  }

  function legend() {
    return [
      t('— 伝 説 —', '時を超えし者が、現れる。', { bg: 'bg-legend', color: '#ff6ec7', dur: 1700 }),
      sc('legend', '50年後の君へ。よくぞここまで辿り着いた。', { bg: 'bg-aurora', form: 'ghost', fx: 'zoom', kb: true, se: 'kakutei' }),
      sc('legend', '今、伝説の扉を開けよう——全回転、確変大当りだ！', { bg: 'bg-legend', fx: 'burst', shock: true, dur: 1900, color: '#ff6ec7' }),
    ];
  }

  function awaken(kakuhen) {
    if (kakuhen) return [
      t('覚醒 RUSH', '突入！！', { bg: 'bg-rush', fx: 'flash', shock: true, dur: 1500, se: 'kakutei', color: '#ffd23b' }),
      sc('hero', 'ここからが本番だ！連チャンで一億を駆け上がれ！', { bg: 'bg-gold', form: 'gold', fx: 'zoom', kb: true, dur: 1600 }),
    ];
    return [ t('時短 突入', 'チャンス継続！', { bg: 'bg-gold', fx: 'flash', dur: 1300, color: '#ffd23b' }) ];
  }

  // 予告ムービー（通常スピンにもふんだんに。1シーンの短尺）
  function yokoku(hot) {
    const allies = ['peace', 'pepper', 'dog', 'mosaic'];
    const hots = ['hero', 'legend', 'black', 'doya', 'gent', 'cool'];
    const who = pick(hot ? hots : allies.concat(hots));
    const coolLines = ['……これは、来るぞ。', '流れが変わった——！', '気配がする…激アツだ！', 'ここからが本番だ。'];
    const calmLines = ['お、なんか起きそう？', 'チャンス…かも？', 'ふむ、どうなる…', '今日はツイてるかも。', '一玉入魂、いくぞ。'];
    const form = who === 'black' ? 'dark' : who === 'legend' ? 'ghost' : who === 'hero' ? 'gold' : null;
    return [ sc(who, pick(hot ? coolLines : calmLines), {
      bg: hot ? pick(['bg-thunder', 'bg-fire', 'bg-aurora']) : pick(['bg-space', 'bg-aurora']),
      fx: hot ? pick(['flash', 'zoom', 'speed']) : null, form, kb: true, dur: hot ? 1300 : 1000,
    }) ];
  }

  // ノーマルリーチ用の短尺ムービー
  function normalReach() {
    const who = pick(['doya', 'gian', 'jono', 'mosaic', 'pepper']);
    return [ sc(who, pick(['ノーマルから一発逆転だ！', 'ここで決める…！', '油断は禁物だぜ。', '揃え——！']),
      { bg: 'bg-fire', fx: 'zoom', kb: true, dur: 1300 }) ];
  }

  function victory(renchan) {
    return [ sc('peace', renchan >= 3 ? `${renchan}連!! 止まらない、これが伝説の力だ！` : 'よし、勝った——！',
      { bg: 'bg-gold', fx: 'zoom', dur: 1300 }) ];
  }

  // ===== プレイヤー側 人生ストーリー（目標到達ムービー。パチンコ台のサーガとは別軸で連動）=====
  // goal = { amt, level, name }
  function ending(goal) {
    const amt = (goal && goal.amt) || 1e8, name = (goal && goal.name) || 'FIRE達成';
    const amtTxt = amt >= 1e12 ? (amt / 1e12) + '兆円' : amt >= 1e8 ? (amt / 1e8) + '億円' : (amt / 1e4) + '万円';
    // 1億 = FIRE（人生が変わる瞬間。感動の章）
    if (amt === 1e8) return [
      t('🎉 一億円 達成 🎉', '', { bg: 'bg-gold', fx: 'flash', shock: true, dur: 1500, color: '#ffd23b' }),
      t('', '——かつて財布に200円しかなかった男が、ついに。', { bg: 'bg-space', dur: 1800 }),
      sc('peace', 'やった…やったぞ！　オレ、FIRE達成だ！！', { bg: 'bg-aurora', form: 'awaken', fx: 'zoom', kb: true, dur: 1800 }),
      sc('pepper', 'おめでとう相棒。台の中の伝説が、現実になった瞬間だ。ピピッ。', { bg: 'bg-space', kb: true, dur: 1900 }),
      sc('dog', '（…やったね。モモ、ずっと、ずっと信じてたワン）', { bg: 'bg-aurora', kb: true, dur: 1800 }),
      { char: C.peace.img, name: C.peace.name, color: C.peace.color, text: '夜景を見ながら、ゆっくり生きるよ。…ありがとう、みんな。', bgImg: 'bg_skytree.jpg', kb: true, dur: 2100 },
      t('🌅 FIRE 達成 🌅', '〜 だが、これは新たな人生の幕開け 〜', { bg: 'bg-aurora', fx: 'burst', shock: true, dur: 2300, color: '#ffd23b' }) ];
    // 100兆 = 真の最終エンディング
    if (amt >= 1e14) return [
      t('🌌 100兆円 🌌', '〜 世界の頂点 〜', { bg: 'bg-aurora', fx: 'flash', shock: true, dur: 1700, color: '#ff6ec7' }),
      sc('legend', '100兆。もはや国家をも超えた。君は、歴史そのものだ。', { bg: 'bg-legend', form: 'ghost', fx: 'burst', kb: true, dur: 2100 }),
      sc('peace', 'あの200円のオレが…世界のてっぺんに。夢って、叶うんだな。', { bg: 'bg-aurora', form: 'awaken', fx: 'zoom', kb: true, dur: 2100 }),
      sc('dog', '（モモ、誇らしいワン。…ずっと、君のそばにいられて）', { bg: 'bg-aurora', kb: true, dur: 1900 }),
      sc('black', 'フッ…見事だ。お前こそ、真の伝説だ。', { bg: 'bg-legend', form: 'dark', kb: true, dur: 1800 }),
      t('THE TRUE LEGEND', '〜 君の物語は永遠に語り継がれる 〜 完', { bg: 'bg-legend', fx: 'burst', shock: true, dur: 2600, color: '#ff6ec7' }) ];
    // 中間目標（5億〜10兆）：名称付きの人生ステージ。サーガのキャラがゲスト祝福。
    const guest = amt >= 1e13 ? 'legend' : amt >= 1e12 ? 'hero' : amt >= 5e10 ? 'doya' : amt >= 1e10 ? 'gent' : amt >= 5e9 ? 'gorilla' : 'pepper';
    const lines = {
      legend: '10兆…時を超える私でさえ、見たことのない高みだ。',
      hero: '1兆だと!?　もう人間をやめてる領域だぜ、相棒！',
      doya: '500億…完全に格が違う。皇帝の称号、貴様に譲ろう。',
      gent: '100億の大台。…お見事、と言わせていただきましょう。',
      gorilla: 'ウホッ!?　50億…豪腕の私も、ひれ伏すしかない。',
      pepper: `総資産 ${amtTxt}。計算が追いつかない…君は規格外だ、ピピッ。`,
    };
    return [
      t(`🏆 ${amtTxt} 到達 🏆`, '〜 ' + name + ' 〜', { bg: 'bg-gold', fx: 'flash', shock: true, dur: 1600, color: '#ffd23b' }),
      sc(guest, lines[guest], { bg: amt >= 1e12 ? 'bg-aurora' : 'bg-gold', form: guest === 'legend' ? 'ghost' : guest === 'hero' ? 'gold' : null, fx: 'zoom', kb: true, dur: 1900 }),
      sc('peace', '止まらないぞ。次の景色を、この目で見るまでは！', { bg: 'bg-aurora', form: 'awaken', fx: 'burst', shock: true, kb: true, dur: 1900 }),
      t(name.toUpperCase ? name : name, '〜 さらなる高みへ 〜', { bg: 'bg-legend', dur: 1700, color: '#ff6ec7' }) ];
  }

  // ===== 壮大なストーリー（章立てサーガ）。初当りごとに1章進行 =====
  const CHAPTERS = [
    '第一章 旅立ち', '第二章 仲間との出会い', '第三章 ガキ大将の試練', '第四章 闇の前哨戦',
    '第五章 黄金の援軍', '第六章 豪腕の壁', '第七章 宇宙よりの刺客', '第八章 決戦前夜', '最終章 闇のマスク',
  ];
  function chapterCount() { return CHAPTERS.length; }
  function chapterTitle(i) { return CHAPTERS[Math.min(i, CHAPTERS.length - 1)]; }
  function chapter(i) {
    const head = (sub, bg, col) => t(CHAPTERS[i], sub, { bg: bg || 'bg-legend', color: col || '#ff6ec7', dur: 1700, fx: 'flash', shock: true });
    switch (i) {
      case 0: return [ head('〜 すべての始まり 〜'),
        sc(null, 'うだつの上がらない毎日。だが、彼には夢があった。', { bg: 'bg-space', dur: 1700 }),
        sc('peace', '一億円を稼いでFIREする！　働かずに自由に生きるんだ！', { bg: 'bg-aurora', fx: 'zoom', kb: true, dur: 1700 }),
        sc('dog', '（モモは知ってる…この人、昨日も財布に200円しかなかったワン）', { bg: 'bg-aurora', kb: true, dur: 1700 }),
        sc('peace', '聞こえてるぞモモ!?　……でも、今日から本気だ。', { bg: 'bg-aurora', fx: 'zoom', kb: true, dur: 1600 }),
        sc('doya', 'フッ、夢を見るのは自由だ。だが現実は甘くない。ドヤ皇帝が教えてやる。', { bg: 'bg-fire', fx: 'zoom', kb: true, dur: 1900 }),
        t('伝説は、ここから始まる。', '', { bg: 'bg-thunder', fx: 'burst', shock: true, dur: 1500, color: '#ffd23b' }) ];
      case 1: return [ head('〜 心強き仲間たち 〜', 'bg-space', '#9fe8ff'),
        sc('pepper', '初めまして。データ分析ロボのペッパーだ。君の勝率、上げてみせる、ピピッ。', { bg: 'bg-space', kb: true, dur: 1800 }),
        sc('peace', '相棒…！　心強いよ。で、いくら勝てる？', { bg: 'bg-space', fx: 'zoom', kb: true, dur: 1500 }),
        sc('pepper', '計算結果：このままでは3日で破産。…ピピッ。', { bg: 'bg-space', kb: true, dur: 1600 }),
        sc('peace', 'もっと優しい嘘をついてくれ!!', { bg: 'bg-aurora', fx: 'shake', kb: true, dur: 1400 }),
        sc('dog', '（…それでも、モモはこの人を信じるワン）', { bg: 'bg-aurora', kb: true, dur: 1800 }),
        sc('peace', 'みんな…ありがとう。仲間がいれば、どこまでも行ける！', { bg: 'bg-aurora', fx: 'burst', shock: true, kb: true, dur: 1800 }) ];
      case 2: return [ head('〜 腕力の試練 〜', 'bg-fire', '#ff8a00'),
        sc('gian', 'おっせえなあ新入り！　オレ様、ガキ大将ガン太の出番だ！', { bg: 'bg-fire', fx: 'zoom', kb: true, dur: 1700 }),
        sc('gian', 'お前のものはオレのもの！　お前の出玉もオレのもの！', { bg: 'bg-fire', fx: 'shake', kb: true, dur: 1700 }),
        sc('peace', 'そのセリフ、どっかで聞いたぞ…！　でも玉は渡さない！', { bg: 'bg-speed', fx: 'speed', dur: 1600 }),
        sc('peace', '力じゃ敵わない。なら、粘りと根性で勝つ——！', { bg: 'bg-thunder', fx: 'flash', shock: true, kb: true, dur: 1700 }) ];
      case 3: return [ head('〜 忍び寄る闇 〜', 'bg-thunder', '#ff3b3b'),
        sc(null, '勝ち進む彼の前に、本物の「組織」が動き出す。', { bg: 'bg-thunder', dur: 1700 }),
        sc('general', '私は大元帥。我が軍門に下れ。さもなくば——破滅だ。', { bg: 'bg-fire', form: 'dark', fx: 'shake', kb: true, dur: 1900 }),
        sc('peace', '（こいつ…これまでの相手とは、格が違う…！）', { bg: 'bg-thunder', fx: 'shake', dur: 1600 }),
        sc('pepper', '相棒、勝率17%。…だが君は、いつも計算を超えてきた。', { bg: 'bg-space', kb: true, dur: 1800 }),
        sc('peace', 'だったら…超えてやるさ。何度でも！', { bg: 'bg-thunder', fx: 'burst', shock: true, kb: true, dur: 1700 }) ];
      case 4: return [ head('〜 黄金の援軍 〜', 'bg-gold', '#ffd23b'),
        sc('peace', 'ぐ…っ、もう、立ってられない…ここまでなのか…', { bg: 'bg-space', fx: 'shake', dur: 1700 }),
        sc('dog', '（立って…！　お願い、立ってよ…！）', { bg: 'bg-space', kb: true, dur: 1600 }),
        t('——その時、空が黄金に輝いた。', '', { bg: 'bg-gold', fx: 'flash', shock: true, dur: 1300, color: '#ffd23b' }),
        sc('hero', '待たせたな！　正義のイエローヒーロー、覚醒参上ッ！', { bg: 'bg-gold', form: 'gold', fx: 'zoom', kb: true, se: 'kakutei', dur: 1900 }),
        sc('peace', 'あんたは…！　なんで、オレなんかを助けて…', { bg: 'bg-gold', kb: true, dur: 1600 }),
        sc('hero', '夢を諦めない奴を、ほっとけるかよ。さあ、一緒に掴むぞ——黄金を！', { bg: 'bg-aurora', form: 'gold', fx: 'burst', shock: true, kb: true, dur: 2000 }) ];
      case 5: return [ head('〜 立ちはだかる豪腕 〜', 'bg-fire', '#b06a2a'),
        sc('gorilla', 'ウホ……豪腕ゴリ将軍。この腕、砕けるものなら砕いてみろ。', { bg: 'bg-fire', form: 'dark', fx: 'shake', kb: true, dur: 1800 }),
        sc('peace', '（でかい…壁みたいだ。心が、折れそうになる）', { bg: 'bg-thunder', fx: 'shake', dur: 1600 }),
        sc('pepper', '思い出せ相棒。ここまで一緒に越えてきた仲間の顔を。', { bg: 'bg-space', kb: true, dur: 1700 }),
        sc('peace', '……そうだ。オレは、一人じゃない。だから——折れない！！', { bg: 'bg-speed', fx: 'burst', shock: true, kb: true, dur: 1800 }) ];
      case 6: return [ head('〜 宇宙よりの刺客 〜', 'bg-space', '#9d86c4'),
        sc('alien', 'ワレワレハ宇宙人。キミノFIRE、ジャマシニキタ。', { bg: 'bg-space', fx: 'zoom', kb: true, dur: 1700 }),
        sc('peace', '宇宙人まで来た!?　オレの夢、銀河規模で邪魔されてる!?', { bg: 'bg-space', fx: 'shake', kb: true, dur: 1600 }),
        sc('alien', '……ジツハ、ワレモFIREシタイ。コツ、オシエテ。', { bg: 'bg-aurora', kb: true, dur: 1700 }),
        sc('peace', '敵じゃないんかい！！　…まあいい、夢見る奴は皆、仲間だ。', { bg: 'bg-aurora', fx: 'zoom', kb: true, dur: 1800 }) ];
      case 7: return [ head('〜 決戦前夜 〜', 'bg-legend'),
        { char: C.peace.img, name: C.peace.name, color: C.peace.color, text: 'こんなに遠くまで来たんだな…全部、みんなのおかげだ。', bgImg: 'bg_skytree.jpg', kb: true, dur: 2000 },
        sc('dog', '（明日、終わるんだね。…モモ、ずっとそばにいるワン）', { bg: 'bg-legend', kb: true, dur: 1900 }),
        sc('peace', 'モモ…泣くなよ。…って、オレが泣いてどうすんだ。', { bg: 'bg-legend', kb: true, dur: 1700 }),
        sc('legend', '50年後の君よ。明日、己の伝説を信じよ。運命は、その手の中だ。', { bg: 'bg-legend', form: 'ghost', kb: true, dur: 2100 }) ];
      default: return [ head('〜 闇のマスク、降臨 〜', 'bg-thunder', '#ff3b3b'),
        sc('black', 'ここまで来たか、小僧。だが——伝説への扉は、この私が閉ざす！', { bg: 'bg-fire', form: 'dark', fx: 'burst', se: 'cutin', kb: true, dur: 2000 }),
        sc('peace', '（こいつが…ラスボス。全身が震える。でも——）', { bg: 'bg-thunder', fx: 'shake', dur: 1600 }),
        sc('peace', '——でも、もう怖くない。仲間がいる。夢がある！', { bg: 'bg-aurora', fx: 'zoom', kb: true, dur: 1700 }),
        sc('black', 'ならば来い。貴様の覚悟、闇で塗り潰してくれる！', { bg: 'bg-fire', form: 'dark', fx: 'shake', kb: true, dur: 1800 }),
        sc('peace', '闇のマスク——！　お前を超えて、オレは伝説になる！！', { bg: 'bg-thunder', fx: 'flash', shock: true, kb: true, dur: 1800 }),
        t('運命の、最終決戦——！！', '', { bg: 'bg-aurora', fx: 'burst', shock: true, dur: 1800, color: '#ffd23b' }) ];
    }
  }

  window.STORY = { CHARS: C, opening, battle, legend, awaken, victory, ending, yokoku, normalReach,
                   chapter, chapterTitle, chapterCount };
})();
