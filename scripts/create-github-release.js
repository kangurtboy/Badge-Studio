import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

function getGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    const res = spawnSync("git", ["credential", "fill"], {
      input: "protocol=https\nhost=github.com\n\n",
      encoding: "utf8",
    });
    if (res.status === 0 && res.stdout) {
      const match = res.stdout.match(/password=(.+)/);
      if (match) return match[1].trim();
    }
  } catch (err) {
    console.warn("Could not retrieve token from git credential helper:", err.message);
  }
  return "";
}

const token = getGithubToken();
const owner = "kangurtboy";
const repo = "Badge-Studio";
const tag = "v1.3.0";
const releaseTitle = "Badge Studio v1.3.0 - Мультишаблонность, удостоверение охраны, изоляция стилей и поворот фото";

const body = `## Badge Studio v1.3.0 — Мультишаблонность, удостоверение охраны, 100% изоляция стилей и поворот фото

### 📦 Как запустить оффлайн:
1. Скачайте прикреплённый архив **\`BadgeStudio-v1.3.0-offline.zip\`**.
2. Распакуйте архив в любую папку на компьютере.
3. Откройте файл **\`BadgeStudio.html\`** в любом современном браузере (Google Chrome, Microsoft Edge, Яндекс Браузер, Mozilla Firefox).
4. Программа работает **на 100% автономно** без интернета и локальных серверов!

---

### ✨ Что нового в v1.3.0:

#### 🛡️ Новый официальный шаблон «Ҳифозат / Охрана»
- **Попиксельная верстка по утверждённому Figma-макету** (\`36:2\`, фреймы \`36:19\` и \`36:75\`):
  - **Лицевая сторона:** компактная светлая шапка, крупный акцентный заголовок «МУҲОФИЗ» (36px, Roboto 900, \`#d5b778\`) с латунным маркером, подзаголовок «COLLEGE SECURITY», двустрочное отображение ФИО сотрудника с естественным переносом строк, тонкий разделитель (\`#3b4d58\`), статус «КОРТИ ХИЗМАТӢ», двухслойная рамка фото 106 × 140 px (наружный латунный контур \`#d5b778\` + внутреннее белое паспарту \`#ffffff\`), центрированный блок подписи директора.
  - **Обратная сторона:** глубокий темно-синий фон \`#142a39\`, заголовок «ШАҲОДАТНОМАИ ХИЗМАТӢ» / «SECURITY IDENTIFICATION CARD», 2px латунная разделительная линия, 3 служебных правила («ТАРТИБИ ИСТИФОДА»), сервисная лента «ҲИФОЗАТ / SECURITY» и «КОРТИ ШАХСӢ», сплошная белая панель адреса с оригинальным векторным щитком QR-кода из Figma (\`figma-security-qr.svg\`), нижняя 4-пиксельная лента флага Республики Таджикистан.
- **Быстрое заполнение:** кнопка мгновенного заполнения листа 8 сотрудниками охраны с оригинальным фото из макета.
- **Динамический инспектор свойств:** переключатель \`[🎓 Донишҷӯ | 🛡️ Ҳифозат]\` с автоматической адаптацией полей ввода под выбранный шаблон.

#### 🏗️ 100% модульная изоляция стилей (CSS Scoping Architecture)
- Полное разделение CSS каждого шаблона по изолированным модулям:
  - \`badge-base.css\` — базовые размеры артборда, container queries (\`cqw\`), утилиты.
  - \`template-student.css\` — стили студенческого билета под строгим селектором \`.template-student\`.
  - \`template-security.css\` — стили удостоверения охраны под строгим селектором \`.template-security\`.
- Возможность одновременного размещения бейджей разных шаблонов на одном листе A4 с двусторонней печатью без коллизий оформления.
- Добавлено подробное руководство разработчика: \`docs/ADDING_TEMPLATES.md\`.

#### 🔄 Инструменты поворота фотографии (Rotate)
- Плавный ползунок угла от **-180°** до **+180°** с шагом **1°** для точного выравнивания наклона лица.
- Кнопки быстрого шага **-90°** и **+90°** для моментального переворота фотографий, снятых на смартфон боком.
- Кнопка сброса угла на 0°.
- Вращение синхронизировано на карточке, в миниатюрах инспектора и левой панели, сохраняется в памяти и печатается на бумаге.

#### 🔍 Увеличенный зум и полировка интерфейса
- Максимальный зум фотографии расширен до **4.0×** (от 1.00× до 4.00× с шагом 0.01) для точного кадрирования портретов с мелких общих снимков.
- Кнопка удаления фото («X») скрыта по умолчанию и плавно появляется только при наведении курсора на рамку фото.
- Естественный перенос длинных имён: перенос на вторую строку происходит только при нехватке ширины без принудительного разрыва коротких имён.
`;

async function main() {
  if (!token) {
    throw new Error("GitHub token not found via environment or git credentials.");
  }

  const commonHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "BadgeStudio-Release-Agent",
  };

  // 1. Check if release already exists
  let release;
  const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
    headers: commonHeaders,
  });

  if (checkRes.ok) {
    release = await checkRes.json();
    console.log(`Release ${tag} already exists with id: ${release.id}`);
  } else {
    // 2. Create Release
    const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      method: "POST",
      headers: {
        ...commonHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tag_name: tag,
        target_commitish: "main",
        name: releaseTitle,
        body,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create release: ${createRes.status} ${err}`);
    }
    release = await createRes.json();
    console.log(`Created release ${tag} (id: ${release.id})`);
  }

  // 3. Prepare ZIP file from dist-offline or temp
  let zipPath = path.resolve("dist-offline", "BadgeStudio-v1.3.0-offline.zip");
  if (!fs.existsSync(zipPath)) {
    zipPath = path.join(os.tmpdir(), "BadgeStudio-v1.3.0-offline.zip");
  }
  if (!fs.existsSync(zipPath)) {
    throw new Error(`ZIP file not found at: ${zipPath}`);
  }
  const zipBuffer = fs.readFileSync(zipPath);
  console.log(`Read ZIP file: ${zipPath} (${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  const assetName = "BadgeStudio-v1.3.0-offline.zip";

  // Check if asset already uploaded
  if (Array.isArray(release.assets)) {
    for (const existing of release.assets) {
      if (existing.name === assetName) {
        console.log(`Deleting existing asset ${existing.id}...`);
        await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/assets/${existing.id}`, {
          method: "DELETE",
          headers: commonHeaders,
        });
      }
    }
  }

  // 4. Upload asset to release
  const uploadUrl = `https://uploads.github.com/repos/${owner}/${repo}/releases/${release.id}/assets?name=${assetName}`;
  console.log(`Uploading asset to: ${uploadUrl}`);

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "BadgeStudio-Release-Agent",
      "Content-Type": "application/zip",
      "Content-Length": String(zipBuffer.length),
    },
    body: zipBuffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Failed to upload asset: ${uploadRes.status} ${err}`);
  }

  const asset = await uploadRes.json();
  console.log("Asset uploaded successfully!");
  console.log(`Name: ${asset.name}`);
  console.log(`Size: ${(asset.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Download URL: ${asset.browser_download_url}`);
  console.log(`Release URL: ${release.html_url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
