export type Side = "front" | "back";

export type StudentField =
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
  | "photoZoom"
  | "photoBrightness"
  | "photoContrast"
  | "photoSaturation"
  | "photoWarmth";

export type Student = {
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
  | "copy";
