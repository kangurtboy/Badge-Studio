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
    '--remote-debugging-port=9448',
    `--user-data-dir=${tempDir}`,
    'http://localhost:5173/'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 250));
    try {
      const res = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9448/json/version', res => {
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
    http.get('http://127.0.0.1:9448/json/list', res => {
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
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 1200,
    deviceScaleFactor: 2,
    mobile: false
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2000));

  // Set workspace in localStorage to DEMO_SECURITY_STAFF
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const securityStaff = {
          id: 'security-1',
          template: 'security',
          fullName: 'САФАРОВ\\nФАРҲОД КАРИМОВИЧ',
          studentId: 'SEC-01',
          specialty: '',
          studyYears: '',
          expires: '31/12/2026',
          login: '',
          password: '',
          role: 'МУҲОФИЗ',
          roleEn: 'COLLEGE SECURITY',
          cardType: 'КОРТИ ХИЗМАТӢ',
          photo: './images/security-guard-demo.jpg',
          photoZoom: 1.0,
          photoRotate: 0,
          photoX: 50,
          photoY: 50,
        };
        const ws = {
          students: [securityStaff, null, null, null, null, null, null, null],
          selectedId: 'security-1'
        };
        localStorage.setItem('badge-studio.workspace.v2', JSON.stringify(ws));
        location.reload();
      })()
    `
  });

  // Wait for reload
  await new Promise(r => setTimeout(r, 3000));

  // Find badge element bounding box
  const frontBoxRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('.badge-security-front');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()
    `,
    returnByValue: true
  });

  console.log('Front box:', frontBoxRes.result.value);

  if (frontBoxRes.result.value) {
    const box = frontBoxRes.result.value;
    const frontSnap = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        scale: 1
      }
    });
    fs.writeFileSync('scripts/rendered-security-front.png', Buffer.from(frontSnap.data, 'base64'));
    console.log('Saved scripts/rendered-security-front.png');
  }

  // Switch to back side
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const backBtn = btns.find(b => b.textContent && b.textContent.includes('Оборот'));
        if (backBtn) backBtn.click();
      })()
    `
  });

  await new Promise(r => setTimeout(r, 1500));

  const backBoxRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('.badge-security-back');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()
    `,
    returnByValue: true
  });

  console.log('Back box:', backBoxRes.result.value);

  if (backBoxRes.result.value) {
    const box = backBoxRes.result.value;
    const backSnap = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        scale: 1
      }
    });
    fs.writeFileSync('scripts/rendered-security-back.png', Buffer.from(backSnap.data, 'base64'));
    console.log('Saved scripts/rendered-security-back.png');
  }

  ws.close();
  proc.kill();
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
