import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const owner = "kangurtboy";
const repo = "Badge-Studio";
const tag = "v1.2.0";

const body = `## Badge Studio v1.2.0 — Оффлайн-пакет для печати студенческих билетов

### 📦 Как запустить оффлайн:
1. Скачайте прикреплённый архив **\`BadgeStudio-v1.2.0-offline.zip\`**.
2. Распакуйте архив в любую папку на компьютере.
3. Откройте файл **\`BadgeStudio.html\`** (или \`index.html\`) в любом браузере (Chrome, Edge, Firefox, Яндекс).
4. Программа работает **на 100% автономно** без интернета и локальных серверов!

---

### ✨ Что нового в v1.2.0:
- **Подлинная подпись директора («Имзо 1»):** интеграция оригинальной рукописной подписи из Figma с калибровкой масштаба (\`16cqw\`) и естественным наложением чернил.
- **Инструменты цветокоррекции фотографий (CSS):** ползунки яркости (50–150%), контрастности (50–150%), насыщенности (0–200%, включая стильный ч/б режим) и теплоты оттенка (0–60%) с кнопкой мгновенного сброса.
- **Расширенный зум:** увеличение зума фотографий до **3.0×**.
- **Кнопка удаления фото («X»):** компактный крестик в углу рамки фото на карточке; автоматически скрывается при перетаскивании и центрировании лица.
- **Линии и метки обрезки для печати:** тонкие непрерывные чёрные линии формата 96 × 67 мм с безопасным внешним отступом **1 мм** (\`outline-offset: 1mm\`) и угловые метки реза (crop marks) для лёгкого вырезания ножницами или резаком по линейке. Разметка отображается исключительно при печати на бумаге A4 и скрыта в основном интерфейсе.
- **Кнопка поворота бейджика:** скрыта по умолчанию и плавно появляется только при наведении курсора на карточку.
- **Сохранение кода специальности:** при дублировании бейджа код специальности (\`studentId\`, например \`2-790106\`) больше не изменяется.
- **Отступ панели тестирования:** добавлен отступ снизу (\`margin-bottom: 2cqw\`) к блоку Moodle на оборотной стороне.
`;

async function main() {
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
        name: "Badge Studio v1.2.0 - Оффлайн-пакет, подпись директора, цветокоррекция и метки реза",
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

  // 3. Prepare ZIP file from temp
  const zipPath = path.join(os.tmpdir(), "BadgeStudio-v1.2.0-offline.zip");
  if (!fs.existsSync(zipPath)) {
    throw new Error(`ZIP file not found at: ${zipPath}`);
  }
  const zipBuffer = fs.readFileSync(zipPath);
  console.log(`Read ZIP file: ${zipPath} (${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  // Check if asset already uploaded
  if (Array.isArray(release.assets)) {
    for (const existing of release.assets) {
      if (existing.name === "BadgeStudio-v1.2.0-offline.zip") {
        console.log(`Deleting existing asset ${existing.id}...`);
        await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/assets/${existing.id}`, {
          method: "DELETE",
          headers: commonHeaders,
        });
      }
    }
  }

  // 4. Upload asset to release
  const uploadUrl = `https://uploads.github.com/repos/${owner}/${repo}/releases/${release.id}/assets?name=BadgeStudio-v1.2.0-offline.zip`;
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
