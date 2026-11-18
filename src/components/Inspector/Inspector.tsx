import type { ChangeEvent, RefObject } from "react";
import type { Student, StudentField } from "../../types/badge";
import { Icon } from "../UI/Icon";
import { RangeField } from "../UI/RangeField";
import { TextField } from "../UI/TextField";

export function Inspector({
  selected,
  selectedIndex,
  photoInputRef,
  onUpdateSelected,
  onPhotoChange,
  onRequestDelete,
  onAddStudent,
}: {
  selected: Student | null;
  selectedIndex: number;
  photoInputRef: RefObject<HTMLInputElement | null>;
  onUpdateSelected: <K extends StudentField>(field: K, value: Student[K]) => void;
  onPhotoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRequestDelete: () => void;
  onAddStudent: () => void;
}) {
  return (
    <aside className="inspector" aria-label="Редактор выбранного бейджа">
      {selected ? (
        <>
          <div className="inspector-heading">
            <div>
              <span className="eyebrow">БЕЙДЖ {String(selectedIndex + 1).padStart(2, "0")} / 08</span>
              <h2>Данные студента</h2>
            </div>
            <span className="selected-mark">
              <Icon name="check" size={13} />
            </span>
          </div>

          <div className="inline-edit-hint">
            <span className="hint-cursor">T</span>
            Текст на макете тоже можно редактировать кликом
          </div>

          {/* Template Switcher */}
          <div className="template-switcher-section">
            <span className="template-switcher-label">ШАБЛОНИ БЕЙДЖ:</span>
            <div className="template-toggle-group">
              <button
                type="button"
                className={`template-toggle-btn ${selected.template !== "security" ? "active" : ""}`}
                onClick={() => onUpdateSelected("template", "student")}
              >
                <Icon name="user" size={13} />
                <span>Донишҷӯ</span>
              </button>
              <button
                type="button"
                className={`template-toggle-btn ${selected.template === "security" ? "active" : ""}`}
                onClick={() => {
                  onUpdateSelected("template", "security");
                  if (!selected.role) onUpdateSelected("role", "МУҲОФИЗ");
                  if (!selected.roleEn) onUpdateSelected("roleEn", "COLLEGE SECURITY");
                  if (!selected.cardType) onUpdateSelected("cardType", "КОРТИ ХИЗМАТӢ");
                  if (!selected.studentId || selected.studentId.startsWith("2-")) {
                    onUpdateSelected("studentId", `SEC-0${selectedIndex + 1}`);
                  }
                }}
              >
                <Icon name="shield" size={13} />
                <span>Ҳифозат</span>
              </button>
            </div>
          </div>

          {selected.template === "security" ? (
            <div className="form-section">
              <div className="section-heading">
                <span>ЛИЦЕВАЯ СТОРОНА (ҲИФОЗАТ)</span>
                <i />
              </div>
              <TextField
                label="ФИО сотрудника"
                value={selected.fullName}
                placeholder="САФАРОВ ФАРҲОД КАРИМОВИЧ"
                onChange={(value) => onUpdateSelected("fullName", value)}
              />
              <div className="form-row">
                <TextField
                  label="Вазифа (Роль)"
                  value={selected.role || "МУҲОФИЗ"}
                  placeholder="МУҲОФИЗ"
                  onChange={(value) => onUpdateSelected("role", value)}
                />
                <TextField
                  label="Вазифа (EN)"
                  value={selected.roleEn || "COLLEGE SECURITY"}
                  placeholder="COLLEGE SECURITY"
                  onChange={(value) => onUpdateSelected("roleEn", value)}
                />
              </div>
              <div className="form-row">
                <TextField
                  label="Навъи корт"
                  value={selected.cardType || "КОРТИ ХИЗМАТӢ"}
                  placeholder="КОРТИ ХИЗМАТӢ"
                  onChange={(value) => onUpdateSelected("cardType", value)}
                />
                <TextField
                  label="Рақами корманд"
                  value={selected.studentId}
                  placeholder="SEC-01"
                  mono
                  onChange={(value) => onUpdateSelected("studentId", value)}
                />
              </div>
            </div>
          ) : (
            <div className="form-section">
              <div className="section-heading">
                <span>ЛИЦЕВАЯ СТОРОНА (ДОНИШҶӮ)</span>
                <i />
              </div>
              <TextField
                label="ФИО студента"
                value={selected.fullName}
                placeholder="Имя и фамилия"
                onChange={(value) => onUpdateSelected("fullName", value)}
              />
              <div className="form-row">
                <TextField
                  label="Номер"
                  value={selected.studentId}
                  placeholder="2-000000"
                  mono
                  onChange={(value) => onUpdateSelected("studentId", value)}
                />
                <TextField
                  label="Годы обучения"
                  value={selected.studyYears}
                  placeholder="2024–2028"
                  onChange={(value) => onUpdateSelected("studyYears", value)}
                />
              </div>
              <TextField
                label="Специальность"
                value={selected.specialty}
                placeholder="Направление"
                onChange={(value) => onUpdateSelected("specialty", value)}
              />
            </div>
          )}

          <div className="form-section photo-section">
            <div className="section-heading">
              <span>ФОТОГРАФИЯ</span>
              <i />
            </div>
            <div className="photo-upload-row">
              <div className="photo-thumb">
                {selected.photo ? (
                  <img
                    src={selected.photo}
                    alt="Фото студента"
                    style={{
                      transform: (selected.photoRotate ?? 0) !== 0 ? `rotate(${selected.photoRotate}deg)` : undefined,
                      filter: [
                        (selected.photoBrightness ?? 100) !== 100 ? `brightness(${selected.photoBrightness}%)` : "",
                        (selected.photoContrast ?? 100) !== 100 ? `contrast(${selected.photoContrast}%)` : "",
                        (selected.photoSaturation ?? 100) !== 100 ? `saturate(${selected.photoSaturation}%)` : "",
                        (selected.photoWarmth ?? 0) > 0 ? `sepia(${selected.photoWarmth}%)` : "",
                      ].filter(Boolean).join(" ") || undefined,
                    }}
                  />
                ) : (
                  <Icon name="image" size={18} />
                )}
              </div>
              <div className="photo-upload-copy">
                <button
                  className="upload-button"
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Icon name="image" size={14} />
                  Заменить фото
                </button>
                <span>Двойной клик на фото или перетаскивание мышью прямо на карточке</span>
              </div>
              {selected.photo && (
                <button
                  className="remove-photo"
                  type="button"
                  aria-label="Удалить фото"
                  title="Удалить фото"
                  onClick={() => onUpdateSelected("photo", "")}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            <input
              ref={photoInputRef}
              className="file-input"
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
            />

            <div className="photo-ranges">
              <RangeField
                label="Масштаб (Zoom)"
                value={selected.photoZoom}
                min={1}
                max={4}
                step={0.01}
                display={`${selected.photoZoom.toFixed(2)}×`}
                onChange={(value) => onUpdateSelected("photoZoom", value)}
              />
              <div className="rotate-control-group">
                <RangeField
                  label="Поворот (Угол)"
                  value={selected.photoRotate ?? 0}
                  min={-180}
                  max={180}
                  step={1}
                  display={`${selected.photoRotate ?? 0}°`}
                  onChange={(value) => onUpdateSelected("photoRotate", value)}
                />
                <div className="rotate-quick-row">
                  <button
                    type="button"
                    className="rotate-step-btn"
                    title="Повернуть на 90° влево"
                    onClick={() => {
                      let next = (selected.photoRotate ?? 0) - 90;
                      if (next < -180) next += 360;
                      onUpdateSelected("photoRotate", next);
                    }}
                  >
                    <Icon name="rotate" size={11} />
                    <span>-90°</span>
                  </button>
                  <button
                    type="button"
                    className="rotate-step-btn"
                    title="Повернуть на 90° вправо"
                    onClick={() => {
                      let next = (selected.photoRotate ?? 0) + 90;
                      if (next > 180) next -= 360;
                      onUpdateSelected("photoRotate", next);
                    }}
                  >
                    <Icon name="rotate" size={11} />
                    <span>+90°</span>
                  </button>
                  {(selected.photoRotate ?? 0) !== 0 && (
                    <button
                      type="button"
                      className="rotate-reset-btn"
                      title="Сбросить угол на 0°"
                      onClick={() => onUpdateSelected("photoRotate", 0)}
                    >
                      Сброс 0°
                    </button>
                  )}
                </div>
              </div>
              <RangeField
                label="Смещение X (Горизонталь)"
                value={selected.photoX}
                min={0}
                max={100}
                step={1}
                display={`${selected.photoX}%`}
                onChange={(value) => onUpdateSelected("photoX", value)}
              />
              <RangeField
                label="Смещение Y (Вертикаль)"
                value={selected.photoY}
                min={0}
                max={100}
                step={1}
                display={`${selected.photoY}%`}
                onChange={(value) => onUpdateSelected("photoY", value)}
              />
            </div>

            {selected.photo && (
              <div className="photo-color-section">
                <div className="photo-color-header">
                  <span className="photo-color-title">ЦВЕТОКОРРЕКЦИЯ (CSS)</span>
                  {((selected.photoBrightness ?? 100) !== 100 ||
                    (selected.photoContrast ?? 100) !== 100 ||
                    (selected.photoSaturation ?? 100) !== 100 ||
                    (selected.photoWarmth ?? 0) !== 0) && (
                    <button
                      type="button"
                      className="reset-filters-btn"
                      title="Сбросить цветовые настройки фото"
                      onClick={() => {
                        onUpdateSelected("photoBrightness", 100);
                        onUpdateSelected("photoContrast", 100);
                        onUpdateSelected("photoSaturation", 100);
                        onUpdateSelected("photoWarmth", 0);
                      }}
                    >
                      Сброс
                    </button>
                  )}
                </div>
                <div className="photo-ranges">
                  <RangeField
                    label="Яркость (Brightness)"
                    value={selected.photoBrightness ?? 100}
                    min={50}
                    max={150}
                    step={1}
                    display={`${selected.photoBrightness ?? 100}%`}
                    onChange={(value) => onUpdateSelected("photoBrightness", value)}
                  />
                  <RangeField
                    label="Контраст (Contrast)"
                    value={selected.photoContrast ?? 100}
                    min={50}
                    max={150}
                    step={1}
                    display={`${selected.photoContrast ?? 100}%`}
                    onChange={(value) => onUpdateSelected("photoContrast", value)}
                  />
                  <RangeField
                    label="Насыщенность (Saturation)"
                    value={selected.photoSaturation ?? 100}
                    min={0}
                    max={200}
                    step={1}
                    display={`${selected.photoSaturation ?? 100}%`}
                    onChange={(value) => onUpdateSelected("photoSaturation", value)}
                  />
                  <RangeField
                    label="Тёплый тон (Warmth)"
                    value={selected.photoWarmth ?? 0}
                    min={0}
                    max={60}
                    step={1}
                    display={`${selected.photoWarmth ?? 0}%`}
                    onChange={(value) => onUpdateSelected("photoWarmth", value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section reverse-section">
            <div className="section-heading">
              <span>ОБОРОТНАЯ СТОРОНА</span>
              <i />
            </div>
            <TextField
              label="Действителен до"
              value={selected.expires}
              placeholder="ДД/ММ/ГГГГ"
              onChange={(value) => onUpdateSelected("expires", value)}
            />
            {selected.template === "security" ? (
              <div className="security-rules-note">
                <span>3 служебных правила охраны, QR-код и адрес колледжа в Кангурте формируются автоматически</span>
              </div>
            ) : (
              <div className="form-row">
                <TextField
                  label="Логин"
                  value={selected.login}
                  placeholder="Логин"
                  mono
                  onChange={(value) => onUpdateSelected("login", value)}
                />
                <TextField
                  label="Пароль"
                  value={selected.password}
                  placeholder="Пароль"
                  mono
                  onChange={(value) => onUpdateSelected("password", value)}
                />
              </div>
            )}
          </div>

          <button
            className="delete-student"
            type="button"
            onClick={onRequestDelete}
          >
            <Icon name="trash" size={14} />
            Удалить этот бейдж
          </button>
        </>
      ) : (
        <div className="inspector-empty">
          <div className="empty-icon">
            <Icon name="image" size={22} />
          </div>
          <span className="eyebrow">ЛОКАЛЬНЫЙ ПРОЕКТ</span>
          <h2>Рабочий лист пуст</h2>
          <p>Добавьте студента, чтобы заполнить бейдж и подготовить обе стороны к печати.</p>
          <button
            className="add-button"
            type="button"
            onClick={onAddStudent}
          >
            <Icon name="plus" size={16} />
            Добавить студента
          </button>
        </div>
      )}
    </aside>
  );
}
