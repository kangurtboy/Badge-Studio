import { RULES } from "../../constants/rules";
import type { Student, StudentField } from "../../types/badge";
import { EditableText } from "../UI/EditableText";
import { Barcode } from "./Barcode";
import { QrMark } from "./QrMark";

export function BadgeBack({
  student,
  update,
}: {
  student: Student;
  update: <K extends StudentField>(field: K, value: Student[K]) => void;
}) {
  return (
    <div className="badge-artwork badge-back">
      <div className="back-heading">
        <div className="back-title-group">
          <strong>ШАҲОДАТНОМАИ ДОНИШҶӮӢ</strong>
          <span className="back-subtitle">STUDENT IDENTIFICATION CARD</span>
        </div>
        <div className="expiry-tag">
          <span>EXP:</span>
          <EditableText
            value={student.expires}
            label="Срок действия"
            placeholder="ДД/ММ/ГГГГ"
            onChange={(value) => update("expires", value)}
          />
        </div>
      </div>

      <div className="badge-rules">
        {RULES.map((rule, index) => (
          <div className="badge-rule" key={rule}>
            <b>{index + 1}.</b>
            <span>{rule}</span>
          </div>
        ))}
      </div>

      <div className="credentials-panel">
        <div className="credentials-heading">
          <span className="green-dot" />
          СИСТЕМАИ ТЕСТӢ
        </div>
        <div className="credential-row">
          <div className="credential-chip">
            <span>ЛОГИН:</span>
            <EditableText
              value={student.login}
              label="Логин"
              placeholder="Логин"
              className="mono-edit"
              onChange={(value) => update("login", value)}
            />
          </div>
          <div className="credential-chip">
            <span>ПАРОЛ:</span>
            <EditableText
              value={student.password}
              label="Пароль"
              placeholder="Пароль"
              className="mono-edit"
              onChange={(value) => update("password", value)}
            />
          </div>
        </div>
      </div>

      <div className="back-footer">
        <div className="barcode-block">
          <Barcode value={student.studentId} />
          <EditableText
            value={student.studentId}
            label="Рақами донишҷӯӣ"
            placeholder="Рақами донишҷӯӣ"
            className="barcode-number mono-edit"
            onChange={(value) => update("studentId", value)}
          />
        </div>
        <div className="address-block">
          <div className="qr-box">
            <QrMark value={student.studentId} />
          </div>
          <div>
            <b>Суроға:</b>
            <span>
              ҶТ, н. Темурмалик,
              <br />
              ҷамоати Кангурт
            </span>
          </div>
        </div>
      </div>

      <div className="tajik-ribbon" />
    </div>
  );
}
