// Reusable pixel-perfect Stitch badge HTML renderer
// Exactly matching updated Google Stitch screen: "Бейджик донишҷӯ (Front & Back) — Танҳо карточка"
// Standard 96 x 67 mm (480px x 335px)

export function renderBadgeFrontHtml(data = {}, options = {}) {
  const { isEditable = false, style = '' } = options;

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
    <div class="card-face card-face-front" style="width: 480px; height: 335px; border-radius: 15px; overflow: hidden; background-color: #FFFFFF; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(0,0,0,0.04); border: 1px solid rgba(203, 213, 225, 0.8); ${style}">
      
      <!-- Guilloche background layer -->
      <div class="absolute inset-0 bg-guilloche-front pointer-events-none z-0" style="position: absolute; inset: 0; pointer-events: none; z-index: 0;"></div>

      <!-- Top Header: Emblems and 3-line Title -->
      <div style="position: relative; z-index: 10; padding: 12px 20px 4px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <!-- Left Logo: State Emblem (56x56 px, transparent) -->
        <div style="width: 56px; height: 56px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img src="${emblemTajik}" alt="Герби Ҷумҳурии Тоҷикистон" style="width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply;" />
        </div>
        
        <!-- Center Title (3 lines from Stitch) -->
        <div style="flex: 1; text-align: center; padding: 0 4px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div ${editableAttr('title1')} style="font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #334155; line-height: 1.25;">
            ${t1}
          </div>
          <div ${editableAttr('title2')} style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.025em; color: #0F172A; line-height: 1.25; margin-top: 2px;">
            ${t2}
          </div>
          <div ${editableAttr('title3')} style="font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #334155; line-height: 1.25; margin-top: 2px;">
            ${t3}
          </div>
        </div>

        <!-- Right Logo: Medical Snake (56x56 px, transparent) -->
        <div style="width: 56px; height: 56px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img src="${emblemMed}" alt="Эмблемаи тиббӣ" style="width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply;" />
        </div>
      </div>

      <!-- Main Body: Student Photo + Info -->
      <div style="position: relative; z-index: 10; padding: 6px 20px; display: flex; align-items: center; gap: 16px; flex: 1;">
        <!-- Student Photo with rounded corners and border (124px x 162px from Stitch) -->
        <div class="student-photo-container" style="width: 124px; height: 162px; flex-shrink: 0; border-radius: 6px; overflow: hidden; border: 1px solid #CBD5E1; box-shadow: 0 1px 3px rgba(0,0,0,0.1); background-color: #F1F5F9; position: relative; cursor: ${isEditable ? 'pointer' : 'default'};">
          <img src="${photo}" alt="Акси донишҷӯ" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          ${
            isEditable
              ? `
            <div id="badge-photo-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 600;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
              <span>Изменить</span>
            </div>
          `
              : ''
          }
        </div>
        
        <!-- Information block -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <!-- ID Badge pill without -102 suffix -->
          <div style="display: inline-flex; align-items: center; align-self: flex-start; background-color: #082F49; color: #FFFFFF; font-family: 'JetBrains Mono', monospace; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
            <span ${editableAttr('idNumber')}>${idNum}</span>
          </div>
          
          <!-- Student Full Name (enlarged uppercase) -->
          <div>
            <h3 style="font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: #0F172A; text-transform: uppercase; line-height: 1.3; margin: 0;">
              <span ${editableAttr('nameLine1')}>${name1}</span><br/>
              <span ${editableAttr('nameLine2')}>${name2}</span>
            </h3>
          </div>
          
          <!-- Specialty and Academic Cohort -->
          <div style="font-size: 12px; line-height: 1.4; color: #1E293B; margin-top: 2px;">
            <p style="font-size: 12px; font-weight: 500; color: #1E293B; margin: 0; display: flex; align-items: center; gap: 6px;">
              <span style="color: #64748B; font-weight: 400;">Ихтисос:</span>
              <span ${editableAttr('specialty')} style="font-weight: 600; color: #082F49;">${spec}</span>
            </p>
            <p style="font-size: 12px; font-weight: 500; color: #1E293B; margin: 4px 0 0 0; display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #059669; display: inline-block; flex-shrink: 0;"></span>
              <span style="color: #64748B; font-weight: 400;">Соли таҳсил:</span>
              <strong ${editableAttr('cohort')} style="font-weight: 600; color: #1E293B;">${cohort}</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Footer: Director Authorization -->
      <div style="position: relative; z-index: 10; padding: 8px 20px; background-color: rgba(248, 250, 252, 0.9); border-top: 1px solid rgba(226, 232, 240, 0.8); display: flex; align-items: center; justify-content: center; font-size: 12px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;">
          <span style="font-weight: 400; color: #64748B; font-size: 12px;">Директор:</span>
          <div style="position: relative; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 96px; height: 28px; color: #1E3A8A; opacity: 0.9; margin: -8px 0;" fill="none" stroke="currentColor" viewBox="0 0 120 40">
              <path d="M5 25 C 20 5, 25 35, 38 18 C 45 7, 50 30, 65 15 C 75 5, 80 32, 95 20 C 105 12, 110 25, 118 10" stroke-linecap="round" stroke-width="2"></path>
              <path d="M15 28 L 70 24" stroke-linecap="round" stroke-width="1.2"></path>
            </svg>
            <span ${editableAttr('directorName')} style="font-weight: 600; color: #0F172A; font-size: 12px; letter-spacing: 0;">
              ${director}
            </span>
          </div>
        </div>
      </div>

      <!-- Corner print crop guides -->
      <div style="position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
    </div>
  `;
}

export function renderBadgeBackHtml(data = {}, options = {}) {
  const { isEditable = false, style = '' } = options;

  const backTitle = data.backTitle || 'ШАҲОДАТНОМАИ ДОНИШҶӮӢ (STUDENT ID CARD)';
  const validity = data.validity || 'EXP: 01/07/2028';
  const r1 = data.rule1 || '1. Ин шаҳодатнома ҳуҷҷати расмии донишҷӯи Коллеҷи тиббии ДДТХ дар н. Темурмалик мебошад.';
  const r2 = data.rule2 || '2. Ҳангоми ворид шудан ба бинои коллеҷ, беморхонаҳои клиникӣ ва китобхона пешниҳоди он ҳатмист.';
  const r3 = data.rule3 || '3. Ба дигар шахсон додани шаҳодатнома қатъиян манъ аст. Ҳангоми гум шудан ба деканат муроҷиат намоед.';
  const login = data.moodleLogin || 'gr26111';
  const pass = data.moodlePass || 'Student1#';
  const barcode = data.barcodeNumber || data.idNumber || data.studentId || '2-790106';
  const addrCity = data.addressCity || 'ҶТ, вилояти Хатлон,';
  const addrDistrict = data.addressDistrict || 'ноҳияи Темурмалик,';
  const addrVillage = data.addressVillage || 'ҷ.д Кангурт';

  const editableAttr = (field) => isEditable ? `contenteditable="true" data-field="${field}"` : '';

  return `
    <div class="card-face card-face-back" style="width: 480px; height: 335px; border-radius: 15px; overflow: hidden; background-color: #FFFFFF; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(0,0,0,0.04); border: 1px solid rgba(203, 213, 225, 0.8); ${style}">
      
      <!-- Guilloche security background -->
      <div class="absolute inset-0 bg-guilloche-back pointer-events-none z-0" style="position: absolute; inset: 0; pointer-events: none; z-index: 0;"></div>

      <!-- Header: Official title & Validity date -->
      <div style="position: relative; z-index: 10; padding: 12px 20px 8px 20px; border-bottom: 1px solid rgba(226, 232, 240, 0.9); display: flex; align-items: center; justify-content: space-between;">
        <span ${editableAttr('backTitle')} style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A;">
          ${backTitle}
        </span>
        <span style="font-size: 9px; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #065F46; background-color: #ECFDF5; padding: 2px 8px; border-radius: 4px; border: 1px solid #A7F3D0; letter-spacing: 0.05em;">
          <span ${editableAttr('validity')}>${validity}</span>
        </span>
      </div>

      <!-- Campus Regulations / Terms of Use -->
      <div style="position: relative; z-index: 10; padding: 8px 20px; font-size: 9.5px; color: #334155; display: flex; flex-direction: column; gap: 8px; line-height: 1.5;">
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-weight: 700; color: #082F49; font-size: 12px; flex-shrink: 0;">1.</span>
          <span ${editableAttr('rule1')} style="font-weight: 400; color: #334155; font-size: 12px; line-height: 1.4;">${r1}</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-weight: 700; color: #082F49; font-size: 12px; flex-shrink: 0;">2.</span>
          <span ${editableAttr('rule2')} style="font-weight: 400; color: #334155; font-size: 12px; line-height: 1.4;">${r2}</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-weight: 700; color: #082F49; font-size: 12px; flex-shrink: 0;">3.</span>
          <span ${editableAttr('rule3')} style="font-weight: 400; color: #334155; font-size: 12px; line-height: 1.4;">${r3}</span>
        </div>
      </div>

      <!-- Testing System Container (Moodle) -->
      <div style="position: relative; z-index: 10; margin: 0 20px; padding: 10px 12px; background-color: rgba(248, 250, 252, 0.95); border-radius: 6px; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #059669; display: inline-block;"></span>
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #082F49; display: block;">СИСТЕМАИ ТЕСТӢ</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: #FFFFFF; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(226, 232, 240, 0.9); display: flex; align-items: center; gap: 6px;">
              <span style="color: #64748B; font-size: 9.5px; text-transform: uppercase; font-weight: 500;">Логин:</span>
              <strong ${editableAttr('moodleLogin')} style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #0F172A; font-size: 12px; letter-spacing: -0.02em;">${login}</strong>
            </div>
            <div style="background: #FFFFFF; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(226, 232, 240, 0.9); display: flex; align-items: center; gap: 6px;">
              <span style="color: #64748B; font-size: 9.5px; text-transform: uppercase; font-weight: 500;">Парол:</span>
              <strong ${editableAttr('moodlePass')} style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #082F49; font-size: 12px; letter-spacing: -0.02em;">${pass}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Barcode, QR Code & College Address -->
      <div style="position: relative; z-index: 10; padding: 10px 20px; border-top: 1px solid rgba(226, 232, 240, 0.9); display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #FFFFFF;">
        <!-- Code128 Barcode Simulation -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start;">
          <div style="height: 36px; width: 175px; display: flex; align-items: stretch; gap: 1.5px; background: #FFFFFF;">
            <div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
            <div style="width: 1px; background: #000;"></div><div style="width: 2px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div>
            <div style="width: 1px; background: #fff;"></div><div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 1px; background: #000;"></div>
            <div style="width: 3px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 1px; background: #000;"></div><div style="width: 2px; background: #000;"></div>
            <div style="width: 1px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 2px; background: #000;"></div>
            <div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 1px; background: #000;"></div>
            <div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
            <div style="width: 2px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
            <div style="width: 1px; background: #000;"></div><div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 2px; background: #000;"></div>
          </div>
          <span ${editableAttr('barcodeNumber')} style="font-size: 9px; font-family: 'JetBrains Mono', monospace; font-weight: 600; letter-spacing: 0.1em; color: #1E293B; margin-top: 2px;">
            ${barcode}
          </span>
        </div>

        <!-- QR Verification & Official Location -->
        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
          <div style="width: 40px; height: 40px; background-color: #0F172A; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 100%; height: 100%; color: #FFFFFF;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-4 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-2-4h2v2h-2v-2z"></path>
            </svg>
          </div>
          <div style="font-size: 8px; color: #475569; line-height: 1.25;">
            <span style="font-weight: 700; color: #0F172A; display: block; font-size: 9.5px;">Суроға:</span>
            <span style="font-size: 9px; color: #475569; line-height: 1.25; display: block;">
              <span ${editableAttr('addressCity')}>${addrCity}</span><br>
              <span ${editableAttr('addressDistrict')}>${addrDistrict}</span><br>
              <strong ${editableAttr('addressVillage')}>${addrVillage}</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom National Flag Trim (4px) -->
      <div class="tajik-ribbon-bar" style="height: 4px; width: 100%; background: linear-gradient(to bottom, #CC161F 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #007A3D 66.6%);"></div>

      <!-- Corner print crop guides -->
      <div style="position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
    </div>
  `;
}
