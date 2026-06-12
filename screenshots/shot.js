const puppeteer = require('puppeteer-core');

const URL = process.env.SHOT_URL || 'http://20.126.243.197/';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const shots = [
  { name: 'desktop-fullpage', width: 1920, height: 1080, fullPage: true },
  { name: 'desktop-hero',     width: 1920, height: 1080, fullPage: false },
  { name: 'mobile-fullpage',  width: 390,  height: 844,  fullPage: true, mobile: true },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=2'],
  });
  for (const s of shots) {
    const page = await browser.newPage();
    await page.setViewport({
      width: s.width, height: s.height,
      deviceScaleFactor: 2, isMobile: !!s.mobile, hasTouch: !!s.mobile,
    });
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
    // Scroll through the page to trigger IntersectionObserver reveal animations.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = window.innerHeight / 2;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          y += step;
          if (y >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
        }, 120);
      });
    });
    // Force any elements that animate in to their final visible state, then return to top.
    await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}
      [class*="reveal"],[class*="fade"],[data-aos],.opacity-0{opacity:1!important;transform:none!important}` });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 1200)); // let fonts/layout settle
    const path = `${s.name}.png`;
    await page.screenshot({ path, fullPage: s.fullPage });
    console.log(`saved ${path}`);
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
