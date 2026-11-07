export function Barcode({ value }: { value: string }) {
  const bars: Array<{ x: number; width: number }> = [];
  let x = 0;
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) seed = (seed * 33 + value.charCodeAt(index)) >>> 0;
  for (let index = 0; index < 52; index += 1) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const width = index % 7 === 0 ? 2.2 : seed % 3 === 0 ? 1.65 : 1;
    if (index % 2 === 0) bars.push({ x, width });
    x += width + 0.75;
  }

  return (
    <svg viewBox={`0 0 ${x} 28`} className="barcode-mark" preserveAspectRatio="none" aria-hidden="true" shapeRendering="crispEdges">
      {bars.map((bar, index) => <rect key={index} x={bar.x} y="0" width={bar.width} height="28" fill="#111827" />)}
    </svg>
  );
}
