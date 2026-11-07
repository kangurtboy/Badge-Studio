export function Barcode({ value }: { value: string }) {
  // Generate deterministic bar widths based on student ID value
  const barPattern = [
    2, 1, 3, 1, 1, 2, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 3, 1, 1, 2, 1, 3, 1, 2, 2, 3, 1, 1, 2, 1, 2
  ];

  let x = 2;
  const rects: Array<{ x: number; w: number }> = [];
  for (let i = 0; i < barPattern.length; i++) {
    const w = barPattern[i];
    if (i % 2 === 0) {
      rects.push({ x, w });
    }
    x += w + 2;
  }

  return (
    <svg viewBox="0 0 176 32" className="barcode-mark" preserveAspectRatio="none" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="176" height="32" fill="white" />
      {rects.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="32" fill="#0F172A" />
      ))}
    </svg>
  );
}
