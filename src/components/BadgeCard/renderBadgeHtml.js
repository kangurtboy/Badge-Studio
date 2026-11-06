// Reusable pixel-perfect Stitch badge HTML renderer
// Used identically across: BadgeEditor, A4Editor, and Print Engine

export function renderBadgeFrontHtml(data = {}, options = {}) {
  const {
    isEditable = false,
    scale = 1,
    style = '',
  } = options;

  const t1 = data.title1 || 'КОЛЛЕҶИ ТИББИИ';
  const t2 = data.title2 || 'ДОНИШГОҲИ ДАВЛАТИИ ТИББИИ ХАТЛОН';
  const t3 = data.title3 || 'ДАР НОҲИЯИ ТЕМУРМАЛИК';
  const idNum = data.idNumber || data.studentId || '2-790106';
  const name1 = data.nameLine1 || (data.name ? data.name.split(' ')[0] : 'РАҲИМОВА');
  const name2 = data.nameLine2 || (data.name ? data.name.split(' ').slice(1).join(' ') : 'НИГИНА РУСТАМОВНА');
  const spec = data.specialty || 'кори ҳамширагӣ';
  const cohort = data.cohort || '2024–2028';
  const director = data.directorName || 'Сафарзода З.И.';
  const photo = data.photoSrc || '/assets/student-nigina.jpg';
  const emblemTajik = data.emblemTajikistan || '/assets/gerb-tajikistan-clean.png';
  const emblemMed = data.emblemMedical || '/assets/medical-emblem-clean.png';

  const editableAttr = (field) => isEditable ? `contenteditable="true" data-field="${field}"` : '';

  return `
    <div class="card-face card-face-front" style="width: 440px; height: 278px; border-radius: 15px; overflow: hidden; background-color: #FFFFFF; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; ${style}">
      
      <!-- Top Header: Emblems and 3-line Title -->
      <div style="position: relative; z-index: 10; padding: 8px 16px 4px 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid #F1F5F9;">
        <div style="width: 44px; height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img src="${emblemTajik}" alt="Герби Тоҷикистон" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>

        <div style="flex: 1; text-align: center; padding: 0 4px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div ${editableAttr('title1')} style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; line-height: 1.2;">
            ${t1}
          </div>
          <div ${editableAttr('title2')} style="font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; color: #0F172A; line-height: 1.2; margin-top: 1px;">
            ${t2}
          </div>
          <div ${editableAttr('title3')} style="font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #082F49; line-height: 1.2; margin-top: 1px;">
            ${t3}
          </div>
        </div>

        <div style="width: 44px; height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img src="${emblemMed}" alt="Эмблемаи тиббӣ" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      </div>

      <!-- Main Body: Student Photo + Information -->
      <div style="position: relative; z-index: 10; padding: 4px 16px; display: flex; align-items: center; gap: 14px; flex: 1;">
        <!-- Student Photo Box -->
        <div class="student-photo-container" style="width: 102px; height: 132px; flex-shrink: 0; border-radius: 6px; overflow: hidden; border: 1px solid #CBD5E1; box-shadow: 0 1px 3px rgba(0,0,0,0.1); background-color: #F8FAFC; position: relative;">
          <img src="${photo}" alt="Акси донишҷӯ" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          ${
            isEditable
              ? `
            <div id="badge-photo-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 600; cursor: pointer;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
              <span>Изменить</span>
            </div>
          `
              : ''
          }
        </div>

        <!-- Right Column Details -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px;">
          <!-- ID Badge Pill (Dark Navy) -->
          <div style="display: inline-flex; align-items: center; align-self: flex-start; background-color: #082F49; color: #FFFFFF; font-family: 'JetBrains Mono', monospace; padding: 3px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em;">
            <span ${editableAttr('idNumber')}>${idNum}</span>
          </div>

          <!-- Student Full Name (2 lines, UPPERCASE, Extra Bold) -->
          <div>
            <h3 style="font-size: 15px; font-weight: 900; letter-spacing: -0.01em; color: #0F172A; text-transform: uppercase; line-height: 1.15; margin: 0;">
              <span ${editableAttr('nameLine1')}>${name1}</span><br/>
              <span ${editableAttr('nameLine2')}>${name2}</span>
            </h3>
          </div>

          <!-- Specialty and Academic Cohort -->
          <div style="font-size: 10px; line-height: 1.3; color: #334155; margin-top: 2px;">
            <p style="font-size: 10.5px; font-weight: 700; color: #082F49; margin: 0; display: flex; align-items: center; gap: 4px;">
              <span style="color: #64748B; font-weight: 400;">Ихтисос:</span>
              <span ${editableAttr('specialty')}>${spec}</span>
            </p>
            <p style="font-size: 10px; font-weight: 500; color: #475569; margin: 2px 0 0 0; display: flex; align-items: center; gap: 5px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #059669; display: inline-block; flex-shrink: 0;"></span>
              <span>Соли таҳсил: <strong ${editableAttr('cohort')}>${cohort}</strong></span>
            </p>
          </div>
        </div>
      </div>

      <!-- Footer: Director Authorization -->
      <div style="position: relative; z-index: 10; padding: 6px 16px; background-color: rgba(248, 250, 252, 0.95); border-top: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="font-weight: 700; color: #334155; font-size: 9.5px;">Директор:</span>
          <div style="position: relative; display: flex; align-items: center; gap: 6px;">
            <svg style="width: 80px; height: 24px; color: #1E40AF; opacity: 0.9;" fill="none" stroke="currentColor" viewBox="0 0 120 40">
              <path d="M5 25 C 20 5, 25 35, 38 18 C 45 7, 50 30, 65 15 C 75 5, 80 32, 95 20 C 105 12, 110 25, 118 10" stroke-linecap="round" stroke-width="2.2"></path>
              <path d="M15 28 L 70 24" stroke-linecap="round" stroke-width="1.3"></path>
            </svg>
            <span ${editableAttr('directorName')} style="font-weight: 700; color: #0F172A; font-size: 9.5px; letter-spacing: 0.02em;">
              ${director}
            </span>
          </div>
        </div>
      </div>

      <!-- Corner Crop Marks for card edges -->
      <div style="position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
    </div>
  `;
}

export function renderBadgeBackHtml(data = {}, options = {}) {
  const {
    isEditable = false,
    scale = 1,
    style = '',
  } = options;

  const backTitle = data.backTitle || 'ШАҲОДАТНОМАИ ДОНИШҶӮӢ (STUDENT ID CARD)';
  const validity = data.validity || 'EXP: 01/07/2028';
  const r1 = data.rule1 || '1. Ин шаҳодатнома ҳуҷҷати расмии донишҷӯи Коллеҷи тиббии ДДТХ дар н. Темурмалик мебошад.';
  const r2 = data.rule2 || '2. Ҳангоми ворид шудан ба бинои коллеҷ, беморхонаҳои клиникӣ ва китобхона пешниҳоди он ҳатмист.';
  const r3 = data.rule3 || '3. Ба дигар шахсон додани шаҳодатнома қатъиян манъ аст. Ҳангоми гум шудан ба деканат муроҷиат намоед.';
  const login = data.moodleLogin || 'gr26111';
  const pass = data.moodlePass || 'Student1#';
  const barcode = data.barcodeNumber || data.studentId || '2-790106';
  const addr1 = data.addressLine1 || 'ҶТ, вилояти Хатлон,';
  const addr2 = data.addressLine2 || 'ноҳияи Темурмалик,';
  const addr3 = data.addressLine3 || 'ҷ.д Кангурт';

  const editableAttr = (field) => isEditable ? `contenteditable="true" data-field="${field}"` : '';

  return `
    <div class="card-face card-face-back" style="width: 440px; height: 278px; border-radius: 15px; overflow: hidden; background-color: #FFFFFF; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; ${style}">
      
      <!-- Back Header: Title & Validity -->
      <div style="position: relative; z-index: 10; padding: 10px 16px 6px 16px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between;">
        <span ${editableAttr('backTitle')} style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A;">
          ${backTitle}
        </span>
        <span style="font-size: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #065F46; background-color: #ECFDF5; padding: 2px 8px; border-radius: 4px; border: 1px solid #A7F3D0;">
          <span ${editableAttr('validity')}>${validity}</span>
        </span>
      </div>

      <!-- Campus Regulations (3 Points) -->
      <div style="position: relative; z-index: 10; padding: 4px 16px; font-size: 8px; color: #475569; display: flex; flex-direction: column; gap: 4px; line-height: 1.35;">
        <div style="display: flex; align-items: flex-start; gap: 6px;">
          <span style="font-weight: 700; color: #0284C7; flex-shrink: 0;">1.</span>
          <span ${editableAttr('rule1')}>${r1}</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 6px;">
          <span style="font-weight: 700; color: #0284C7; flex-shrink: 0;">2.</span>
          <span ${editableAttr('rule2')}>${r2}</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 6px;">
          <span style="font-weight: 700; color: #0284C7; flex-shrink: 0;">3.</span>
          <span ${editableAttr('rule3')}>${r3}</span>
        </div>
      </div>

      <!-- Moodle Login Box -->
      <div style="position: relative; z-index: 10; margin: 0 16px; padding: 6px 10px; background-color: #F8FAFC; border-radius: 6px; border: 1px solid #CBD5E1; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #059669; display: inline-block;"></span>
          <span style="font-size: 7.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #082F49;">СИСТЕМАИ ТЕСТӢ / MOODLE</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 8.5px; font-family: 'JetBrains Mono', monospace;">
          <div style="background: #FFFFFF; padding: 2px 8px; border-radius: 4px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 4px;">
            <span style="color: #64748B; font-size: 7px; text-transform: uppercase; font-family: 'Inter', sans-serif; font-weight: 600;">Логин:</span>
            <strong ${editableAttr('moodleLogin')} style="color: #0F172A;">${login}</strong>
          </div>
          <div style="background: #FFFFFF; padding: 2px 8px; border-radius: 4px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 4px;">
            <span style="color: #64748B; font-size: 7px; text-transform: uppercase; font-family: 'Inter', sans-serif; font-weight: 600;">Парол:</span>
            <strong ${editableAttr('moodlePass')} style="color: #082F49;">${pass}</strong>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Barcode, QR Code & Address -->
      <div style="position: relative; z-index: 10; padding: 8px 16px; border-top: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #FFFFFF;">
        <!-- Barcode Simulation -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start;">
          <div style="height: 30px; width: 175px; display: flex; align-items: stretch; gap: 1.5px; background: #FFFFFF;">
            <div style="width: 2.5px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 3.5px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
            <div style="width: 1.5px; background: #000;"></div><div style="width: 2.5px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div>
            <div style="width: 1.5px; background: #fff;"></div><div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 1.5px; background: #000;"></div>
            <div style="width: 3.5px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 1px; background: #000;"></div><div style="width: 2px; background: #000;"></div>
            <div style="width: 1.5px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 2px; background: #000;"></div>
            <div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 1.5px; background: #000;"></div>
            <div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
            <div style="width: 2px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
            <div style="width: 1px; background: #000;"></div><div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 2px; background: #000;"></div>
          </div>
          <span ${editableAttr('barcodeNumber')} style="font-size: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 700; letter-spacing: 0.1em; color: #1E293B; margin-top: 2px;">
            ${barcode}
          </span>
        </div>

        <!-- QR Code & Address -->
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <div style="width: 36px; height: 36px; background-color: #0F172A; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 100%; height: 100%; color: #FFFFFF;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-4 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-2-4h2v2h-2v-2z"></path>
            </svg>
          </div>
          <div style="font-size: 7.5px; color: #475569; line-height: 1.25;">
            <span style="font-weight: 700; color: #0F172A; display: block;">Суроға:</span>
            <span ${editableAttr('addressLine1')}>${addr1}</span><br/>
            <span ${editableAttr('addressLine2')}>${addr2}</span><br/>
            <strong ${editableAttr('addressLine3')} style="color: #082F49;">${addr3}</strong>
          </div>
        </div>
      </div>

      <!-- Bottom National Flag Trim (4px) -->
      <div class="tajik-ribbon-bar"></div>

      <!-- Corner Crop Marks for card edges -->
      <div style="position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
    </div>
  `;
}
