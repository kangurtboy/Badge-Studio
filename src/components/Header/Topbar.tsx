import { MAX_BADGES } from "../../constants/rules";
import { Icon } from "../UI/Icon";

export function Topbar({
  saveStatus,
  studentsCount,
  onClear,
  onAddStudent,
}: {
  saveStatus: "saving" | "saved" | "error";
  studentsCount: number;
  onClear: () => void;
  onAddStudent: () => void;
}) {
  return (
    <header className="topbar">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <rect x="5" y="7" width="22" height="18" rx="3" stroke="currentColor" strokeWidth="1.7" />
            <path d="M5 12h22M10 7v5M22 7v5M10 17h6M10 21h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="brand-copy">
          <strong>Бейдж-мастер</strong>
          <span>Колледж медицины · Темурмалик</span>
        </div>
      </div>

      <div className={`save-indicator ${saveStatus}`} aria-live="polite">
        <span className="save-dot">
          {saveStatus === "saved" ? <Icon name="check" size={11} /> : null}
        </span>
        <span>
          {saveStatus === "saving"
            ? "Сохранение…"
            : saveStatus === "error"
              ? "Не удалось сохранить"
              : "Сохранено на устройстве"}
        </span>
      </div>

      <div className="top-actions">
        <button
          className="clear-button"
          type="button"
          disabled={studentsCount === 0}
          onClick={onClear}
        >
          <Icon name="trash" size={15} />
          <span>Очистить</span>
        </button>
        <button
          className="add-button"
          type="button"
          disabled={studentsCount >= MAX_BADGES}
          onClick={onAddStudent}
        >
          <Icon name="plus" size={16} />
          <span>Добавить студента</span>
        </button>
      </div>
    </header>
  );
}
