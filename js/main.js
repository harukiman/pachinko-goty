/*
 * main.js — 初期化エントリ
 * 画像プリロード → 各モジュール初期化 → ゲーム開始。
 */
window.SETTINGS = { story: true, fastProduction: false };
window.SPEED = 1;

window.addEventListener('DOMContentLoaded', async () => {
  window.PRODUCTION.init();
  if (window.CINEMA) window.CINEMA.init();
  if (window.MINIGAMES) window.MINIGAMES.init();
  window.GAME.init({ onChange: st => window.UI.render(st) });
  window.UI.init();

  // 画像プリロード（失敗してもゲームは動く）
  await window.ASSETS.load();
  window.REELS.init();
  window.GAME.snapshot && window.UI.render(window.GAME.snapshot());

  window.PRODUCTION.msg('レート選択→「玉貸」で玉を借り、長押しで発射！　1億円(FIRE)を目指せ');
});
