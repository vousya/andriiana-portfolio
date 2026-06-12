const fs = require('fs');
const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const raw = fs.readFileSync('kubectl-evidence.txt', 'utf8');
// Highlight command lines ($ ...) and key healthy tokens.
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const body = esc(raw)
  .replace(/^(\$ .*)$/gm, '<span class="cmd">$1</span>')
  .replace(/\b(Running|Ready|HTTP\/1\.1 200 OK|2\/2)\b/g, '<span class="ok">$1</span>')
  .replace(/(20\.126\.243\.197|webapprouting\.kubernetes\.azure\.com|cpu: \d+%\/70%)/g, '<span class="hi">$1</span>');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#0d1117;font-family:'Cascadia Code','Consolas',monospace}
  .win{max-width:1180px;margin:28px auto;border-radius:10px;overflow:hidden;
       box-shadow:0 18px 50px rgba(0,0,0,.6);border:1px solid #30363d}
  .bar{background:#161b22;height:38px;display:flex;align-items:center;padding:0 14px;gap:8px}
  .dot{width:12px;height:12px;border-radius:50%}
  .r{background:#ff5f56}.y{background:#ffbd2e}.g{background:#27c93f}
  .title{color:#8b949e;font-size:13px;margin-left:12px}
  pre{margin:0;padding:20px 22px;color:#c9d1d9;font-size:13.5px;line-height:1.5;white-space:pre;overflow-x:auto}
  .cmd{color:#58a6ff;font-weight:600}
  .ok{color:#3fb950;font-weight:600}
  .hi{color:#d2a8ff}
</style></head><body>
  <div class="win">
    <div class="bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
      <span class="title">kubectl — aks-portfolio (AKS · westeurope) — live deployment evidence</span></div>
    <pre>${body}</pre>
  </div>
</body></html>`;

fs.writeFileSync('term.html', html);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 900, deviceScaleFactor: 2 });
  await page.goto('file://' + process.cwd().replace(/\\/g,'/') + '/term.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'k8s-kubectl-terminal.png', fullPage: true });
  console.log('saved k8s-kubectl-terminal.png');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
