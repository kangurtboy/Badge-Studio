export type Side = "front" | "back";

export type BadgeTemplateId = "student" | "security";

export type StudentField =
  | "template"
  | "fullName"
  | "studentId"
  | "specialty"
  | "studyYears"
  | "expires"
  | "login"
  | "password"
  | "role"
  | "roleEn"
  | "cardType"
  | "photo"
  | "photoX"
  | "photoY"
  | "photoZoom"
  | "photoRotate"
  | "photoBrightness"
  | "photoContrast"
  | "photoSaturation"
  | "photoWarmth";

export type Student = {
  id: string;
  template?: BadgeTemplateId;
  fullName: string;
  studentId: string;
  specialty: string;
  studyYears: string;
  expires: string;
  login: string;
  password: string;
  role?: string;
  roleEn?: string;
  cardType?: string;
  photo: string;
  photoX: number;
  photoY: number;
  photoZoom: number;
  photoRotate?: number;
  photoBrightness?: number;
  photoContrast?: number;
  photoSaturation?: number;
  photoWarmth?: number;
};

export type Workspace = {
  students: Array<Student | null>;
  selectedId: string | null;
};

export type IconName =
  | "plus"
  | "minus"
  | "trash"
  | "rotate"
  | "print"
  | "image"
  | "check"
  | "close"
  | "warning"
  | "maximize"
  | "layout"
  | "copy"
  | "shield"
  | "user";
