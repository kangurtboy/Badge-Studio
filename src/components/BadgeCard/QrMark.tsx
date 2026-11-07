export function QrMark({ value }: { value: string }) {
  const size = 21;
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) seed = (seed * 31 + value.charCodeAt(index)) >>> 0;

  const finderValue = (x: number, y: number, left: number, top: number) => {
    const localX = x - left;
    const localY = y - top;
    if (localX < 0 || localX > 6 || localY < 0 || localY > 6) return null;
    return localX === 0 || localX === 6 || localY === 0 || localY === 6 || (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4);
  };

  const cells: Array<[number, number]> = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const finder = finderValue(x, y, 0, 0) ?? finderValue(x, y, size - 7, 0) ?? finderValue(x, y, 0, size - 7);
      seed = (seed * 1664525 + 1013904223) >>> 0;
      if (finder === true || (finder === null && seed % 3 !== 0)) cells.push([x, y]);
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="qr-mark" aria-hidden="true" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111827" />)}
    </svg>
  );
}
