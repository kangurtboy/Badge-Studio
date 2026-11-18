import type { Side, Student, StudentField } from "../../types/badge";
import { BadgeBack } from "./BadgeBack";
import { BadgeFront } from "./BadgeFront";
import { BadgeSecurityBack } from "./BadgeSecurityBack";
import { BadgeSecurityFront } from "./BadgeSecurityFront";

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
  const isSecurity = student.template === "security";

  if (side === "back") {
    if (isSecurity) {
      return <BadgeSecurityBack student={student} update={update} />;
    }
    return <BadgeBack student={student} update={update} />;
  }

  if (isSecurity) {
    return (
      <BadgeSecurityFront
        student={student}
        update={update}
        onUploadPhoto={onUploadPhoto}
      />
    );
  }

  return (
    <BadgeFront
      student={student}
      update={update}
      onUploadPhoto={onUploadPhoto}
    />
  );
}
