/*
 * game.js — 状態機械・玉管理・確変ST・スピン進行
 * 設計: 玉発射→始動口入賞で保留生成（その場で当落と演出を確定＝先読み信頼度の根拠）。
 *        アイドル時に保留を1つ消化してスピン再生→結果反映。大当りで保留クリア。
 */
(function () {
  const C = window.CONFIG;
  const MAX_HOLD = 4;

  const START_BALLS = 0;
  const INITIAL_MONEY = 30000;        // 開始軍資金（円）
  const LEND_LOT = 500;               // 1回の玉貸玉数
  const RATES = [1, 5, 100, 1000, 10000]; // 円/玉
  // FIRE マイルストーン（総資産・円）
  const MILESTONES = [
    { amt: 1e8,  key: 'oku1',  level: 1 },
    { amt: 5e8,  key: 'oku5',  level: 5 },
    { amt: 1e9,  key: 'oku10', level: 10 },
  ];

  const S = {
    specKey: C.DEFAULT_SPEC,
    spec: C.SPECS[C.DEFAULT_SPEC],
    balls: START_BALLS,
    spins: 0,
    renchan: 0,
    kakuhen: false,
    jitan: false,
    stRemaining: 0,
    holds: [],          // {hit, prod, finalSyms, willKakuhen, holdDef}
    busy: false,        // スピン/大当り再生中
    firing: false,
    auto: false,
    uchikata: 'left',   // 打ち分け（left/right）。電サポ中は right が正解
    // 経済
    money: INITIAL_MONEY,   // 軍資金（円）
    rate: 1,                // 円/玉
    peakAssets: INITIAL_MONEY,
    milestonesHit: {},      // FIRE到達フラグ
    // 実機データカウンター用
    bigHits: 0,         // 大当り回数
    kakuhenCount: 0,    // 確変回数
    maxRenchan: 0,      // 最高連チャン
    sinceHit: 0,        // 現在ハマり（前回大当りからの回転数）
    startBalls: START_BALLS,
    history: [],        // スランプグラフ用 {n, diff}
  };

  function assets() { return S.money + S.balls * S.rate; }

  // ---- セーブ/ロード（localStorage）----
  const SAVE_KEY = 'crfl_save_v1';
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        money: S.money, rate: S.rate, specKey: S.specKey, balls: S.balls,
        peakAssets: S.peakAssets, milestonesHit: S.milestonesHit,
        bigHits: S.bigHits, kakuhenCount: S.kakuhenCount, maxRenchan: S.maxRenchan, spins: S.spins,
      }));
    } catch (_) {}
  }
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!d) return;
      if (C.SPECS[d.specKey]) { S.specKey = d.specKey; S.spec = C.SPECS[d.specKey]; }
      if (typeof d.money === 'number') S.money = d.money;
      if (RATES.includes(d.rate)) S.rate = d.rate;
      if (typeof d.balls === 'number') S.balls = d.balls;
      if (typeof d.peakAssets === 'number') S.peakAssets = d.peakAssets;
      if (d.milestonesHit) S.milestonesHit = d.milestonesHit;
      ['bigHits', 'kakuhenCount', 'maxRenchan', 'spins'].forEach(k => { if (typeof d[k] === 'number') S[k] = d[k]; });
      S.startBalls = S.balls;
    } catch (_) {}
  }
  function resetSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    S.money = INITIAL_MONEY; S.rate = 1; S.balls = 0; S.peakAssets = INITIAL_MONEY;
    S.milestonesHit = {}; S.bigHits = S.kakuhenCount = S.maxRenchan = S.spins = 0;
    S.kakuhen = S.jitan = false; S.stRemaining = 0; S.renchan = 0; S.holds = [];
    S.startBalls = 0; S.history = [];
    if (window.AUDIO) window.AUDIO.setBaseBgm('normal');
    refresh();
  }

  let onChange = () => {};
  let lane = null, laneCtx = null, balls2d = [], pegs = [];

  function init(opts) {
    onChange = opts.onChange || (() => {});
    load();
    setupLane();
    requestAnimationFrame(laneLoop);
    refresh();
  }
  function refresh() { onChange(snapshot()); }
  function snapshot() {
    const A = assets();
    return {
      specKey: S.specKey, specName: S.spec.name, balls: Math.max(0, Math.floor(S.balls)),
      spins: S.spins, renchan: S.renchan, holds: S.holds.map(h => h.holdDef),
      state: S.kakuhen ? 'kakuhen' : S.jitan ? 'jitan' : 'normal',
      stRemaining: S.stRemaining,
      bigHits: S.bigHits, kakuhenCount: S.kakuhenCount, maxRenchan: S.maxRenchan, sinceHit: S.sinceHit,
      diff: Math.floor(S.balls - S.startBalls), history: S.history, spinning: S.busy,
      money: S.money, rate: S.rate, ballValue: S.balls * S.rate, assets: A,
      profit: A - INITIAL_MONEY, peakAssets: S.peakAssets,
      goalPct: Math.min(100, A / 1e8 * 100), rates: RATES,
      uchikata: S.uchikata, needRight: needRight(),
    };
  }

  function recordHistory() {
    S.history.push({ n: S.spins, diff: Math.floor(S.balls - S.startBalls) });
    if (S.history.length > 400) S.history.shift();
  }

  function currentPHit() {
    return 1 / (S.kakuhen ? S.spec.kakuhenOdds : S.spec.normalOdds);
  }
  function needRight() { return S.kakuhen || S.jitan; }   // 電サポ中は右打ち
  function startChance() {
    // 打ち分けが正しいときだけ始動口/電チューに入りやすい。間違うと玉が減るだけ。
    const correct = needRight() ? S.uchikata === 'right' : S.uchikata === 'left';
    const base = needRight() ? 0.88 : 0.18;
    return correct ? base : base * 0.04;
  }
  function setUchikata(d) {
    if (d !== 'left' && d !== 'right') return;
    S.uchikata = d; refresh();
  }

  // 1回転ぶんの抽選を生成（保留作成時に確定）
  function rollSpin() {
    const pHit = currentPHit();
    const hit = window.RNG.drawHit(S.spec, S.kakuhen);
    const willKakuhen = hit ? window.RNG.drawKakuhen(S.spec) : false;
    const prod = window.RNG.pickProduction(hit, pHit);
    const finalSyms = window.RNG.pickStopSymbols(prod, willKakuhen);
    return { hit, prod, finalSyms, willKakuhen, holdDef: prod.hold };
  }

  // ---- 発射 ----
  let fireTimer = null;
  function fireStart() {
    if (S.firing) return;
    S.firing = true;
    if (window.AUDIO) window.AUDIO.resume();
    const tick = () => {
      if (!S.firing && !S.auto) { return; }
      if (S.balls <= 0) { window.PRODUCTION.msg('玉がありません →「玉貸」で借りる(軍資金が必要)'); stopFiring(); refresh(); return; }
      if (S.holds.length >= MAX_HOLD) {
        // 保留満タンなら発射を控える（玉節約）
        fireTimer = setTimeout(tick, 200); return;
      }
      shootBall();
      fireTimer = setTimeout(tick, S.auto ? 130 : 150);
    };
    tick();
  }
  function fireStop() { S.firing = false; if (!S.auto) stopFiring(); }
  function stopFiring() { if (fireTimer) { clearTimeout(fireTimer); fireTimer = null; } }
  function setAuto(on) {
    S.auto = on;
    if (on) fireStart(); else { S.firing = false; stopFiring(); }
    refresh();
  }

  function shootBall() {
    S.balls -= 1;
    spawnBall();
    if (window.AUDIO) window.AUDIO.SE.fire();
    if (Math.random() < startChance()) registerStart();
    refresh();
    maybeConsume();
  }

  // 始動口入賞
  function registerStart() {
    if (window.AUDIO) window.AUDIO.SE.start();
    S.balls += 3; // 賞球
    if (S.holds.length < MAX_HOLD) {
      const roll = rollSpin();
      S.holds.push(roll);
      if (window.AUDIO && roll.holdDef.id !== 'white') window.AUDIO.SE.holdUp();
      refresh();
    }
  }

  // ---- 消化 ----
  // 単一駆動ループ。busy で再入を防ぎ、途中例外でも finally で必ず解放する。
  function maybeConsume() { consumeLoop(); }
  async function consumeLoop() {
    if (S.busy || S.holds.length === 0) return;
    S.busy = true;
    try {
      while (S.holds.length > 0) {
        const roll = S.holds.shift();
        S.spins += 1;
        S.sinceHit += 1;
        if (S.kakuhen || S.jitan) S.stRemaining = Math.max(0, S.stRemaining - 1);
        refresh();

        const win = await window.PRODUCTION.run(roll.prod, roll.finalSyms, roll.willKakuhen);
        if (win) await doJackpot(roll.willKakuhen);
        else if ((S.kakuhen || S.jitan) && S.stRemaining <= 0) endST();
        recordHistory();
      }
    } catch (e) {
      console.error('consume error:', e);
      if (window.PRODUCTION) window.PRODUCTION.hideAll();
      if (window.AUDIO) window.AUDIO.stopBgm();
    } finally {
      S.busy = false;
      refresh();
      // オート中で保留が尽きたら発射を継続して次の入賞を待つ
      if (S.auto && S.balls > 0 && S.holds.length === 0) fireStart();
    }
  }

  async function doJackpot(willKakuhen) {
    S.renchan += 1;
    S.bigHits += 1;
    if (willKakuhen) S.kakuhenCount += 1;
    S.sinceHit = 0;
    if (S.renchan > S.maxRenchan) S.maxRenchan = S.renchan;
    S.holds = []; // 大当りで保留クリア（止め打ち）
    refresh();
    const spec = S.spec;
    if (window.AUDIO) { window.AUDIO.setBaseBgm(null); window.AUDIO.startBgm('round'); }
    // 昇格演出（7R以上のスペックで稀に低Rスタート→昇格）
    if (spec.rounds >= 7 && Math.random() < 0.45) {
      await window.PRODUCTION.playUpgrade(Math.random() < 0.5 ? 3 : 5, spec.rounds);
    }
    for (let r = 1; r <= spec.rounds; r++) {
      const pay = spec.payoutPerRound;
      S.balls += pay;
      await window.PRODUCTION.playRound(r, spec.rounds, pay, () => refresh(), { kakuhen: willKakuhen });
      refresh();
    }
    if (window.AUDIO) window.AUDIO.stopBgm(); // ラウンドBGM終了
    // 大当り後の状態
    if (willKakuhen) { S.kakuhen = true; S.jitan = false; }
    else { S.kakuhen = false; S.jitan = true; }
    S.stRemaining = spec.stCount;
    // 覚醒RUSH/時短 突入ムービー
    if (storyOn()) await window.CINEMA.play(window.STORY.awaken(willKakuhen), { skippable: true });
    if (window.AUDIO) window.AUDIO.setBaseBgm(S.kakuhen ? 'kakuhen' : 'jitan'); // 確変/時短BGM
    updatePeak();
    save();
    await checkMilestones();   // FIRE到達チェック
    refresh();
  }

  function endST() {
    S.kakuhen = false; S.jitan = false; S.stRemaining = 0; S.renchan = 0;
    if (window.AUDIO) window.AUDIO.setBaseBgm('normal'); // 通常時も常時BGM
    window.PRODUCTION.msg('通常モードへ戻りました');
    save(); refresh();
  }

  function storyOn() { return window.SETTINGS && window.SETTINGS.story && window.CINEMA && window.STORY; }
  function updatePeak() { const a = assets(); if (a > S.peakAssets) S.peakAssets = a; }

  // FIRE マイルストーン到達でエンディング/特殊ムービー
  async function checkMilestones() {
    const a = assets();
    for (const m of MILESTONES) {
      if (a >= m.amt && !S.milestonesHit[m.key]) {
        S.milestonesHit[m.key] = true; save();
        if (storyOn()) await window.CINEMA.play(window.STORY.ending(m.level), { bgm: 'allreel', skippable: false });
      }
    }
  }

  function addBalls(n) { S.balls += n; refresh(); }

  // ---- 経済（玉貸/換金/レート）----
  function lendBalls() {
    if (S.busy) return { ok: false, reason: 'busy' };
    const cost = LEND_LOT * S.rate;
    if (S.money < S.rate) return { ok: false, reason: 'nomoney' };  // 1玉も貸せない
    const lot = S.money >= cost ? LEND_LOT : Math.floor(S.money / S.rate);
    S.money -= lot * S.rate;
    S.balls += lot;
    if (window.AUDIO) window.AUDIO.SE.start();
    save(); refresh();
    return { ok: true, lot };
  }
  function cashOut() {
    if (S.busy || S.balls <= 0) return;
    S.money += S.balls * S.rate;
    S.balls = 0;
    if (window.AUDIO) window.AUDIO.SE.kakutei();
    updatePeak(); save(); refresh();
  }
  function setRate(r) {
    if (S.busy || !RATES.includes(r)) return;
    if (S.balls > 0) { S.money += S.balls * S.rate; S.balls = 0; } // 一旦換金
    S.rate = r;
    S.startBalls = 0; S.history = [];
    save(); refresh();
  }
  function addMoney(n) { S.money += Math.max(0, Math.floor(n)); updatePeak(); save(); refresh(); }
  function setSpec(key) {
    if (!C.SPECS[key] || S.busy) return;
    S.specKey = key; S.spec = C.SPECS[key];
    S.kakuhen = S.jitan = false; S.stRemaining = 0; S.renchan = 0; S.holds = [];
    // 台移動 = データリセット（軍資金/レートは維持）
    S.spins = 0; S.bigHits = 0; S.kakuhenCount = 0; S.maxRenchan = 0; S.sinceHit = 0;
    S.startBalls = S.balls; S.history = [];
    if (window.AUDIO) window.AUDIO.setBaseBgm('normal');
    save(); refresh();
  }

  // ---- デバッグ強制再生 ----
  async function forcePlay(overrides) {
    if (S.busy) return;
    if (window.AUDIO) window.AUDIO.resume();
    S.busy = true;
    try { await forcePlayInner(overrides); }
    catch (e) { console.error('forcePlay error:', e); if (window.PRODUCTION) window.PRODUCTION.hideAll(); }
    finally { S.busy = false; refresh(); }
  }
  async function forcePlayInner(overrides) {
    const hit = overrides.hit ?? false;
    const pHit = currentPHit();
    const prod = window.RNG.pickProduction(hit, pHit);
    // 指定リーチ等で上書き
    if (overrides.reachId) prod.reach = C.PRODUCTIONS.reach.find(r => r.id === overrides.reachId) || prod.reach;
    if (overrides.holdId) prod.hold = C.PRODUCTIONS.hold.find(r => r.id === overrides.holdId) || prod.hold;
    if (overrides.suStep) prod.su = C.PRODUCTIONS.su.find(r => r.step === overrides.suStep) || prod.su;
    if (overrides.revival != null) prod.revival = overrides.revival && hit;
    prod.hit = hit;
    const willKakuhen = hit ? (overrides.kakuhen ?? true) : false;
    // リーチを見せたいので tenpai 形に
    let finalSyms;
    if (hit) finalSyms = window.RNG.pickStopSymbols({ ...prod, hit: true }, willKakuhen);
    else {
      const syms = C.SYMBOLS, a = syms[0], mid = syms[1];
      finalSyms = [a, mid, a]; // 強制テンパイハズレ
    }
    await window.PRODUCTION.run(prod, finalSyms, willKakuhen);
    if (hit) await doJackpot(willKakuhen);
  }

  // ---- 玉レーン描画 ----
  function setupLane() {
    lane = document.getElementById('lane');
    if (!lane) return;
    laneCtx = lane.getContext('2d');
    // 釘配置
    pegs = [];
    const cols = 7, rows = 4;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        pegs.push({ x: 30 + c * 40 + (r % 2 ? 20 : 0), y: 18 + r * 16 });
  }
  function spawnBall() {
    if (!lane) return;
    balls2d.push({ x: lane.width / 2 + (Math.random() * 40 - 20), y: 2, vy: 1.2, vx: (Math.random() * 1.2 - 0.6) });
  }
  function laneLoop() {
    if (laneCtx) {
      const W = lane.width, H = lane.height;
      laneCtx.clearRect(0, 0, W, H);
      // 釘
      laneCtx.fillStyle = '#5b4a7a';
      pegs.forEach(p => { laneCtx.beginPath(); laneCtx.arc(p.x, p.y, 2.2, 0, 7); laneCtx.fill(); });
      // 始動口
      laneCtx.fillStyle = '#ff6ec7';
      laneCtx.fillRect(W / 2 - 16, H - 12, 32, 8);
      // 玉
      laneCtx.fillStyle = '#e9eefc';
      for (let i = balls2d.length - 1; i >= 0; i--) {
        const b = balls2d[i];
        b.vy += 0.18; b.y += b.vy; b.x += b.vx;
        pegs.forEach(p => { const dx = b.x - p.x, dy = b.y - p.y;
          if (dx * dx + dy * dy < 30) { b.vx = dx > 0 ? 1 : -1; b.vy *= 0.6; if (window.AUDIO) {} } });
        laneCtx.beginPath(); laneCtx.arc(b.x, b.y, 3.2, 0, 7); laneCtx.fill();
        if (b.y > H) balls2d.splice(i, 1);
      }
    }
    requestAnimationFrame(laneLoop);
  }

  window.GAME = { init, fireStart, fireStop, setAuto, setSpec, addBalls, forcePlay,
                  lendBalls, cashOut, setRate, addMoney, resetSave, save, setUchikata,
                  snapshot, get isBusy() { return S.busy; } };
})();
