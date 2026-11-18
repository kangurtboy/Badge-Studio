const fs = require('fs');
const { execSync } = require('child_process');

const TOKEN = process.env.FIGMA_TOKEN || '';
const FILE_KEY = 'RxKsPkGFBYKPNCDauICTIx';
const URL = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=36:19,36:75`;

console.log('Fetching nodes 36:19 and 36:75 via curl...');
const curlCmd = `curl.exe -s -H "X-Figma-Token: ${TOKEN}" "${URL}"`;
const stdout = execSync(curlCmd, { maxBuffer: 10 * 1024 * 1024 });

fs.writeFileSync('scripts/figma-nodes-raw.json', stdout);
console.log('Saved raw JSON to scripts/figma-nodes-raw.json');

const data = JSON.parse(stdout.toString('utf8'));

function dumpTree(node, depth = 0) {
  const indent = '  '.repeat(depth);
  let info = `${indent}- [${node.type}] "${node.name}" (id: ${node.id})`;
  if (node.absoluteBoundingBox) {
    const { x, y, width, height } = node.absoluteBoundingBox;
    info += ` [x:${Math.round(x)}, y:${Math.round(y)}, w:${Math.round(width)}, h:${Math.round(height)}]`;
  }
  if (node.characters) {
    info += ` chars: "${node.characters.replace(/\n/g, '\\n')}"`;
  }
  if (node.style) {
    info += ` font: ${node.style.fontFamily} ${node.style.fontWeight} ${node.style.fontSize}px lh:${node.style.lineHeightPx}px ls:${node.style.letterSpacing}px align:${node.style.textAlignHorizontal}`;
  }
  if (node.fills && node.fills.length) {
    const f = node.fills[0];
    if (f.type === 'SOLID') {
      const r = Math.round(f.color.r * 255);
      const g = Math.round(f.color.g * 255);
      const b = Math.round(f.color.b * 255);
      const a = f.opacity !== undefined ? f.opacity : 1;
      info += ` fill: rgb(${r},${g},${b})${a < 1 ? ' opacity:' + a : ''}`;
    } else {
      info += ` fill: ${f.type}`;
    }
  }
  if (node.strokes && node.strokes.length) {
    const s = node.strokes[0];
    if (s.type === 'SOLID') {
      const r = Math.round(s.color.r * 255);
      const g = Math.round(s.color.g * 255);
      const b = Math.round(s.color.b * 255);
      info += ` stroke: rgb(${r},${g},${b}) weight:${node.strokeWeight}`;
    }
  }
  if (node.cornerRadius) {
    info += ` radius: ${node.cornerRadius}`;
  }
  if (node.layoutMode) {
    info += ` flex: ${node.layoutMode} pad:[${node.paddingTop},${node.paddingRight},${node.paddingBottom},${node.paddingLeft}] gap:${node.itemSpacing}`;
  }
  console.log(info);
  if (node.children) {
    for (const child of node.children) {
      dumpTree(child, depth + 1);
    }
  }
}

for (const [id, nodeData] of Object.entries(data.nodes)) {
  console.log(`\n=================== NODE ${id} ===================`);
  dumpTree(nodeData.document);
}
