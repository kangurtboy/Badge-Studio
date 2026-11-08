import { MAX_BADGES } from "../../constants/rules";
import type { Student } from "../../types/badge";
import { Icon } from "../UI/Icon";

export function LeftSidebar({
  slots,
  selected,
  studentsCount,
  onSelectStudent,
  onAddStudent,
  onFillDemo,
  onDuplicateStudent,
  onDeleteStudent,
}: {
  slots: Array<Student | null>;
  selected: Student | null;
  studentsCount: number;
  onSelectStudent: (id: string) => void;
  onAddStudent: (index: number) => void;
  onFillDemo: () => void;
  onDuplicateStudent: (id: string) => void;
  onDeleteStudent: (id: string) => void;
}) {
  return (
    <aside className="left-sidebar" aria-label="Панели функсияҳо">
      <div className="left-sidebar-header">
        <div className="sidebar-brand-title">
          <span className="sidebar-icon">
            <Icon name="layout" size={16} />
          </span>
          <div>
            <span className="eyebrow">МЕНЮИ АСОСӢ</span>
            <h3>Асбобҳо</h3>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <span>ДЕМО-МАЪЛУМОТ</span>
          <i />
        </div>
        <div className="demo-fill-card">
          <div className="demo-fill-badge">8 донишҷӯи тиббӣ</div>
          <strong>Пур кардани варақ</strong>
          <p>4 духтар ва 4 писар дар либоси тиббӣ бо номҳои тоҷикӣ ва ихтисосҳои гуногун.</p>
          <button
            type="button"
            className="fill-demo-btn"
            onClick={onFillDemo}
          >
            <Icon name="plus" size={14} />
            <span>Пур кардани 8 донишҷӯ</span>
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <span>РӮЙХАТИ БЕЙДЖҲО</span>
          <span className="slot-badge">{studentsCount} / {MAX_BADGES}</span>
        </div>
        <div className="slot-nav-list">
          {Array.from({ length: MAX_BADGES }, (_, idx) => {
            const item = slots[idx];
            const isCurSelected = selected?.id === item?.id;
            return (
              <div
                key={`nav-slot-${idx}`}
                role="button"
                tabIndex={0}
                className={`slot-nav-item ${isCurSelected ? "selected" : ""} ${item ? "filled" : "empty"}`}
                onClick={() => {
                  if (item) {
                    onSelectStudent(item.id);
                  } else {
                    onAddStudent(idx);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (item) {
                      onSelectStudent(item.id);
                    } else {
                      onAddStudent(idx);
                    }
                  }
                }}
              >
                <span className="slot-nav-num">{String(idx + 1).padStart(2, "0")}</span>
                {item ? (
                  <>
                    <div className="slot-nav-preview">
                      <div className="slot-nav-avatar">
                        {item.photo ? (
                          <img src={item.photo} alt={item.fullName} />
                        ) : (
                          <span>{item.fullName.charAt(0) || "Д"}</span>
                        )}
                      </div>
                      <div className="slot-nav-text">
                        <span className="slot-nav-name">{item.fullName}</span>
                        <span className="slot-nav-sub">{item.specialty}</span>
                      </div>
                    </div>
                    <div className="slot-actions">
                      {studentsCount < MAX_BADGES && (
                        <button
                          type="button"
                          className="slot-copy-btn"
                          title="Нусхабардорӣ (Дублировать этот бейдж)"
                          aria-label={`Нусхабардории бейҷи ${item.fullName}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateStudent(item.id);
                          }}
                        >
                          <Icon name="copy" size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="slot-delete-btn"
                        title="Нобуд кардан (Удалить этот бейдж)"
                        aria-label={`Нобуд кардани бейҷи ${item.fullName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStudent(item.id);
                        }}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="slot-nav-empty">+ Ҷойи холӣ</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="sidebar-section future-section">
        <div className="sidebar-section-title">
          <span>ИМКОНИЯТҲОИ ОЯНДА</span>
          <span className="soon-pill">Ба қарибӣ</span>
        </div>
        <div className="future-card-list">
          <div className="future-card-item">
            <span className="future-card-icon">📊</span>
            <div>
              <strong>Воридот аз Excel / CSV</strong>
              <span>Боркунии яклухти рӯйхат</span>
            </div>
          </div>
          <div className="future-card-item">
            <span className="future-card-icon">📑</span>
            <div>
              <strong>Экспорти PDF босифат</strong>
              <span>Барои чопхонаҳои касбӣ</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
