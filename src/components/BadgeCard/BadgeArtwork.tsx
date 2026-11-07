import type { Side, Student, StudentField } from "../../types/badge";
import { BadgeBack } from "./BadgeBack";
import { BadgeFront } from "./BadgeFront";

export function BadgeArtwork({
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
    return <BadgeBack student={student} update={update} />;
  }

  return (
    <BadgeFront
      student={student}
      update={update}
      onUploadPhoto={onUploadPhoto}
    />
  );
}
