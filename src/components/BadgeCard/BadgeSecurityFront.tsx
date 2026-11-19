import { useState, type CSSProperties, type MouseEvent } from "react";
import type { Student, StudentField } from "../../types/badge";
import { EditableText } from "../UI/EditableText";
import { Icon } from "../UI/Icon";
import { SignatureMark } from "./SignatureMark";

export function BadgeSecurityFront({
  student,
  update,
  onUploadPhoto,
}: {
  student: Student;
  update: <K extends StudentField>(field: K, value: Student[K]) => void;
  onUploadPhoto?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const offsetX = (student.photoX - 50) * 1.25;
  const offsetY = (student.photoY - 50) * 1.25;
  const rotate = student.photoRotate ?? 0;

  const brightness = student.photoBrightness ?? 100;
  const contrast = student.photoContrast ?? 100;
  const saturation = student.photoSaturation ?? 100;
  const warmth = student.photoWarmth ?? 0;

  const filterParts: string[] = [];
  if (brightness !== 100) filterParts.push(`brightness(${brightness}%)`);
  if (contrast !== 100) filterParts.push(`contrast(${contrast}%)`);
  if (saturation !== 100) filterParts.push(`saturate(${saturation}%)`);
  if (warmth > 0) filterParts.push(`sepia(${warmth}%)`);

  const photoFilter = filterParts.length > 0 ? filterParts.join(" ") : undefined;

  const photoStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `translate(calc(-50% + ${offsetX}%), calc(-50% + ${offsetY}%)) rotate(${rotate}deg) scale(${student.photoZoom})`,
    transformOrigin: "center center",
    filter: photoFilter,
    userSelect: "none",
    pointerEvents: "none",
  };

  const handlePhotoMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = student.photoX;
    const startY = student.photoY;
    const frameRect = e.currentTarget.getBoundingClientRect();
    const frameWidth = frameRect.width || 106;
    const frameHeight = frameRect.height || 140;

    const onMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const deltaX = ((moveEvent.clientX - startClientX) / frameWidth) * 80;
      const deltaY = ((moveEvent.clientY - startClientY) / frameHeight) * 80;
      const nextX = Math.round(Math.max(0, Math.min(100, startX + deltaX)));
      const nextY = Math.round(Math.max(0, Math.min(100, startY + deltaY)));
      update("photoX", nextX);
      update("photoY", nextY);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="badge-artwork badge-front badge-security-front template-security">
      {/* 1. Header with emblems and college name (Figma 36:25 — White background, 62px / 22.3%) */}
      <div className="front-heading security-front-heading">
        <div className="crest-seal">
          <img
            src="./assets/figma-emblem-tajikistan.png"
            alt="Герби Тоҷикистон"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
        <div className="institution-name">
          <span>КОЛЛЕҶИ ТИББИИ</span>
          <strong>ДОНИШГОҲИ ДАВЛАТИИ ТИББИИ ХАТЛОН</strong>
          <span>ДАР ДЕҲОТИ КАНГУРТИ НОҲИЯИ ТЕМУРМАЛИК</span>
        </div>
        <div className="medical-seal">
          <img
            src="./assets/figma-medical-emblem.png"
            alt="Эмблемаи тиббӣ"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* 2. Main Body: Security identity — navy / brass (Figma 36:40 — #142a39, 184px / 66.2%) */}
      <div className="security-navy-body">
        {/* Left column: Role, Name, Divider, Card Type */}
        <div className="security-info-col">
          <div className="security-role-wrapper">
            <span className="brass-marker" />
            <div className="security-role-texts">
              <EditableText
                value={student.role || "МУҲОФИЗ"}
                label="Вазифа"
                placeholder="МУҲОФИЗ"
                className="security-role-title"
                onChange={(value) => update("role", value)}
              />
              <EditableText
                value={student.roleEn || "COLLEGE SECURITY"}
                label="Вазифа (EN)"
                placeholder="COLLEGE SECURITY"
                className="security-role-sub"
                onChange={(value) => update("roleEn", value)}
              />
            </div>
          </div>

          <div className="security-name-box">
            <EditableText
              value={student.fullName}
              label="Ному насаби корманд"
              placeholder="САФАРОВ ФАРҲОД КАРИМОВИЧ"
              className="security-name-text"
              onChange={(value) => update("fullName", value)}
            />
          </div>

          <div className="security-identity-line" />

          <div className="security-type-strip">
            <EditableText
              value={student.cardType || "КОРТИ ХИЗМАТӢ"}
              label="Навъи шаҳодатнома"
              placeholder="КОРТИ ХИЗМАТӢ"
              className="security-card-type-text"
              onChange={(value) => update("cardType", value)}
            />
          </div>
        </div>

        {/* Right column: Student Photo frame (106x140 with brass border #d5b778, Figma 36:41) */}
        <div className="security-photo-col">
          <div
            className={`security-photo-frame photo-frame ${isDragging ? "is-dragging" : ""}`}
            title="Двойной клик — сменить фото | Зажмите и перетащите мышью для настройки лица"
            onDoubleClick={(e) => {
              e.stopPropagation();
              onUploadPhoto?.();
            }}
            onMouseDown={handlePhotoMouseDown}
          >
            {student.photo ? (
              <>
                <img
                  src={student.photo}
                  alt={`Фото: ${student.fullName || "корманд"}`}
                  style={photoStyle}
                  draggable={false}
                />
                {!isDragging && (
                  <button
                    type="button"
                    className="photo-delete-btn"
                    title="Нест кардани акс (Удалить фото)"
                    aria-label="Удалить фото"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      update("photo", "");
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Icon name="close" size={9} />
                  </button>
                )}
              </>
            ) : (
              <div className="photo-empty security-photo-empty">
                <Icon name="image" size={18} />
                <span>АКС</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Footer: Director Authorization (Figma 36:62 — #f8fafc with signature, 30px / 10.8%) */}
      <div className="front-signature security-front-signature">
        <span>Директор:</span>
        <SignatureMark />
        <strong>Содиқзода З.И.</strong>
      </div>
    </div>
  );
}
