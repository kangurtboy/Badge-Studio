// Exact 1:1 Pixel-Perfect Stitch HTML Renderer for Front and Back sides
// Directly extracted from Google Stitch screen: "Badge Studio — Отдельный редактор бейджа (Front & Back)"

export function renderBadgeFrontHtml(data = {}, options = {}) {
  const { isEditable = false, style = '' } = options;

  const t1 = data.title1 || 'КОЛЛЕҶИ ТИББИИ ДОНИШГОҲИ ДАВЛАТИИ ТИББИИ ХАТЛОН';
  const t2 = data.title2 || 'ДАР НОҲИЯИ ДАНҒАРА';
  const idNum = data.idNumber || data.studentId || '2-790106-102';
  const fullName = data.fullName || data.name || 'РАҲИМОВА НИГИНА РУСТАМОВНА';
  const faculty = data.faculty || data.specialty || 'Факултети кори ҳамширагӣ';
  const course = data.course || 'Курси 2, гурӯҳи 102';
  const section = data.section || 'Шӯъбаи рӯзона';
  const cohort = data.cohort || '2024–2028';
  const director = data.directorName || 'Баротзода А.Ҳ.';
  const photo = data.photoSrc || '/assets/student-nigina.jpg';

  const editableAttr = (field) => isEditable ? `contenteditable="true" data-field="${field}"` : '';

  return `
    <div class="card-face card-face-front" style="width: 430px; height: 270px; border-radius: 14px; overflow: hidden; background-color: #FFFFFF; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08); ${style}">
      
      <!-- Top Tajik Flag Ribbon Accent -->
      <div style="position: relative; z-index: 10; width: 100%;">
        <div class="tajik-ribbon-bar" style="height: 4px; width: 100%; background: linear-gradient(to bottom, #CC161F 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #007A3D 66.6%);"></div>
        <div style="width: 100%; padding: 6px 20px 0 20px; display: flex; justify-content: center;">
          <div style="width: 190px; height: 6px; border-radius: 9999px; background: linear-gradient(90deg, rgba(204, 22, 31, 0.9) 0%, rgba(204, 22, 31, 0.9) 28%, #ffffff 28%, #ffffff 72%, rgba(0, 122, 61, 0.9) 72%, rgba(0, 122, 61, 0.9) 100%); opacity: 0.9; box-shadow: 0 1px 2px rgba(0,0,0,0.06);"></div>
        </div>
      </div>

      <!-- Official University / College Header -->
      <div style="position: relative; z-index: 10; padding: 4px 16px 0 16px; text-align: center;">
        <h1 style="font-size: 9px; font-weight: 800; text-transform: uppercase; line-height: 1.25; letter-spacing: -0.01em; color: #0F172A; font-family: 'PT Serif', Georgia, serif; margin: 0;">
          <span ${editableAttr('title1')}>${t1}</span><br/>
          <span ${editableAttr('title2')} style="color: #082F49; font-family: 'Inter', sans-serif; font-weight: 700; letter-spacing: 0;">${t2}</span>
        </h1>
        <div style="width: 96px; height: 1px; background-color: #CBD5E1; margin: 4px auto 0 auto;"></div>
      </div>

      <!-- Main Body: Student Photo + Identity Details -->
      <div style="position: relative; z-index: 10; padding: 4px 16px; display: flex; align-items: center; gap: 14px; flex: 1;">
        <!-- Left: Student Photo Frame with Hologram Seal -->
        <div style="position: relative; flex-shrink: 0;">
          <div class="student-photo-container" style="width: 84px; height: 110px; border-radius: 6px; overflow: hidden; border: 1.5px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); background-color: #F1F5F9; position: relative; cursor: ${isEditable ? 'pointer' : 'default'};">
            <img src="${photo}" alt="Раҳимова Нигина" style="width: 100%; height: 100%; object-fit: cover; object-position: top; display: block;" />
            
            <!-- Micro hologram security sticker overlay -->
            <div style="position: absolute; bottom: 3px; right: 3px; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(186,230,253,0.75) 25%, rgba(254,240,138,0.75) 50%, rgba(244,114,182,0.65) 75%, rgba(167,243,208,0.85) 100%); border: 1px solid rgba(255,255,255,0.7); box-shadow: 0 1px 2px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; pointer-events: none;">
              <span style="font-size: 6px; font-weight: 800; color: #334155; letter-spacing: -0.05em;">ДДТХ</span>
            </div>

            ${isEditable ? `
              <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35); opacity: 0; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 600;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
                <span>Изменить</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Right: Student Metadata & Big Legible Name -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 3px;">
          <!-- Student ID badge pill -->
          <div style="display: inline-flex; align-items: center; align-self: flex-start; gap: 4px; background-color: #0C4A6E; color: #FFFFFF; font-family: 'JetBrains Mono', monospace; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            <span style="font-size: 8px; text-transform: uppercase; opacity: 0.8; font-family: 'Inter', sans-serif; font-weight: 400;">ID:</span>
            <span ${editableAttr('idNumber')}>${idNum}</span>
          </div>

          <!-- Big Bold Full Name -->
          <div style="padding-top: 2px;">
            <span style="font-size: 7.5px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Насаб, ном ва номи падар:</span>
            <h2 style="font-size: 13px; line-height: 1.2; font-weight: 900; letter-spacing: -0.01em; color: #020617; font-family: 'Inter', sans-serif; margin: 0;">
              <span ${editableAttr('fullName')}>${fullName}</span>
            </h2>
          </div>

          <!-- Academic Details -->
          <div style="font-size: 8.5px; line-height: 1.25; color: #334155; margin-top: 2px;">
            <p style="font-weight: 500; color: #1E293B; margin: 0;">
              <span ${editableAttr('faculty')}>${faculty}</span>
            </p>
            <div style="display: flex; align-items: center; gap: 6px; color: #475569; margin-top: 2px;">
              <span style="font-weight: 700; color: #0C4A6E;" ${editableAttr('course')}>${course}</span>
              <span>•</span>
              <span ${editableAttr('section')}>${section}</span>
            </div>
            <p style="font-size: 7.5px; color: #64748B; font-family: 'JetBrains Mono', monospace; margin: 2px 0 0 0;">
              Соли таҳсил: <span ${editableAttr('cohort')}>${cohort}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom Footer Bar: Director, Signature & Official Stamp -->
      <div style="position: relative; z-index: 10; padding: 6px 16px; background-color: rgba(248, 250, 252, 0.95); border-top: 1px solid rgba(226, 232, 240, 0.9); display: flex; align-items: center; justify-content: space-between; font-size: 8px;">
        <!-- Director Signature Block -->
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-weight: 700; color: #334155;">Директор:</span>
          <div style="position: relative; display: flex; align-items: center;">
            <svg style="width: 64px; height: 24px; color: #1E40AF; opacity: 0.9; margin: -10px 0;" fill="none" stroke="currentColor" viewBox="0 0 120 40">
              <path d="M5 25 C 20 5, 25 35, 38 18 C 45 7, 50 30, 65 15 C 75 5, 80 32, 95 20 C 105 12, 110 25, 118 10" stroke-linecap="round" stroke-width="2"></path>
              <path d="M15 28 L 70 24" stroke-linecap="round" stroke-width="1.2"></path>
            </svg>
            <span ${editableAttr('directorName')} style="font-weight: 700; color: #0F172A; margin-left: 4px;">
              ${director}
            </span>
          </div>
        </div>

        <!-- Official Round Micro-Seal / Stamp (ДДТХ Данғара) -->
        <div style="position: relative; display: flex; align-items: center;">
          <div style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px dashed rgba(204, 22, 31, 0.7); color: rgba(204, 22, 31, 0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 5px; text-transform: uppercase; font-weight: 800; text-align: center; line-height: 1.1; transform: rotate(-8deg);">
            <span>ДДТХ</span>
            <span style="transform: scale(0.75);">★ Данғара ★</span>
          </div>
        </div>
      </div>

      <!-- Card Corner Cut Guide Markers -->
      <div style="position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 1px solid #94A3B8; border-left: 1px solid #94A3B8; pointer-events: none;"></div>
      <div style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; border-top: 1px solid #94A3B8; border-right: 1px solid #94A3B8; pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 8px; height: 8px; border-bottom: 1px solid #94A3B8; border-left: 1px solid #94A3B8; pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 1px solid #94A3B8; border-right: 1px solid #94A3B8; pointer-events: none;"></div>
    </div>
  `;
}

export function renderBadgeBackHtml(data = {}, options = {}) {
  const { isEditable = false, style = '' } = options;

  const backTitle = data.backTitle || 'Қоидаҳои истифодаи шаҳодатнома';
  const validity = data.validity || 'VALID UNTIL: 01/07/2028';
  const r1 = data.rule1 || '1. Ин шаҳодатнома ҳуҷҷати расмии донишҷӯи Коллеҷи тиббии ДДТХ дар ноҳияи Данғара мебошад.';
  const r2 = data.rule2 || '2. Ҳангоми ворид шудан ба бинои коллеҷ, беморхонаҳои клиникӣ ва китобхона нишон додани он ҳатмист.';
  const r3 = data.rule3 || '3. Ба дигар шахсон додани шаҳодатнома қатъиян манъ аст. Ҳангоми гум шудан фавран ба деканат хабар диҳед.';
  const blood = data.bloodGroup || 'A(II) Rh+ (Positive)';
  const phone = data.contactPhone || '+992 (3312) 2-24-45';
  const barcode = data.barcodeNumber || data.idNumber || data.studentId || '2-790106-102';
  const addrCity = data.addressCity || 'ҶТ, вилояти Хатлон,';
  const addrStreet = data.addressStreet || 'н. Данғара, кӯч. Марказӣ';

  const editableAttr = (field) => isEditable ? `contenteditable="true" data-field="${field}"` : '';

  return `
    <div class="card-face card-face-back" style="width: 430px; height: 270px; border-radius: 14px; overflow: hidden; background-color: #FFFFFF; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08); ${style}">
      
      <!-- Top Back Header -->
      <div style="position: relative; z-index: 10; padding: 10px 16px 4px 16px; border-bottom: 1px solid rgba(226, 232, 240, 0.8); display: flex; align-items: center; justify-content: space-between;">
        <span ${editableAttr('backTitle')} style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #334155;">
          ${backTitle}
        </span>
        <span style="font-size: 7.5px; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #065F46; background-color: #ECFDF5; padding: 2px 6px; border-radius: 4px; border: 1px solid #A7F3D0;">
          <span ${editableAttr('validity')}>${validity}</span>
        </span>
      </div>

      <!-- Rules & Terms list -->
      <div style="position: relative; z-index: 10; padding: 4px 16px; font-size: 7.5px; color: #475569; display: flex; flex-direction: column; gap: 4px; line-height: 1.35;">
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

      <!-- Medical Emergency & Blood Group Chip -->
      <div style="position: relative; z-index: 10; margin: 0 16px; padding: 6px 12px; background-color: #F1F5F9; border-radius: 6px; border: 1px solid rgba(226, 232, 240, 0.8); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="font-size: 6.5px; text-transform: uppercase; font-weight: 700; color: #64748B; display: block;">Гурӯҳи хун / Резус-омил:</span>
          <span ${editableAttr('bloodGroup')} style="font-size: 10px; font-weight: 900; color: #BE123C; font-family: 'JetBrains Mono', monospace;">
            ${blood}
          </span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 6.5px; text-transform: uppercase; font-weight: 700; color: #64748B; display: block;">Телефон барои тамос:</span>
          <span ${editableAttr('contactPhone')} style="font-size: 8.5px; font-weight: 600; color: #1E293B;">
            ${phone}
          </span>
        </div>
      </div>

      <!-- Barcode & QR code validation section -->
      <div style="position: relative; z-index: 10; padding: 6px 16px 8px 16px; border-top: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(255, 255, 255, 0.95);">
        <!-- Simulated Code128 Barcode -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start;">
          <div style="height: 30px; width: 175px; display: flex; align-items: stretch; gap: 1.5px; background: #FFFFFF; padding: 2px;">
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
          <span ${editableAttr('barcodeNumber')} style="font-size: 7.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; letter-spacing: 0.1em; color: #1E293B; margin-top: 1px;">
            ${barcode}
          </span>
        </div>

        <!-- Simulated QR code & Address -->
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <div style="width: 38px; height: 38px; background-color: #0F172A; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 100%; height: 100%; color: #FFFFFF;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-4 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-2-4h2v2h-2v-2z"></path>
            </svg>
          </div>
          <div style="font-size: 6.5px; color: #64748B; line-height: 1.3;">
            <span style="font-weight: 700; color: #334155; display: block;">Суроға:</span>
            <span ${editableAttr('addressCity')}>${addrCity}</span><br/>
            <strong ${editableAttr('addressStreet')} style="color: #082F49;">${addrStreet}</strong>
          </div>
        </div>
      </div>

      <!-- Bottom Flag Accent Bar (4px) -->
      <div class="tajik-ribbon-bar" style="height: 4px; width: 100%; background: linear-gradient(to bottom, #CC161F 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #007A3D 66.6%);"></div>

      <!-- Card Corner Cut Guide Markers -->
      <div style="position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 1px solid #94A3B8; border-left: 1px solid #94A3B8; pointer-events: none;"></div>
      <div style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; border-top: 1px solid #94A3B8; border-right: 1px solid #94A3B8; pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 8px; height: 8px; border-bottom: 1px solid #94A3B8; border-left: 1px solid #94A3B8; pointer-events: none;"></div>
      <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 1px solid #94A3B8; border-right: 1px solid #94A3B8; pointer-events: none;"></div>
    </div>
  `;
}
