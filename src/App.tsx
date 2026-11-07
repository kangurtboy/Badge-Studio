import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent } from "react";

type Side = "front" | "back";
type StudentField =
  | "fullName"
  | "studentId"
  | "specialty"
  | "studyYears"
  | "expires"
  | "login"
  | "password"
  | "photo"
  | "photoX"
  | "photoY"
  | "photoZoom";

type Student = {
  id: string;
  fullName: string;
  studentId: string;
  specialty: string;
  studyYears: string;
  expires: string;
  login: string;
  password: string;
  photo: string;
  photoX: number;
  photoY: number;
  photoZoom: number;
};

type Workspace = {
  students: Array<Student | null>;
  selectedId: string | null;
};

type IconName = "plus" | "minus" | "trash" | "rotate" | "print" | "image" | "check" | "close" | "warning" | "maximize" | "layout";

const STORAGE_KEY = "badge-studio.workspace.v2";
const MAX_BADGES = 8;

const DEMO_STUDENT: Student = {
  id: "demo-nigina",
  fullName: "РАҲИМОВА НИГИНА РУСТАМОВНА",
  studentId: "2-790106",
  specialty: "кори ҳамширагӣ",
  studyYears: "2024–2028",
  expires: "01/07/2028",
  login: "gr790106",
  password: "Student1#",
  photo: "./images/demo-student.jpg",
  photoX: 50,
  photoY: 43,
  photoZoom: 1.08,
};

const TAJIK_DEMO_STUDENTS: Array<Student> = [
  DEMO_STUDENT,
  {
    id: "demo-firuz",
    fullName: "САИДОВ ФИРӮЗ КАРИМОВИЧ",
    studentId: "2-790107",
    specialty: "кори табобатӣ",
    studyYears: "2023–2027",
    expires: "01/07/2027",
    login: "gr790107",
    password: "Student1#",
    photo: "./images/student-male-1.jpg",
    photoX: 50,
    photoY: 35,
    photoZoom: 1.15,
  },
  {
    id: "demo-madina",
    fullName: "НАЗАРОВА МАДИНА ҲАКИМОВНА",
    studentId: "2-790108",
    specialty: "кори момодоягӣ",
    studyYears: "2024–2027",
    expires: "01/07/2027",
    login: "gr790108",
    password: "Student1#",
    photo: "./images/student-female-2.jpg",
    photoX: 50,
    photoY: 36,
    photoZoom: 1.1,
  },
  {
    id: "demo-jamshed",
    fullName: "КАРИМОВ ҶАМШЕД АЗИЗОВИЧ",
    studentId: "2-790109",
    specialty: "кори дандонсозӣ",
    studyYears: "2024–2028",
    expires: "01/07/2028",
    login: "gr790109",
    password: "Student1#",
    photo: "./images/student-male-2.jpg",
    photoX: 50,
    photoY: 36,
    photoZoom: 1.15,
  },
  {
    id: "demo-gulnora",
    fullName: "ХОЛОВА ГУЛНОРА САИДОВНА",
    studentId: "2-790110",
    specialty: "кори фарматсевтӣ",
    studyYears: "2023–2026",
    expires: "01/07/2026",
    login: "gr790110",
    password: "Student1#",
    photo: "./images/student-female-3.jpg",
    photoX: 50,
    photoY: 34,
    photoZoom: 1.25,
  },
  {
    id: "demo-muhammad",
    fullName: "ШАРИПОВ МУҲАММАД РУСТАМОВИЧ",
    studentId: "2-790111",
    specialty: "кори табобатӣ",
    studyYears: "2024–2028",
    expires: "01/07/2028",
    login: "gr790111",
    password: "Student1#",
    photo: "./images/student-male-3.jpg",
    photoX: 50,
    photoY: 35,
    photoZoom: 1.15,
  },
  {
    id: "demo-tahmina",
    fullName: "БОБОЕВА ТАҲМИНА ДАВЛАТОВНА",
    studentId: "2-790112",
    specialty: "ташхиси лабораторӣ",
    studyYears: "2024–2027",
    expires: "01/07/2027",
    login: "gr790112",
    password: "Student1#",
    photo: "./images/student-female-4.jpg",
    photoX: 50,
    photoY: 32,
    photoZoom: 1.2,
  },
  {
    id: "demo-daler",
    fullName: "ЮСУПОВ ДАЛЕР САФАРОВИЧ",
    studentId: "2-790113",
    specialty: "кори ҳамширагӣ",
    studyYears: "2023–2026",
    expires: "01/07/2026",
    login: "gr790113",
    password: "Student1#",
    photo: "./images/student-male-4.jpg",
    photoX: 50,
    photoY: 34,
    photoZoom: 1.18,
  },
];

const RULES = [
  "Ин шаҳодатнома ҳуҷҷати расмии донишҷӯи коллеҷ мебошад.",
  "Ҳангоми ворид шудан ба бино ва дарсҳо бо худ доштани он ҳатмист.",
  "Ба дигарон додан манъ аст. Ҳангоми гум шудан ба деканат муроҷиат намоед.",
];

function createInitialWorkspace(): Workspace {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<Workspace>;
      if (Array.isArray(parsed.students)) {
        const students = parsed.students.slice(0, MAX_BADGES).map((item) => normalizeStudent(item));
        const activeStudents = students.filter((item): item is Student => item !== null);
        if (activeStudents.length > 0) {
          const selectedId = students.some((item) => item?.id === parsed.selectedId)
            ? (parsed.selectedId as string)
            : activeStudents[0].id;
          return { students, selectedId };
        }
      }
    }
  } catch {
    // If browser storage is unavailable, the in-memory demo still works.
  }

  return { students: [DEMO_STUDENT], selectedId: DEMO_STUDENT.id };
}

function normalizeStudent(value: unknown): Student | null {
  if (!value || typeof value !== "object" || !("id" in value) || typeof value.id !== "string") {
    return null;
  }

  const source = value as Partial<Student>;
  return {
    ...DEMO_STUDENT,
    ...source,
    id: value.id,
    fullName: typeof source.fullName === "string" ? source.fullName : "",
    studentId: typeof source.studentId === "string" ? source.studentId : "",
    specialty: typeof source.specialty === "string" ? source.specialty : "",
    studyYears: typeof source.studyYears === "string" ? source.studyYears : "",
    expires: typeof source.expires === "string" ? source.expires : "",
    login: typeof source.login === "string" ? source.login : "",
    password: typeof source.password === "string" ? source.password : "",
    photo: typeof source.photo === "string" ? source.photo : "",
    photoX: typeof source.photoX === "number" ? source.photoX : 50,
    photoY: typeof source.photoY === "number" ? source.photoY : 50,
    photoZoom: typeof source.photoZoom === "number" ? source.photoZoom : 1,
  };
}

function slotForPrint(slots: Array<Student | null>, side: Side, visualIndex: number) {
  const physicalIndex = side === "front"
    ? visualIndex
    : visualIndex % 2 === 0
      ? visualIndex + 1
      : visualIndex - 1;
  return { physicalIndex, student: slots[physicalIndex] ?? null };
}

function makeStudentId(students: Array<Student | null>) {
  const lastNumber = students.reduce((highest, student) => {
    const suffix = Number(student?.studentId.split("-").pop());
    return Number.isFinite(suffix) ? Math.max(highest, suffix) : highest;
  }, 790105);
  return `2-${lastNumber + 1}`;
}

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "minus":
      return <svg {...common}><path d="M5 12h14" /></svg>;
    case "trash":
      return <svg {...common}><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" /></svg>;
    case "rotate":
      return <svg {...common}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.2 9A7 7 0 0 1 18 6.7L20 12M4 12l2 5.3A7 7 0 0 0 17.8 15" /></svg>;
    case "print":
      return <svg {...common}><path d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><path d="M7 14h10v6H7zM17 11h.01" /></svg>;
    case "image":
      return <svg {...common}><rect x="3.5" y="4" width="17" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m5 17 4-4 3 3 3-4 4 5" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "close":
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "warning":
      return <svg {...common}><path d="M10.3 4.4 2.8 17.3A1.8 1.8 0 0 0 4.4 20h15.2a1.8 1.8 0 0 0 1.6-2.7L13.7 4.4a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 16.7h.01" /></svg>;
    case "maximize":
      return <svg {...common}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>;
    case "layout":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></svg>;
  }
}

function EditableText({
  value,
  label,
  placeholder,
  className = "",
  onChange,
}: {
  value: string;
  label: string;
  placeholder: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (spanRef.current && !isFocusedRef.current) {
      if (spanRef.current.textContent !== value) {
        spanRef.current.textContent = value;
      }
    }
  }, [value]);

  return (
    <span
      ref={(el) => {
        spanRef.current = el;
        if (el && !isFocusedRef.current && el.textContent !== value) {
          el.textContent = value;
        }
      }}
      className={`editable-text ${className}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={label}
      data-placeholder={placeholder}
      title="Нажмите, чтобы изменить"
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onBlur={(event) => {
        isFocusedRef.current = false;
        const newText = event.currentTarget.textContent?.replace(/[\n\r]/g, " ") ?? "";
        onChange(newText);
      }}
      onInput={(event) => {
        const newText = event.currentTarget.textContent?.replace(/[\n\r]/g, " ") ?? "";
        onChange(newText);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function CrestMark() {
  return (
    <svg viewBox="0 0 64 64" className="crest-mark" aria-hidden="true">
      <path d="M18 48c-6-3-9-8-10-15 5 0 9 2 12 6M46 48c6-3 9-8 10-15-5 0-9 2-12 6" fill="none" stroke="#17684b" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 46c-3-7-5-12-9-14M44 46c3-7 5-12 9-14" fill="none" stroke="#17684b" strokeWidth="1.4" />
      <path d="M23 15h18l-2 8H25z" fill="#b89035" />
      <path d="m27 14 5-7 5 7M21 24h22l-3 8H24z" fill="#d5b453" stroke="#9b772b" strokeWidth="1" />
      <path d="M24 32h16l-2 14H26z" fill="#c9a54a" stroke="#99772e" strokeWidth="1" />
      <path d="M32 34v10M28 39h8" stroke="#fff9dc" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 50h24" stroke="#b91c2b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 53h12" stroke="#b89035" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="12" r="1.3" fill="#b89035" />
      <circle cx="32" cy="5" r="1.3" fill="#b89035" />
      <circle cx="40" cy="12" r="1.3" fill="#b89035" />
    </svg>
  );
}

function MedicalMark() {
  return (
    <svg viewBox="0 0 64 64" className="medical-mark" aria-hidden="true">
      <circle cx="32" cy="32" r="25" fill="#eff8f5" stroke="#1c7460" strokeWidth="2.2" />
      <path d="M28 17h8v11h11v8H36v11h-8V36H17v-8h11z" fill="#0b5270" />
      <path d="M12 32h5M47 32h5M32 8v5M32 51v5" stroke="#c99d42" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="#fff" />
    </svg>
  );
}

function SignatureMark() {
  return (
    <svg className="signature-mark" viewBox="0 0 120 40" aria-hidden="true">
      <path d="M5 25C20 5 25 35 38 18c7-11 12 12 27-3S80 47 95 20c10-8 15 5 23-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m15 28 55-4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function QrMark({ value }: { value: string }) {
  const size = 21;
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) seed = (seed * 31 + value.charCodeAt(index)) >>> 0;

  const finderValue = (x: number, y: number, left: number, top: number) => {
    const localX = x - left;
    const localY = y - top;
    if (localX < 0 || localX > 6 || localY < 0 || localY > 6) return null;
    return localX === 0 || localX === 6 || localY === 0 || localY === 6 || (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4);
  };

  const cells: Array<[number, number]> = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const finder = finderValue(x, y, 0, 0) ?? finderValue(x, y, size - 7, 0) ?? finderValue(x, y, 0, size - 7);
      seed = (seed * 1664525 + 1013904223) >>> 0;
      if (finder === true || (finder === null && seed % 3 !== 0)) cells.push([x, y]);
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="qr-mark" aria-hidden="true" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111827" />)}
    </svg>
  );
}

function Barcode({ value }: { value: string }) {
  const bars: Array<{ x: number; width: number }> = [];
  let x = 0;
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) seed = (seed * 33 + value.charCodeAt(index)) >>> 0;
  for (let index = 0; index < 52; index += 1) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const width = index % 7 === 0 ? 2.2 : seed % 3 === 0 ? 1.65 : 1;
    if (index % 2 === 0) bars.push({ x, width });
    x += width + 0.75;
  }

  return (
    <svg viewBox={`0 0 ${x} 28`} className="barcode-mark" preserveAspectRatio="none" aria-hidden="true" shapeRendering="crispEdges">
      {bars.map((bar, index) => <rect key={index} x={bar.x} y="0" width={bar.width} height="28" fill="#111827" />)}
    </svg>
  );
}

function BadgeCorners() {
  return null;
}

function BadgeArtwork({
  student,
  side,
  update,
  onUploadPhoto,
}: {
  student: Student;
  side: Side;
  update: <K extends StudentField>(field: K, value: Student[K]) => void;
  onUploadPhoto?: () => void;
}) {
  if (side === "back") {
    return (
      <div className="badge-artwork badge-back">
        <div className="back-heading">
          <div className="back-title-group">
            <strong>ШАҲОДАТНОМАИ ДОНИШҶӮӢ</strong>
            <span className="back-subtitle">STUDENT IDENTIFICATION CARD</span>
          </div>
          <div className="expiry-tag"><span>EXP:</span><EditableText value={student.expires} label="Срок действия" placeholder="ДД/ММ/ГГГГ" onChange={(value) => update("expires", value)} /></div>
        </div>
        <div className="badge-rules">
          {RULES.map((rule, index) => (
            <div className="badge-rule" key={rule}>
              <b>{index + 1}.</b><span>{rule}</span>
            </div>
          ))}
        </div>
        <div className="credentials-panel">
          <div className="credentials-heading"><span className="green-dot" />СИСТЕМАИ ТЕСТӢ</div>
          <div className="credential-row">
            <div className="credential-chip"><span>ЛОГИН:</span><EditableText value={student.login} label="Логин" placeholder="Логин" className="mono-edit" onChange={(value) => update("login", value)} /></div>
            <div className="credential-chip"><span>ПАРОЛ:</span><EditableText value={student.password} label="Пароль" placeholder="Пароль" className="mono-edit" onChange={(value) => update("password", value)} /></div>
          </div>
        </div>
        <div className="back-footer">
          <div className="barcode-block">
            <Barcode value={student.studentId} />
            <EditableText value={student.studentId} label="Рақами донишҷӯӣ" placeholder="Рақами донишҷӯӣ" className="barcode-number mono-edit" onChange={(value) => update("studentId", value)} />
          </div>
          <div className="address-block">
            <div className="qr-box"><QrMark value={student.studentId} /></div>
            <div><b>Суроға:</b><span>ҶТ, н. Темурмалик,<br />ҷамоати Кангурт</span></div>
          </div>
        </div>
        <div className="tajik-ribbon" />
        <BadgeCorners />
      </div>
    );
  }

  // Convert 0..100% position to offset translation.
  // Center is 50%, so offset is (photoX - 50)%.
  // Multiplication factor 1.25 gives ample room to move the face left, right, up, down!
  const offsetX = (student.photoX - 50) * 1.25;
  const offsetY = (student.photoY - 50) * 1.25;

  const photoStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `translate(calc(-50% + ${offsetX}%), calc(-50% + ${offsetY}%)) scale(${student.photoZoom})`,
    transformOrigin: "center center",
    userSelect: "none",
    pointerEvents: "none",
  };

  const handlePhotoMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = student.photoX;
    const startY = student.photoY;
    const frameRect = e.currentTarget.getBoundingClientRect();
    const frameWidth = frameRect.width || 120;
    const frameHeight = frameRect.height || 160;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.clientX - startClientX) / frameWidth) * 80;
      const deltaY = ((moveEvent.clientY - startClientY) / frameHeight) * 80;
      const nextX = Math.round(Math.max(0, Math.min(100, startX + deltaX)));
      const nextY = Math.round(Math.max(0, Math.min(100, startY + deltaY)));
      update("photoX", nextX);
      update("photoY", nextY);
    };

    const onMouseUp = () => {
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
          <img src="./assets/emblem-tajikistan.svg" alt="Герби Тоҷикистон" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div className="institution-name">
          <span>КОЛЛЕҶИ ТИББИИ</span>
          <strong>ДОНИШГОҲИ ДАВЛАТИИ ТИББИИ ХАТЛОН</strong>
          <span>ДАР ДЕҲОТИ КАНГУРТИ НОҲИЯИ ТЕМУРМАЛИК</span>
        </div>
        <div className="medical-seal">
          <img src="./assets/medical-emblem-clean.png" alt="Эмблемаи тиббӣ" style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scale(1.18)", mixBlendMode: "multiply" }} />
        </div>
      </div>
      <div className="front-body">
        <div
          className="photo-frame"
          title="Двойной клик — сменить фото | Зажмите и перетащите мышью для настройки лица"
          onDoubleClick={(e) => {
            e.stopPropagation();
            onUploadPhoto?.();
          }}
          onMouseDown={handlePhotoMouseDown}
        >
          {student.photo ? (
            <img
              src={student.photo}
              alt={`Фото: ${student.fullName || "студент"}`}
              style={photoStyle}
              draggable={false}
            />
          ) : (
            <div className="photo-empty"><Icon name="image" size={18} /><span>ФОТО</span></div>
          )}
        </div>
        <div className="front-data">
          <div className="student-number">
            <EditableText value={student.studentId} label="Рақами донишҷӯӣ" placeholder="Рақами донишҷӯӣ" className="mono-edit" onChange={(value) => update("studentId", value)} />
          </div>
          <EditableText value={student.fullName} label="Ному насаби донишҷӯ" placeholder="НОМУ НАСАБИ ДОНИШҶӮ" className="student-name" onChange={(value) => update("fullName", value)} />
          <div className="student-detail"><span>Ихтисос:</span><EditableText value={student.specialty} label="Ихтисос" placeholder="Ихтисос" onChange={(value) => update("specialty", value)} /></div>
          <div className="student-detail study-detail"><span className="green-dot" /><span>Соли таҳсил:</span><EditableText value={student.studyYears} label="Соли таҳсил" placeholder="Солҳои таҳсил" onChange={(value) => update("studyYears", value)} /></div>
        </div>
      </div>
      <div className="front-signature">
        <span>Директор:</span><SignatureMark /><strong>Содиқзода З.И.</strong>
      </div>
      <BadgeCorners />
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input className={mono ? "mono-input" : ""} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} autoComplete="off" />
    </label>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-field">
      <span className="range-label"><span>{label}</span><b>{display}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

async function compressPhoto(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const loadedImage = new Image();
      loadedImage.onload = () => resolve(loadedImage);
      loadedImage.onerror = () => reject(new Error("Не удалось открыть это изображение"));
      loadedImage.src = objectUrl;
    });

    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(1, 1200 / longestSide);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Браузер не смог обработать изображение");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function makeNewStudent(students: Array<Student | null>, index: number): Student {
  const studentNumber = makeStudentId(students);
  const suffix = studentNumber.split("-").pop() ?? "00000";
  return {
    id: `student-${Date.now()}-${index}`,
    fullName: "НАВ ДОНИШҶӮ",
    studentId: studentNumber,
    specialty: "кори ҳамширагӣ",
    studyYears: "2025–2029",
    expires: "01/07/2029",
    login: `gr${suffix}`,
    password: "Student1#",
    photo: "",
    photoX: 50,
    photoY: 50,
    photoZoom: 1,
  };
}

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>(createInitialWorkspace);
  const [side, setSide] = useState<Side>("front");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState<number>(1);
  const [printSide, setPrintSide] = useState<Side | null>(null);
  const [dialog, setDialog] = useState<"clear" | "remove" | null>(null);
  const [toast, setToast] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">("saved");
  const photoInput = useRef<HTMLInputElement | null>(null);

  const slots: Array<Student | null> = Array.from({ length: MAX_BADGES }, (_, index) => workspace.students[index] ?? null);
  const students = slots.filter((student): student is Student => student !== null);
  const selected = students.find((student) => student.id === workspace.selectedId) ?? null;
  const selectedIndex = slots.findIndex((student) => student?.id === selected?.id);

  useEffect(() => {
    setSaveStatus("saving");
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [workspace]);

  useEffect(() => {
    const afterPrint = () => setPrintSide(null);
    window.addEventListener("afterprint", afterPrint);
    return () => window.removeEventListener("afterprint", afterPrint);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateStudent = <K extends StudentField>(id: string, field: K, value: Student[K]) => {
    setWorkspace((current) => ({
      ...current,
      students: current.students.map((student) => student?.id === id ? { ...student, [field]: value } : student),
    }));
  };

  const updateSelected = <K extends StudentField>(field: K, value: Student[K]) => {
    if (selected) updateStudent(selected.id, field, value);
  };

  const addStudent = (preferredIndex?: number) => {
    if (students.length >= MAX_BADGES) {
      setToast(`На одном листе помещается не больше ${MAX_BADGES} бейджей.`);
      return;
    }
    const availableIndex = preferredIndex !== undefined && !slots[preferredIndex]
      ? preferredIndex
      : slots.findIndex((student) => student === null);
    if (availableIndex < 0) return;

    // First student is always the official DEMO_STUDENT; subsequent students are clean empty cards
    const newStudent = students.length === 0 && availableIndex === 0
      ? { ...DEMO_STUDENT, id: `student-${Date.now()}-0` }
      : makeNewStudent(slots, availableIndex);

    setWorkspace((current) => {
      const next = Array.from({ length: MAX_BADGES }, (_, index) => current.students[index] ?? null);
      next[availableIndex] = newStudent;
      return { students: next, selectedId: newStudent.id };
    });
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    const selectedId = selected?.id;
    const input = event.currentTarget;
    if (!file || !selectedId) return;
    try {
      const photo = await compressPhoto(file);
      updateStudent(selectedId, "photo", photo);
      setToast("Фото заменено и сохранено на этом компьютере.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Не удалось загрузить фото.");
    } finally {
      input.value = "";
    }
  };

  const handlePrint = (requestedSide: Side) => {
    if (students.length === 0) {
      setToast("Добавьте хотя бы одного студента перед печатью.");
      return;
    }
    setPrintSide(requestedSide);
    window.requestAnimationFrame(() => window.setTimeout(() => window.print(), 80));
  };

  const fillDemoStudents = () => {
    const filled = TAJIK_DEMO_STUDENTS.map((item, idx) => ({
      ...item,
      id: `student-${Date.now()}-${idx}`,
    }));
    setWorkspace({
      students: filled,
      selectedId: filled[0].id,
    });
    setToast("Варақ бо 8 донишҷӯи тиббӣ (4 духтар ва 4 писар) пур карда шуд!");
  };

  const confirmDialog = () => {
    if (dialog === "clear") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // The visible workspace is still cleared if storage is blocked.
      }
      setWorkspace({ students: [DEMO_STUDENT], selectedId: DEMO_STUDENT.id });
      setToast("Лист сброшен: первый бейдж — демонстрационный студент.");
    } else if (dialog === "remove" && selected) {
      const nextSlots = [...slots];
      nextSlots[selectedIndex] = null;
      const nextSelected = nextSlots.find((student): student is Student => student !== null) ?? null;
      setWorkspace({ students: nextSlots, selectedId: nextSelected?.id ?? null });
      setToast("Бейдж удалён.");
    }
    setDialog(null);
  };

  return (
    <>
      <div className="app-shell" id="app-shell">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none"><rect x="5" y="7" width="22" height="18" rx="3" stroke="currentColor" strokeWidth="1.7" /><path d="M5 12h22M10 7v5M22 7v5M10 17h6M10 21h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </div>
            <div className="brand-copy"><strong>Бейдж-мастер</strong><span>Колледж медицины · Темурмалик</span></div>
          </div>
          <div className={`save-indicator ${saveStatus}`} aria-live="polite">
            <span className="save-dot">{saveStatus === "saved" ? <Icon name="check" size={11} /> : null}</span>
            <span>{saveStatus === "saving" ? "Сохранение…" : saveStatus === "error" ? "Не удалось сохранить" : "Сохранено на устройстве"}</span>
          </div>
          <div className="top-actions">
            <button className="clear-button" type="button" disabled={students.length === 0} onClick={() => setDialog("clear")}><Icon name="trash" size={15} /><span>Очистить</span></button>
            <button className="add-button" type="button" disabled={students.length >= MAX_BADGES} onClick={() => addStudent()}><Icon name="plus" size={16} /><span>Добавить студента</span></button>
          </div>
        </header>

        <main className="workspace-layout">
          <aside className="left-sidebar" aria-label="Панели функсияҳо">
            <div className="left-sidebar-header">
              <div className="sidebar-brand-title">
                <span className="sidebar-icon"><Icon name="layout" size={16} /></span>
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
                  onClick={fillDemoStudents}
                >
                  <Icon name="plus" size={14} />
                  <span>Пур кардани 8 донишҷӯ</span>
                </button>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-title">
                <span>РӮЙХАТИ БЕЙДЖҲО</span>
                <span className="slot-badge">{students.length} / 8</span>
              </div>
              <div className="slot-nav-list">
                {Array.from({ length: MAX_BADGES }, (_, idx) => {
                  const item = slots[idx];
                  const isCurSelected = selected?.id === item?.id;
                  return (
                    <button
                      key={`nav-slot-${idx}`}
                      type="button"
                      className={`slot-nav-item ${isCurSelected ? "selected" : ""} ${item ? "filled" : "empty"}`}
                      onClick={() => {
                        if (item) {
                          setWorkspace((curr) => ({ ...curr, selectedId: item.id }));
                        } else {
                          addStudent(idx);
                        }
                      }}
                    >
                      <span className="slot-nav-num">{String(idx + 1).padStart(2, "0")}</span>
                      {item ? (
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
                      ) : (
                        <span className="slot-nav-empty">+ Ҷойи холӣ</span>
                      )}
                    </button>
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
          <section className="canvas-panel" aria-label="Рабочий лист">
            <div className="canvas-toolbar">
              <div className="canvas-heading">
                <div className="canvas-heading-title"><span className="eyebrow">РАБОЧАЯ ОБЛАСТЬ</span><h1>Лист бейджей</h1></div>
                <div className="sheet-spec">
                  <span>A4</span><i />210 × 297 мм (2×4)<i />96 × 67 мм
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
                      setFlippedCards({});
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
                      setFlippedCards({});
                    }}
                  >
                    Оборот
                  </button>
                </div>

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

                <div className="print-buttons">
                  <button type="button" className="print-button primary" disabled={students.length === 0} onClick={() => handlePrint("front")}><Icon name="print" size={15} /><span>Печать лица</span></button>
                  <button type="button" className="print-button secondary" disabled={students.length === 0} onClick={() => handlePrint("back")}><Icon name="print" size={15} /><span>Печать оборота</span></button>
                </div>
              </div>
            </div>

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
                          onClick={() => setWorkspace((current) => ({ ...current, selectedId: student.id }))}
                          onKeyDown={(event) => {
                            if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
                              event.preventDefault();
                              setWorkspace((current) => ({ ...current, selectedId: student.id }));
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
                                update={(field, value) => updateStudent(student.id, field, value)}
                                onUploadPhoto={() => {
                                  setWorkspace((current) => ({ ...current, selectedId: student.id }));
                                  photoInput.current?.click();
                                }}
                              />
                            </div>
                            <div className="badge-face back-face">
                              <BadgeArtwork
                                student={student}
                                side="back"
                                update={(field, value) => updateStudent(student.id, field, value)}
                                onUploadPhoto={() => {
                                  setWorkspace((current) => ({ ...current, selectedId: student.id }));
                                  photoInput.current?.click();
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
                              setFlippedCards((prev) => ({
                                ...prev,
                                [student.id]: !prev[student.id],
                              }));
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
                          onClick={() => addStudent(slotIndex)}
                          aria-label={`Добавить студента в место ${slotIndex + 1}`}
                        >
                          <span className="empty-slot-count">{String(slotIndex + 1).padStart(2, "0")}</span>
                          <span className="empty-slot-plus"><Icon name="plus" size={17} /></span>
                          <span className="empty-slot-label">Добавить</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="canvas-footer">
              <span className="sheet-count"><b>{students.length}</b> из {MAX_BADGES} бейджей</span>
              <span className="duplex-note"><span className="note-mark" />Оборот автоматически зеркалится для совмещения на просвет</span>
            </div>
          </section>

          <aside className="inspector" aria-label="Редактор выбранного бейджа">
            {selected ? (
              <>
                <div className="inspector-heading">
                  <div><span className="eyebrow">БЕЙДЖ {String(selectedIndex + 1).padStart(2, "0")} / 08</span><h2>Данные студента</h2></div>
                  <span className="selected-mark"><Icon name="check" size={13} /></span>
                </div>
                <div className="inline-edit-hint"><span className="hint-cursor">T</span>Текст на макете тоже можно редактировать кликом</div>

                <div className="form-section">
                  <div className="section-heading"><span>ЛИЦЕВАЯ СТОРОНА</span><i /></div>
                  <TextField label="ФИО студента" value={selected.fullName} placeholder="Имя и фамилия" onChange={(value) => updateSelected("fullName", value)} />
                  <div className="form-row">
                    <TextField label="Номер" value={selected.studentId} placeholder="2-000000" mono onChange={(value) => updateSelected("studentId", value)} />
                    <TextField label="Годы обучения" value={selected.studyYears} placeholder="2024–2028" onChange={(value) => updateSelected("studyYears", value)} />
                  </div>
                  <TextField label="Специальность" value={selected.specialty} placeholder="Направление" onChange={(value) => updateSelected("specialty", value)} />
                </div>

                <div className="form-section photo-section">
                  <div className="section-heading"><span>ФОТОГРАФИЯ</span><i /></div>
                  <div className="photo-upload-row">
                    <div className="photo-thumb">
                      {selected.photo ? <img src={selected.photo} alt="Фото студента" /> : <Icon name="image" size={18} />}
                    </div>
                    <div className="photo-upload-copy">
                      <button className="upload-button" type="button" onClick={() => photoInput.current?.click()}><Icon name="image" size={14} />Заменить фото</button>
                      <span>Двойной клик на фото или перетаскивание мышью прямо на карточке</span>
                    </div>
                    {selected.photo && <button className="remove-photo" type="button" aria-label="Удалить фото" title="Удалить фото" onClick={() => updateSelected("photo", "")}><Icon name="close" size={14} /></button>}
                  </div>
                  <input ref={photoInput} className="file-input" type="file" accept="image/*" onChange={handlePhotoChange} />
                  <div className="photo-ranges">
                    <RangeField label="Масштаб (Zoom)" value={selected.photoZoom} min={1} max={2.5} step={0.01} display={`${selected.photoZoom.toFixed(2)}×`} onChange={(value) => updateSelected("photoZoom", value)} />
                    <RangeField label="Смещение X (Горизонталь)" value={selected.photoX} min={0} max={100} step={1} display={`${selected.photoX}%`} onChange={(value) => updateSelected("photoX", value)} />
                    <RangeField label="Смещение Y (Вертикаль)" value={selected.photoY} min={0} max={100} step={1} display={`${selected.photoY}%`} onChange={(value) => updateSelected("photoY", value)} />
                  </div>
                </div>

                <div className="form-section reverse-section">
                  <div className="section-heading"><span>ОБОРОТНАЯ СТОРОНА</span><i /></div>
                  <TextField label="Действителен до" value={selected.expires} placeholder="ДД/ММ/ГГГГ" onChange={(value) => updateSelected("expires", value)} />
                  <div className="form-row">
                    <TextField label="Логин" value={selected.login} placeholder="Логин" mono onChange={(value) => updateSelected("login", value)} />
                    <TextField label="Пароль" value={selected.password} placeholder="Пароль" mono onChange={(value) => updateSelected("password", value)} />
                  </div>
                </div>

                <button className="delete-student" type="button" onClick={() => setDialog("remove")}><Icon name="trash" size={14} />Удалить этот бейдж</button>
              </>
            ) : (
              <div className="inspector-empty">
                <div className="empty-icon"><Icon name="image" size={22} /></div>
                <span className="eyebrow">ЛОКАЛЬНЫЙ ПРОЕКТ</span>
                <h2>Рабочий лист пуст</h2>
                <p>Добавьте студента, чтобы заполнить бейдж и подготовить обе стороны к печати.</p>
                <button className="add-button" type="button" onClick={() => addStudent()}><Icon name="plus" size={16} />Добавить студента</button>
              </div>
            )}
          </aside>
        </main>
      </div>

      {printSide && (
        <div id="print-root" data-side={printSide}>
          <div className="print-page">
            <div className="print-grid">
              {Array.from({ length: MAX_BADGES }, (_, visualIndex) => {
                const { student } = slotForPrint(slots, printSide, visualIndex);
                return (
                  <div className={`print-slot ${student ? "filled" : "empty"}`} key={`print-${visualIndex}`}>
                    {student && <BadgeArtwork student={student} side={printSide} update={(field, value) => updateStudent(student.id, field, value)} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {dialog && (
        <div className="dialog-scrim" onMouseDown={() => setDialog(null)}>
          <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="dialog-icon"><Icon name="warning" size={19} /></div>
            <button className="dialog-close" type="button" aria-label="Закрыть" onClick={() => setDialog(null)}><Icon name="close" size={16} /></button>
            <span className="eyebrow">ПОДТВЕРЖДЕНИЕ</span>
            <h2 id="dialog-title">{dialog === "clear" ? "Очистить весь лист?" : "Удалить этот бейдж?"}</h2>
            <p>{dialog === "clear" ? "Все студенты и фотографии будут удалены из локального хранилища этого браузера." : "Данные этого студента будут удалены. Остальные бейджи останутся на листе."}</p>
            <div className="dialog-actions">
              <button className="dialog-cancel" type="button" onClick={() => setDialog(null)}>Отмена</button>
              <button className="dialog-confirm" type="button" onClick={confirmDialog}>Удалить данные</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast-message" role="status">{toast}</div>}
    </>
  );
}