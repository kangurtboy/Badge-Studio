import type { RefObject } from "react";
import { MAX_BADGES } from "../../constants/rules";
import type { Side, Student, StudentField } from "../../types/badge";
import { BadgeArtwork } from "../BadgeCard/BadgeArtwork";
import { Icon } from "../UI/Icon";

export function SheetStage({
  slots,
  selected,
  side,
  flippedCards,
  zoom,
  setZoom,
  photoInputRef,
  onSelectStudent,
  onAddStudent,
  onToggleFlip,
  onUpdateStudent,
}: {
  slots: Array<Student | null>;
  selected: Student | null;
  side: Side;
  flippedCards: Record<string, boolean>;
  zoom: number;
  setZoom: (value: number | ((prev: number) => number)) => void;
  photoInputRef: RefObject<HTMLInputElement | null>;
  onSelectStudent: (id: string) => void;
  onAddStudent: (index: number) => void;
  onToggleFlip: (id: string) => void;
  onUpdateStudent: <K extends StudentField>(id: string, field: K, value: Student[K]) => void;
}) {
  return (
    <div
      className="sheet-stage"
      onWheel={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setZoom((z) => Math.min(2.0, Math.max(0.5, Math.round((z - e.deltaY * 0.002) * 100) / 100)));
        }
      }}
    >
      <div
        className="sheet-zoom-wrapper"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center top",
        }}
      >
        <div className="sheet-page" aria-label={`Лист A4, ${MAX_BADGES} мест для бейджей`}>
          <div className="sheet-grid">
            {Array.from({ length: MAX_BADGES }, (_, slotIndex) => {
              const student = slots[slotIndex];
              const isSelected = selected?.id === student?.id;
              const isCardFlipped = (side === "back") !== Boolean(student && flippedCards[student.id]);

              return student ? (
                <div
                  key={`slot-${slotIndex}`}
                  className={`badge-slot ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onSelectStudent(student.id)}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
                      event.preventDefault();
                      onSelectStudent(student.id);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Бейдж ${slotIndex + 1}: ${student.fullName || "без имени"}`}
                >
                  <div className={`badge-flipper ${isCardFlipped ? "show-back" : ""}`}>
                    <div className="badge-face front-face">
                      <BadgeArtwork
                        student={student}
                        side="front"
                        update={(field, value) => onUpdateStudent(student.id, field, value)}
                        onUploadPhoto={() => {
                          onSelectStudent(student.id);
                          photoInputRef.current?.click();
                        }}
                      />
                    </div>
                    <div className="badge-face back-face">
                      <BadgeArtwork
                        student={student}
                        side="back"
                        update={(field, value) => onUpdateStudent(student.id, field, value)}
                        onUploadPhoto={() => {
                          onSelectStudent(student.id);
                          photoInputRef.current?.click();
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className="flip-control"
                    type="button"
                    aria-label="Перевернуть этот бейдж"
                    title="Перевернуть только этот бейдж"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFlip(student.id);
                    }}
                  >
                    <Icon name="rotate" size={14} />
                  </button>
                </div>
              ) : (
                <button
                  className="empty-slot"
                  type="button"
                  key={`empty-${slotIndex}`}
                  onClick={() => onAddStudent(slotIndex)}
                  aria-label={`Добавить студента в место ${slotIndex + 1}`}
                >
                  <span className="empty-slot-count">{String(slotIndex + 1).padStart(2, "0")}</span>
                  <span className="empty-slot-plus">
                    <Icon name="plus" size={17} />
                  </span>
                  <span className="empty-slot-label">Добавить</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
