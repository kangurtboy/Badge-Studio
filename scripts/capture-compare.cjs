const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const chromePath = 'C:\\Users\\kangu\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';
const tempDir = path.join(os.tmpdir(), 'agy-chrome-profile-' + Date.now());

async function main() {
  fs.mkdirSync(tempDir, { recursive: true });

  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    '--remote-debugging-port=9447',
    `--user-data-dir=${tempDir}`,
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 250));
    try {
      const res = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9447/json/version', res => {
          let data = '';
          res.on('data', c => data += c);
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });
      const json = JSON.parse(res);
      if (json.webSocketDebuggerUrl) {
        wsUrl = json.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  const targetsRaw = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9447/json/list', res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
  const targets = JSON.parse(targetsRaw);
  const pageTarget = targets.find(t => t.type === 'page');
  const targetWsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : wsUrl;
  const ws = new WebSocket(targetWsUrl);

  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const reqId = id++;
      pending.set(reqId, { resolve, reject });
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 1600,
    deviceScaleFactor: 1,
    mobile: false
  });

  const fileUrl = 'file:///' + path.resolve('scripts/compare.html').replace(/\\/g, '/');
  console.log('Navigating to', fileUrl);
  await send('Page.navigate', { url: fileUrl });
  await new Promise(r => setTimeout(r, 2000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/compare-overview.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved scripts/compare-overview.png');

  ws.close();
  proc.kill();
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
