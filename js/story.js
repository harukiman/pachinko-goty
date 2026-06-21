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
      t('CR フレンズ伝説', '〜50年後の君へ〜', { bg: 'bg-legend', color: '#ff6ec7', dur: 1800 }),
      t('', '西暦20XX——　パチンコで一億を稼ぎ', { bg: 'bg-space', dur: 1500 }),
      t('', '自由を掴む「FIRE」を目指す者がいた。', { bg: 'bg-space', dur: 1600 }),
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
    super:     ['doya', 'gian', 'gorilla', 'jono'],
    cutin_red: ['black', 'general', 'gorilla'],
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

  function victory(renchan) {
    return [ sc('peace', renchan >= 3 ? `${renchan}連!! 止まらない、これが伝説の力だ！` : 'よし、勝った——！',
      { bg: 'bg-gold', fx: 'zoom', dur: 1300 }) ];
  }

  // FIRE 到達エンディング（1億/5億/10億）
  function ending(level) {
    if (level >= 10) return [
      t('💎 10億円 突破 💎', '', { bg: 'bg-aurora', fx: 'flash', shock: true, dur: 1500, color: '#ff6ec7' }),
      sc('legend', '——10億。もはや伝説を超え、神話の領域だ。', { bg: 'bg-legend', form: 'ghost', kb: true, dur: 1900 }),
      sc('peace', 'オレ…伝説のフレンズに、本当になれたんだ！', { bg: 'bg-aurora', form: 'awaken', fx: 'zoom', kb: true, dur: 1800 }),
      t('THE LEGEND', '〜 君こそが伝説だ 〜', { bg: 'bg-legend', fx: 'burst', shock: true, dur: 2200, color: '#ff6ec7' }),
    ];
    if (level >= 5) return [
      t('🏆 5億円 達成 🏆', '', { bg: 'bg-gold', fx: 'flash', shock: true, dur: 1400, color: '#ffd23b' }),
      sc('hero', '5億だと…！？　もはや誰も止められん！', { bg: 'bg-gold', form: 'gold', fx: 'zoom', kb: true, dur: 1800 }),
      sc('doya', 'ぐ…ぬ…見事だ、認めてやる…！', { bg: 'bg-fire', fx: 'shake', dur: 1600 }),
      t('GRAND MASTER', '〜 伝説の途中 〜', { bg: 'bg-aurora', fx: 'burst', shock: true, dur: 1900, color: '#ffd23b' }),
    ];
    // 1億 = FIRE エンディング
    return [
      t('🎉 一億円 達成 🎉', '', { bg: 'bg-gold', fx: 'flash', shock: true, dur: 1500, color: '#ffd23b' }),
      t('', 'ついに——目標の一億円に到達した。', { bg: 'bg-aurora', dur: 1700 }),
      sc('peace', 'やった…やったぞ！　オレ、FIRE達成だ！！', { bg: 'bg-aurora', form: 'awaken', fx: 'zoom', kb: true, dur: 1900 }),
      sc('pepper', 'おめでとう、相棒。計算上も完璧なFIREだ、ピピッ！', { bg: 'bg-space', kb: true, dur: 1600 }),
      sc('legend', 'よくやった。君は自由を、自らの手で掴んだのだ。', { bg: 'bg-legend', form: 'ghost', kb: true, dur: 1900 }),
      { char: C.peace.img, name: C.peace.name, color: C.peace.color, text: '夜景を見ながら、ゆっくり生きるよ。ありがとう、みんな。', bgImg: 'bg_skytree.jpg', kb: true, dur: 2000 },
      t('🌅 FIRE 達成 🌅', '〜 そして自由な人生へ 〜', { bg: 'bg-aurora', fx: 'burst', shock: true, dur: 2300, color: '#ffd23b' }),
      t('ENDING', '— だが伝説は、まだ続く（5億/10億へ）—', { bg: 'bg-legend', dur: 2000, color: '#ff6ec7' }),
    ];
  }

  window.STORY = { CHARS: C, opening, battle, legend, awaken, victory, ending };
})();
