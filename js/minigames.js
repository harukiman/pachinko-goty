/*
 * minigames.js — 軍資金を稼ぐバイトミニゲーム集（モーダル実行）
 *   1) 太鼓連打バイト   2) 寿司タイミングバイト   3) もぐら叩きバイト
 * 報酬は GAME.addMoney(円) で軍資金に加算。
 */
(function () {
  const $ = s => document.querySelector(s);
  const A = () => window.AUDIO;
  let modal, body, titleEl, timers = [];

  function init() { modal = $('#minigame'); body = modal.querySelector('.mg-body'); titleEl = modal.querySelector('.mg-title'); }
  function clearTimers() { timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers = []; }
  function open() { init(); if (A()) A().resume(); modal.classList.remove('hidden'); menu(); }
  function close() { clearTimers(); modal.classList.add('hidden'); body.innerHTML = ''; }

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  function menu() {
    clearTimers(); titleEl.textContent = '💼 バイトを選ぶ';
    body.innerHTML = '';
    const intro = el('p', 'mg-intro', '軍資金を稼ごう！　パチンコの種銭はここで稼げ。');
    body.appendChild(intro);
    const games = [
      { t: '🥁 太鼓連打', d: '5秒で連打！ 1回30円', fn: gameTaiko },
      { t: '🍣 寿司タイミング', d: '緑で止めろ×5 1回600円', fn: gameSushi },
      { t: '🔨 もぐら叩き', d: '12秒で叩け！ 1匹150円', fn: gameMogura },
    ];
    const list = el('div', 'mg-list');
    games.forEach(g => {
      const b = el('button', 'mg-game-btn', `<b>${g.t}</b><small>${g.d}</small>`);
      b.addEventListener('click', () => { if (A()) A().SE.button(); g.fn(); });
      list.appendChild(b);
    });
    body.appendChild(list);
  }

  function finish(reward, label) {
    clearTimers();
    reward = Math.max(0, Math.floor(reward));
    if (window.GAME) window.GAME.addMoney(reward);
    if (A()) A().SE.kakutei();
    body.innerHTML = '';
    body.appendChild(el('div', 'mg-result', `${label}<br><span class="mg-reward">+¥${reward.toLocaleString()}</span><br>軍資金に加算しました`));
    const row = el('div', 'mg-btnrow');
    const again = el('button', 'mg-btn', 'もう一度');
    again.addEventListener('click', menu);
    const closeB = el('button', 'mg-btn', '閉じる');
    closeB.addEventListener('click', close);
    row.appendChild(again); row.appendChild(closeB); body.appendChild(row);
  }

  // 1) 太鼓連打
  function gameTaiko() {
    clearTimers(); titleEl.textContent = '🥁 太鼓連打';
    let taps = 0, time = 5.0;
    body.innerHTML = '';
    const info = el('div', 'mg-info', '5.0秒　連打数 0');
    const drum = el('button', 'mg-taiko', '🥁<br>連打！');
    body.appendChild(info); body.appendChild(drum);
    const tap = () => { taps++; info.textContent = `${time.toFixed(1)}秒　連打数 ${taps}`; drum.classList.remove('hit'); void drum.offsetWidth; drum.classList.add('hit'); if (A()) A().SE.peg(); };
    drum.addEventListener('pointerdown', tap);
    const iv = setInterval(() => {
      time -= 0.1;
      if (time <= 0) { clearInterval(iv); finish(taps * 30, `連打 ${taps} 回！`); return; }
      info.textContent = `${time.toFixed(1)}秒　連打数 ${taps}`;
    }, 100);
    timers.push(iv);
  }

  // 2) 寿司タイミング
  function gameSushi() {
    clearTimers(); titleEl.textContent = '🍣 寿司タイミング';
    let round = 0, hits = 0; const ROUNDS = 5;
    body.innerHTML = '';
    const info = el('div', 'mg-info', `${ROUNDS}貫握れ！　成功 0`);
    const bar = el('div', 'mg-bar'); const zone = el('div', 'mg-zone'); const cur = el('div', 'mg-cursor');
    bar.appendChild(zone); bar.appendChild(cur);
    const btn = el('button', 'mg-btn wide', 'STOP！');
    body.appendChild(info); body.appendChild(bar); body.appendChild(btn);
    let pos = 0, dir = 1, speed = 2.2, iv = null;
    function nextRound() {
      if (round >= ROUNDS) { finish(hits * 600, `成功 ${hits}/${ROUNDS} 貫！`); return; }
      round++;
      const zw = 22, zleft = 12 + Math.random() * 64; // %
      zone.style.left = zleft + '%'; zone.style.width = zw + '%';
      pos = 0; dir = 1; speed = 2.0 + round * 0.4;
      info.textContent = `${round}/${ROUNDS}貫目　成功 ${hits}`;
      clearInterval(iv);
      iv = setInterval(() => { pos += dir * speed; if (pos >= 100) { pos = 100; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; } cur.style.left = pos + '%'; }, 16);
      timers.push(iv);
      cur._zleft = zleft; cur._zw = zw;
    }
    btn.addEventListener('click', () => {
      clearInterval(iv);
      const ok = pos >= cur._zleft && pos <= cur._zleft + cur._zw;
      if (ok) { hits++; if (A()) A().SE.holdUp(); } else if (A()) A().SE.lose();
      info.textContent = ok ? 'ナイス！' : 'ミス…';
      setTimeout(nextRound, 500);
    });
    nextRound();
  }

  // 3) もぐら叩き
  function gameMogura() {
    clearTimers(); titleEl.textContent = '🔨 もぐら叩き';
    let hits = 0, time = 12.0;
    body.innerHTML = '';
    const info = el('div', 'mg-info', '12.0秒　叩いた数 0');
    const grid = el('div', 'mg-grid');
    const cells = [];
    for (let i = 0; i < 9; i++) { const c = el('button', 'mg-hole', ''); cells.push(c); grid.appendChild(c);
      c.addEventListener('pointerdown', () => { if (c.classList.contains('up')) { c.classList.remove('up'); c.textContent = ''; hits++; info.textContent = `${time.toFixed(1)}秒　叩いた数 ${hits}`; if (A()) A().SE.push(); } }); }
    body.appendChild(info); body.appendChild(grid);
    const pop = setInterval(() => {
      const idx = Math.floor(Math.random() * 9); const c = cells[idx];
      if (!c.classList.contains('up')) { c.classList.add('up'); c.textContent = Math.random() < 0.18 ? '💣' : '🐹'; const isBomb = c.textContent === '💣';
        setTimeout(() => { if (c.classList.contains('up')) { c.classList.remove('up'); c.textContent = ''; } }, 850);
        if (isBomb) c.dataset.bomb = '1'; else delete c.dataset.bomb; }
    }, 480);
    timers.push(pop);
    const iv = setInterval(() => { time -= 0.1; if (time <= 0) { clearInterval(iv); clearInterval(pop); finish(hits * 150, `${hits} 匹 叩いた！`); return; } info.textContent = `${time.toFixed(1)}秒　叩いた数 ${hits}`; }, 100);
    timers.push(iv);
  }

  window.MINIGAMES = { init, open, close };
})();
