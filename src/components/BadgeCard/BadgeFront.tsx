import { useState, type CSSProperties, type MouseEvent } from "react";
import type { Student, StudentField } from "../../types/badge";
import { EditableText } from "../UI/EditableText";
import { Icon } from "../UI/Icon";
import { SignatureMark } from "./SignatureMark";

export function BadgeFront({
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
    transform: `translate(calc(-50% + ${offsetX}%), calc(-50% + ${offsetY}%)) scale(${student.photoZoom})`,
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
    const frameWidth = frameRect.width || 120;
    const frameHeight = frameRect.height || 160;

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
    <div className="badge-artwork badge-front">
      <div className="front-heading">
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

      <div className="front-body">
        <div
          className={`photo-frame ${isDragging ? "is-dragging" : ""}`}
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
                alt={`Фото: ${student.fullName || "студент"}`}
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
            <div className="photo-empty"><Icon name="image" size={18} /><span>ФОТО</span></div>
          )}
        </div>

        <div className="front-data">
          <div className="student-number">
            <EditableText
              value={student.studentId}
              label="Рақами донишҷӯӣ"
              placeholder="Рақами донишҷӯӣ"
              className="mono-edit"
              onChange={(value) => update("studentId", value)}
            />
          </div>
          <EditableText
            value={student.fullName}
            label="Ному насаби донишҷӯ"
            placeholder="НОМУ НАСАБИ ДОНИШҶӮ"
            className="student-name"
            onChange={(value) => update("fullName", value)}
          />
          <div className="student-detail">
            <span>Ихтисос:</span>
            <EditableText
              value={student.specialty}
              label="Ихтисос"
              placeholder="Ихтисос"
              onChange={(value) => update("specialty", value)}
            />
          </div>
          <div className="student-detail study-detail">
            <span className="green-dot" />
            <span>Соли таҳсил:</span>
            <EditableText
              value={student.studyYears}
              label="Соли таҳсил"
              placeholder="Солҳои таҳсил"
              onChange={(value) => update("studyYears", value)}
            />
          </div>
        </div>
      </div>

      <div className="front-signature">
        <span>Директор:</span>
        <SignatureMark />
        <strong>Содиқзода З.И.</strong>
      </div>
    </div>
  );
}
