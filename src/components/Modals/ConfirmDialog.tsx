import { Icon } from "../UI/Icon";

export function ConfirmDialog({
  dialog,
  onClose,
  onConfirm,
}: {
  dialog: "clear" | "remove";
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dialog-scrim" onMouseDown={onClose}>
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-icon">
          <Icon name="warning" size={19} />
        </div>
        <button
          className="dialog-close"
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <Icon name="close" size={16} />
        </button>
        <span className="eyebrow">ПОДТВЕРЖДЕНИЕ</span>
        <h2 id="dialog-title">
          {dialog === "clear" ? "Очистить весь лист?" : "Удалить этот бейдж?"}
        </h2>
        <p>
          {dialog === "clear"
            ? "Лист будет сброшен: первый бейдж останется демонстрационным студентом."
            : "Данные этого студента будут удалены. Остальные бейджи останутся на листе."}
        </p>
        <div className="dialog-actions">
          <button className="dialog-cancel" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="dialog-confirm" type="button" onClick={onConfirm}>
            Удалить данные
          </button>
        </div>
      </section>
    </div>
  );
}
