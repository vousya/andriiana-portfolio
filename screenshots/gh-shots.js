const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const pages = [
  { name: 'cicd-actions-list', url: 'https://github.com/vousya/andriiana-portfolio/actions', full: false },
  { name: 'cicd-run-graph',    url: 'https://github.com/vousya/andriiana-portfolio/actions/runs/27350805092', full: true },
  { name: 'ghcr-package',      url: 'https://github.com/vousya/andriiana-portfolio/pkgs/container/andriiana-portfolio', full: true },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
  });
  for (const p of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
    await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: `${p.name}.png`, fullPage: p.full });
    console.log(`saved ${p.name}.png`);
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
