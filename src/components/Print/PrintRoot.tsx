import { MAX_BADGES } from "../../constants/rules";
import type { Side, Student, StudentField } from "../../types/badge";
import { slotForPrint } from "../../utils/studentHelpers";
import { BadgeArtwork } from "../BadgeCard/BadgeArtwork";

export function PrintRoot({
  side,
  slots,
  onUpdateStudent,
}: {
  side: Side;
  slots: Array<Student | null>;
  onUpdateStudent: <K extends StudentField>(id: string, field: K, value: Student[K]) => void;
}) {
  return (
    <div id="print-root" data-side={side}>
      <div className="print-page">
        <div className="print-grid">
          {Array.from({ length: MAX_BADGES }, (_, visualIndex) => {
            const { student } = slotForPrint(slots, side, visualIndex);
            return (
              <div
                className={`print-slot ${student ? "filled" : "empty"}`}
                key={`print-${visualIndex}`}
              >
                {student && (
                  <>
                    <span className="print-cut-corner tl" aria-hidden="true" />
                    <span className="print-cut-corner tr" aria-hidden="true" />
                    <span className="print-cut-corner bl" aria-hidden="true" />
                    <span className="print-cut-corner br" aria-hidden="true" />
                    <BadgeArtwork
                      student={student}
                      side={side}
                      update={(field, value) => onUpdateStudent(student.id, field, value)}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
