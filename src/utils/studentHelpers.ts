import { MAX_BADGES, STORAGE_KEY } from "../constants/rules";
import { DEMO_STUDENT } from "../data/demoStudents";
import type { Side, Student, Workspace } from "../types/badge";

export function normalizeStudent(value: unknown): Student | null {
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
    photoBrightness: typeof source.photoBrightness === "number" ? source.photoBrightness : 100,
    photoContrast: typeof source.photoContrast === "number" ? source.photoContrast : 100,
    photoSaturation: typeof source.photoSaturation === "number" ? source.photoSaturation : 100,
    photoWarmth: typeof source.photoWarmth === "number" ? source.photoWarmth : 0,
  };
}

export function createInitialWorkspace(): Workspace {
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
    // Local storage fallback
  }

  return { students: [DEMO_STUDENT], selectedId: DEMO_STUDENT.id };
}

export function slotForPrint(slots: Array<Student | null>, side: Side, visualIndex: number) {
  const physicalIndex = side === "front"
    ? visualIndex
    : visualIndex % 2 === 0
      ? visualIndex + 1
      : visualIndex - 1;
  return { physicalIndex, student: slots[physicalIndex] ?? null };
}

export function makeStudentId(students: Array<Student | null>) {
  const lastNumber = students.reduce((highest, student) => {
    const suffix = Number(student?.studentId.split("-").pop());
    return Number.isFinite(suffix) ? Math.max(highest, suffix) : highest;
  }, 790105);
  return `2-${lastNumber + 1}`;
}

export function makeNewStudent(_students: Array<Student | null>, index: number): Student {
  return {
    id: `student-${Date.now()}-${index}`,
    fullName: "НАВ ДОНИШҶӮ",
    studentId: "2-790106",
    specialty: "кори ҳамширагӣ",
    studyYears: "2024–2028",
    expires: "01/07/2028",
    login: "gr790106",
    password: "Student1#",
    photo: "",
    photoX: 50,
    photoY: 50,
    photoZoom: 1,
    photoBrightness: 100,
    photoContrast: 100,
    photoSaturation: 100,
    photoWarmth: 0,
  };
}

export async function compressPhoto(file: File): Promise<string> {
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
