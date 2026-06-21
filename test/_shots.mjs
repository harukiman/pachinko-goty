// 端末エミュレーションで実機幅のスクショを撮る（ローカル監査用）
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = 'file://' + process.cwd() + '/index.html';
const devices = [
  { name: 'iPhoneSE', w: 320, h: 568 },
  { name: 'iPhone8',  w: 375, h: 667 },
  { name: 'iPhone14', w: 390, h: 844 },
];
const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
for (const d of devices) {
  const page = await browser.newPage();
  await page.setViewport({ width: d.w, height: d.h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'networkidle2' });
  // 自動で少し回して演出/データを発生
  await page.evaluate(() => { window.GAME && window.GAME.forcePlay({ reachId: 'cutin_gold', hit: true, kakuhen: true }); });
  await new Promise(r => setTimeout(r, 1200));
  // 横はみ出し検査
  const overflow = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth, win: window.innerWidth,
    bodyW: document.body.scrollWidth,
  }));
  const clipped = overflow.docW > overflow.win + 1;
  console.log(`${d.name} (${d.w}px): innerW=${overflow.win} scrollW=${overflow.docW} -> ${clipped ? 'OVERFLOW ❌' : 'OK ✅'}`);
  await page.screenshot({ path: `test/_shot_${d.name}.png` });
  await page.close();
}
await browser.close();
