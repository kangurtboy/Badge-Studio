import { SECURITY_RULES } from "../../constants/rules";
import type { Student, StudentField } from "../../types/badge";

export function BadgeSecurityBack({
  student,
  update,
}: {
  student: Student;
  update: <K extends StudentField>(field: K, value: Student[K]) => void;
}) {
  return (
    <div className="badge-artwork badge-back badge-security-back">
      {/* 1. Header: Service identification (Figma 36:79 — No EXP badge!) */}
      <div className="security-back-header">
        <div className="security-back-titles">
          <strong>ШАҲОДАТНОМАИ ХИЗМАТӢ</strong>
          <span className="security-back-subtitle">SECURITY IDENTIFICATION CARD</span>
        </div>
      </div>

      {/* 2. Brass separator (Figma 36:183 — #d5b778, 2px) */}
      <div className="security-brass-divider" />

      {/* 3. Campus Regulations / Terms of Use (Figma 36:184) */}
      <div className="security-rules-box">
        <div className="security-rules-heading">ТАРТИБИ ИСТИФОДА</div>
        <div className="security-rules-list">
          <div className="security-rule-row">
            <span className="security-rule-num">01</span>
            <span className="security-rule-text">Ҳуҷҷати расмии корманди муҳофизи коллеҷ.</span>
          </div>
          <div className="security-rule-row">
            <span className="security-rule-num">02</span>
            <span className="security-rule-text">Ҳангоми адои вазифа бо худ доштан ҳатмист.</span>
          </div>
          <div className="security-rule-row">
            <span className="security-rule-num">03</span>
            <span className="security-rule-text">
              Ба дигарон додан манъ аст. Ҳангоми гум шудан
              <br />
              ба маъмурияти коллеҷ хабар диҳед.
            </span>
          </div>
        </div>
      </div>

      {/* 4. Service Band (Figma 36:191) */}
      <div className="security-band-wrapper">
        <div className="security-band-line" />
        <div className="security-band-content">
          <span className="security-band-left">ҲИФОЗАТ  /  SECURITY</span>
          <span className="security-band-right">КОРТИ ШАХСӢ</span>
        </div>
      </div>

      {/* 5. College Address & QR (Figma 36:117 — Solid White panel with figma QR SVG!) */}
      <div className="security-address-panel">
        <div className="security-address-copy">
          <strong>Суроға:</strong>
          <span>
            ҶТ, н. Темурмалик,
            <br />
            ҷамоати Кангурт
          </span>
        </div>
        <div className="security-qr-container">
          <div className="security-dark-qr" title="QR Код">
            <img
              src="./assets/figma-security-qr.svg"
              alt="QR-код корманд"
              className="security-qr-vector"
            />
          </div>
        </div>
      </div>

      {/* 6. Bottom National Flag Trim (Figma 36:167) */}
      <div className="tajik-ribbon" />
    </div>
  );
}
