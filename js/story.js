/*
 * story.js — キャラクター設定とムービー脚本
 * 写真6枚をキャラ化し、各場面のシーン配列(cinema.js用)を生成する。
 */
(function () {
  // 立ち絵＝図柄写真。name/colorでキャラ性を付与。
  const C = {
    peace:  { name: 'ピース小僧',     img: 'reel_peace.jpg',  color: '#3af0ff' },
    mosaic: { name: '謎のモザイク男', img: 'reel_mosaic.jpg', color: '#9d86c4' },
    hero:   { name: 'イエローヒーロー', img: 'reel_hero.jpg',  color: '#ffd23b' },
    doya:   { name: 'ドヤ皇帝',       img: 'reel_doya.jpg',   color: '#ff8a00' },
    legend: { name: '未来の賢者',     img: 'reel_legend.jpg', color: '#ff6ec7' },
    black:  { name: '闇のマスク',     img: 'reel_black.jpg',  color: '#ff3b3b' },
  };
  const BG = {
    night:  'radial-gradient(circle at 50% 30%,#22104a,#05010f)',
    fire:   'radial-gradient(circle at 50% 40%,#5a0a0a,#1a0000)',
    gold:   'radial-gradient(circle at 50% 40%,#6a4a00,#150d00)',
    legend: 'linear-gradient(160deg,#3a0a4a,#0a0020)',
    rush:   'linear-gradient(160deg,#7a1500,#b35a00)',
  };
  const sc = (ch, text, o = {}) => ({
    char: ch && C[ch].img, name: ch && C[ch].name, color: ch && C[ch].color,
    text, bg: o.bg, title: o.title, fx: o.fx, dur: o.dur || 1500, se: o.se,
  });

  // オープニング
  function opening() {
    return [
      { title: 'CR フレンズ伝説', text: '〜50年後の君へ〜', bg: BG.legend, dur: 1800, color: '#ff6ec7' },
      sc(null, '西暦20XX。仲間たちが「伝説」と呼ばれた時代があった。', { bg: BG.night, dur: 1700 }),
      sc('peace', 'オレはピース小僧！　いつか伝説のフレンズになるんだ！', { bg: BG.night, fx: 'zoom' }),
      sc('black', '……ククク。伝説への道は、そう甘くはないぞ。', { bg: BG.fire, fx: 'shake', dur: 1700 }),
      sc('legend', '50年後の君よ。その手で、運命を掴め——。', { bg: BG.legend, color: '#ff6ec7', dur: 1900 }),
    ];
  }

  // バトルリーチ（リーチ種別ごとに敵が登場）
  const ENEMY = { super: 'doya', cutin_red: 'black', cutin_gold: 'hero', allreel: 'legend' };
  function battle(reachId) {
    const who = ENEMY[reachId] || 'doya';
    if (who === 'doya') return [
      sc('doya', 'フハハ！この俺様が相手だ、ドヤ皇帝の実力、見せてやる！', { bg: BG.fire, fx: 'zoom' }),
      sc('peace', '負けない…ここで引いたら伝説になれない！', { bg: BG.fire, dur: 1300 }),
      { title: '勝負！', text: '行方は…！？', bg: BG.fire, fx: 'flash', dur: 1100, color: '#ff8a00' },
    ];
    if (who === 'black') return [
      sc('black', 'よく来た…だが貴様の旅はここで終わる。', { bg: BG.fire, fx: 'shake' }),
      sc('peace', 'うわ…っ、こいつ、ケタ違いに強い…！', { bg: BG.fire, fx: 'shake', dur: 1300 }),
      sc('black', '闇に飲まれろ——！', { bg: BG.fire, fx: 'flash', se: 'cutin', dur: 1300 }),
      { title: '激 闘', text: '運命の一撃…！！', bg: BG.fire, fx: 'flash', dur: 1200, color: '#ff3b3b' },
    ];
    if (who === 'hero') return [
      sc('peace', 'もうダメだ…！だれか——！', { bg: BG.night, fx: 'shake', dur: 1200 }),
      sc('hero', '待たせたな！正義のイエローヒーロー、参上！', { bg: BG.gold, fx: 'zoom', se: 'kakutei' }),
      { title: '黄金共闘', text: '勝利を、掴め！', bg: BG.gold, fx: 'flash', dur: 1300, color: '#ffd23b' },
    ];
    // legend (allreelは下のlegend()で扱うが保険)
    return legend();
  }

  // 全回転＝伝説ムービー（クライマックス）
  function legend() {
    return [
      { title: '— 伝 説 —', text: '時を超えし者が、現れる。', bg: BG.legend, dur: 1700, color: '#ff6ec7' },
      sc('legend', '50年後の君へ。よくぞここまで辿り着いた。', { bg: BG.legend, fx: 'zoom', se: 'kakutei' }),
      sc('legend', '今、伝説の扉を開けよう——全回転、確変大当りだ！', { bg: BG.legend, color: '#ff6ec7', fx: 'flash', dur: 1900 }),
    ];
  }

  // 確変突入＝覚醒RUSH
  function awaken(kakuhen) {
    if (kakuhen) return [
      { title: '覚醒 RUSH', text: '突入！！', bg: BG.rush, fx: 'flash', dur: 1500, se: 'kakutei', color: '#ffd23b' },
      sc('hero', 'ここからが本番だ！連チャンで伝説を駆け上がれ！', { bg: BG.rush, fx: 'zoom', dur: 1600 }),
    ];
    return [
      { title: '時短 突入', text: 'チャンス継続！', bg: BG.gold, fx: 'flash', dur: 1300, color: '#ffd23b' },
    ];
  }

  // 連チャン中の煽り（大当り勝利）
  function victory(renchan) {
    return [
      sc('peace', renchan >= 3 ? `${renchan}連!! 止まらないぜ、これが伝説の力だ！` : 'やった、勝った——！', { bg: BG.gold, fx: 'zoom', dur: 1400 }),
    ];
  }

  window.STORY = { CHARS: C, opening, battle, legend, awaken, victory };
})();
