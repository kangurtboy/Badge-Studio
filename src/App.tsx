import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { CanvasToolbar } from "./components/Canvas/CanvasToolbar";
import { SheetStage } from "./components/Canvas/SheetStage";
import { Topbar } from "./components/Header/Topbar";
import { Inspector } from "./components/Inspector/Inspector";
import { LeftSidebar } from "./components/LeftSidebar/LeftSidebar";
import { ConfirmDialog } from "./components/Modals/ConfirmDialog";
import { PrintRoot } from "./components/Print/PrintRoot";
import { MAX_BADGES, STORAGE_KEY } from "./constants/rules";
import { DEMO_STUDENT, TAJIK_DEMO_STUDENTS } from "./data/demoStudents";
import type { Side, Student, StudentField, Workspace } from "./types/badge";
import {
  compressPhoto,
  createInitialWorkspace,
  makeNewStudent,
  makeStudentId,
} from "./utils/studentHelpers";

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

  const slots: Array<Student | null> = Array.from(
    { length: MAX_BADGES },
    (_, index) => workspace.students[index] ?? null
  );
  const students = slots.filter((student): student is Student => student !== null);
  const selected = students.find((student) => student.id === workspace.selectedId) ?? null;
  const selectedIndex = slots.findIndex((student) => student?.id === selected?.id);

  // Auto-save to localStorage
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

  // Clean print state on dialog finish
  useEffect(() => {
    const afterPrint = () => setPrintSide(null);
    window.addEventListener("afterprint", afterPrint);
    return () => window.removeEventListener("afterprint", afterPrint);
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateStudent = <K extends StudentField>(id: string, field: K, value: Student[K]) => {
    setWorkspace((current) => ({
      ...current,
      students: current.students.map((student) =>
        student?.id === id ? { ...student, [field]: value } : student
      ),
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
    const availableIndex =
      preferredIndex !== undefined && !slots[preferredIndex]
        ? preferredIndex
        : slots.findIndex((student) => student === null);
    if (availableIndex < 0) return;

    // First student is always the official DEMO_STUDENT; subsequent students are clean empty cards
    const newStudent =
      students.length === 0 && availableIndex === 0
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

  const duplicateStudent = (id: string) => {
    if (students.length >= MAX_BADGES) {
      setToast(`На одном листе помещается не больше ${MAX_BADGES} бейджей.`);
      return;
    }
    const sourceStudent = students.find((s) => s.id === id);
    if (!sourceStudent) return;

    const availableIndex = slots.findIndex((s) => s === null);
    if (availableIndex < 0) return;

    const newStudentId = makeStudentId(slots);
    const suffix = newStudentId.split("-").pop() ?? "00000";

    const duplicatedStudent: Student = {
      ...sourceStudent,
      id: `student-${Date.now()}-${availableIndex}`,
      studentId: newStudentId,
      login: `gr${suffix}`,
    };

    setWorkspace((current) => {
      const next = Array.from({ length: MAX_BADGES }, (_, index) => current.students[index] ?? null);
      next[availableIndex] = duplicatedStudent;
      return { students: next, selectedId: duplicatedStudent.id };
    });

    setToast(`Бейҷи «${sourceStudent.fullName}» нусхабардорӣ шуд.`);
  };

  const deleteStudent = (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    const targetIndex = slots.findIndex((s) => s?.id === id);
    if (targetIndex < 0) return;

    const nextSlots = [...slots];
    nextSlots[targetIndex] = null;
    const remainingStudents = nextSlots.filter((s): s is Student => s !== null);
    const nextSelectedId =
      selected?.id === id
        ? remainingStudents[0]?.id ?? null
        : selected?.id ?? null;

    setWorkspace({
      students: nextSlots,
      selectedId: nextSelectedId,
    });

    setToast(`Бейҷи «${studentToDelete?.fullName || ""}» нест карда шуд.`);
  };

  const confirmDialog = () => {
    if (dialog === "clear") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Fallback
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
        <Topbar
          saveStatus={saveStatus}
          studentsCount={students.length}
          onClear={() => setDialog("clear")}
          onAddStudent={() => addStudent()}
        />

        <main className="workspace-layout">
          <LeftSidebar
            slots={slots}
            selected={selected}
            studentsCount={students.length}
            onSelectStudent={(id) => setWorkspace((curr) => ({ ...curr, selectedId: id }))}
            onAddStudent={addStudent}
            onFillDemo={fillDemoStudents}
            onDuplicateStudent={duplicateStudent}
            onDeleteStudent={deleteStudent}
          />

          <section className="canvas-panel" aria-label="Рабочий лист">
            <CanvasToolbar
              side={side}
              setSide={setSide}
              onResetFlipped={() => setFlippedCards({})}
              zoom={zoom}
              setZoom={setZoom}
              hasStudents={students.length > 0}
              onPrint={handlePrint}
            />

            <SheetStage
              slots={slots}
              selected={selected}
              side={side}
              flippedCards={flippedCards}
              zoom={zoom}
              setZoom={setZoom}
              photoInputRef={photoInput}
              onSelectStudent={(id) => setWorkspace((curr) => ({ ...curr, selectedId: id }))}
              onAddStudent={addStudent}
              onToggleFlip={(id) =>
                setFlippedCards((prev) => ({
                  ...prev,
                  [id]: !prev[id],
                }))
              }
              onUpdateStudent={updateStudent}
            />

            <div className="canvas-footer">
              <span className="sheet-count">
                <b>{students.length}</b> из {MAX_BADGES} бейджей
              </span>
              <span className="duplex-note">
                <span className="note-mark" />
                Оборот автоматически зеркалится для совмещения на просвет
              </span>
            </div>
          </section>

          <Inspector
            selected={selected}
            selectedIndex={selectedIndex}
            photoInputRef={photoInput}
            onUpdateSelected={updateSelected}
            onPhotoChange={handlePhotoChange}
            onRequestDelete={() => setDialog("remove")}
            onAddStudent={() => addStudent()}
          />
        </main>
      </div>

      {printSide && (
        <PrintRoot
          side={printSide}
          slots={slots}
          onUpdateStudent={updateStudent}
        />
      )}

      {dialog && (
        <ConfirmDialog
          dialog={dialog}
          onClose={() => setDialog(null)}
          onConfirm={confirmDialog}
        />
      )}

      {toast && (
        <div className="toast-message" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
