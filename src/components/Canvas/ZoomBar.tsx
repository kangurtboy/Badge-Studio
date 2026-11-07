export function ZoomBar({
  zoom,
  setZoom,
}: {
  zoom: number;
  setZoom: (value: number | ((prev: number) => number)) => void;
}) {
  return (
    <div className="zoom-slider-wrap" title="Масштабирование листа A4">
      <span className="zoom-label">Масштаб:</span>
      <input
        type="range"
        className="zoom-range-input"
        min="0.5"
        max="2.0"
        step="0.05"
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        title={`Масштаб: ${Math.round(zoom * 100)}%`}
      />
      <button
        type="button"
        className="zoom-percent-badge"
        title="Сбросить масштаб на 100%"
        onClick={() => setZoom(1)}
      >
        {Math.round(zoom * 100)}%
      </button>
    </div>
  );
}
