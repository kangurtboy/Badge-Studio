import type { Side } from "../../types/badge";
import { Icon } from "../UI/Icon";
import { ZoomBar } from "./ZoomBar";

export function CanvasToolbar({
  side,
  setSide,
  onResetFlipped,
  zoom,
  setZoom,
  hasStudents,
  onPrint,
}: {
  side: Side;
  setSide: (side: Side) => void;
  onResetFlipped: () => void;
  zoom: number;
  setZoom: (value: number | ((prev: number) => number)) => void;
  hasStudents: boolean;
  onPrint: (side: Side) => void;
}) {
  return (
    <div className="canvas-toolbar">
      <div className="canvas-heading">
        <div className="canvas-heading-title">
          <span className="eyebrow">РАБОЧАЯ ОБЛАСТЬ</span>
          <h1>Лист бейджей</h1>
        </div>
        <div className="sheet-spec">
          <span>A4</span>
          <i />
          210 × 297 мм (2×4)
          <i />
          96 × 67 мм
        </div>
      </div>

      <div className="canvas-tools">
        <div className="side-switch" role="tablist" aria-label="Сторона бейджей">
          <button
            type="button"
            role="tab"
            aria-selected={side === "front"}
            className={side === "front" ? "active" : ""}
            onClick={() => {
              setSide("front");
              onResetFlipped();
            }}
          >
            Лицевая
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={side === "back"}
            className={side === "back" ? "active" : ""}
            onClick={() => {
              setSide("back");
              onResetFlipped();
            }}
          >
            Оборот
          </button>
        </div>

        <ZoomBar zoom={zoom} setZoom={setZoom} />

        <div className="print-buttons">
          <button
            type="button"
            className="print-button primary"
            disabled={!hasStudents}
            onClick={() => onPrint("front")}
          >
            <Icon name="print" size={15} />
            <span>Печать лица</span>
          </button>
          <button
            type="button"
            className="print-button secondary"
            disabled={!hasStudents}
            onClick={() => onPrint("back")}
          >
            <Icon name="print" size={15} />
            <span>Печать оборота</span>
          </button>
        </div>
      </div>
    </div>
  );
}
