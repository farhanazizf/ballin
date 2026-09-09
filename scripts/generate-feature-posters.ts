/**
 * Generate brutalist marketing poster HTML from feature config + screenshots.
 * Usage: pnpm tsx scripts/generate-feature-posters.ts
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MARKETING_FEATURES, type PosterTheme } from './marketing/features';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const featuresDir = path.join(root, 'docs/marketing/posters/features');
const screenshotsRel = '../screenshots';

function themeVars(theme: PosterTheme) {
  if (theme === 'field') {
    return {
      bg: '#0A0A0A',
      surface: '#0D1520',
      border: '#2A3A4D',
      text: '#EAEAEA',
      text2: '#9BAABC',
      accent: '#EE6A1E',
      hazard: '#E61919',
      tag: '[ Ballin / Field ]',
    };
  }
  return {
    bg: '#F4F4F0',
    surface: '#F4F4F0',
    border: '#111111',
    text: '#050505',
    text2: '#333333',
    accent: '#EE6A1E',
    hazard: '#E61919',
    tag: '[ Ballin / Coach ]',
  };
}

function sharedCss(w: number, h: number, t: ReturnType<typeof themeVars>) {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${w}px; height: ${h}px; overflow: hidden;
      font-family: "Instrument Sans", system-ui, sans-serif;
      background: ${t.bg}; color: ${t.text};
      position: relative;
    }
    .scanlines {
      position: absolute; inset: 0; pointer-events: none; z-index: 20;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.018) 2px, rgba(255,255,255,0.018) 3px);
    }
    .frame { position: relative; z-index: 5; height: 100%; display: flex; flex-direction: column; border: 2px solid ${t.border}; }
    .top-bar {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 2px solid ${t.border}; padding: 20px 28px;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    }
    .top-bar .hazard { color: ${t.hazard}; }
    .top-bar .unit { color: ${t.text2}; }
    .head { padding: 32px 28px 24px; border-bottom: 1px solid ${t.border}; }
    .head h1 {
      font-family: "Archivo", system-ui, sans-serif;
      font-weight: 900; font-size: ${h > 1200 ? 56 : 42}px;
      letter-spacing: -0.04em; line-height: 0.92;
      text-transform: uppercase; margin-bottom: 12px;
    }
    .head .sub {
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
      color: ${t.accent}; margin-bottom: 16px;
    }
    .head .body { font-size: ${h > 1200 ? 22 : 18}px; line-height: 1.45; color: ${t.text2}; max-width: 92%; }
    .shots {
      flex: 1; display: flex; gap: 16px; padding: 24px 28px;
      align-items: center; justify-content: center; min-height: 0;
    }
    .shots.single .phone { max-width: 72%; }
    .shots.dual .phone { max-width: 46%; }
    .phone {
      border: 2px solid ${t.border};
      background: ${t.surface};
      box-shadow: 8px 8px 0 ${t.border};
      overflow: hidden; flex-shrink: 0;
    }
    .phone img { display: block; width: 100%; height: auto; vertical-align: top; }
    .footer {
      border-top: 2px solid ${t.border};
      padding: 20px 28px;
      display: flex; justify-content: space-between; align-items: center;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
    }
    .footer .brand { font-weight: 600; color: ${t.text}; }
    .footer .tag { color: ${t.accent}; }
    .corner-mark {
      position: absolute; bottom: 12px; right: 16px; z-index: 6;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 9px; letter-spacing: 0.1em; color: ${t.text2}; opacity: 0.5;
    }
  `;
}

function posterHtml(
  feature: (typeof MARKETING_FEATURES)[0],
  format: 'story' | 'post',
) {
  const w = format === 'story' ? 1080 : 1080;
  const h = format === 'story' ? 1920 : 1080;
  const t = themeVars(feature.theme);
  const shots = feature.screenshots
    .map((s) => `<div class="phone"><img src="${screenshotsRel}/${s}" alt="" /></div>`)
    .join('');
  const shotClass = feature.screenshots.length > 1 ? 'dual' : 'single';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;900&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>${sharedCss(w, h, t)}</style>
</head>
<body>
  ${feature.theme === 'field' ? '<div class="scanlines"></div>' : ''}
  <div class="frame">
    <div class="top-bar">
      <span class="hazard">${t.tag}</span>
      <span class="unit">UNIT / ${feature.unit} · REV 1.0</span>
    </div>
    <div class="head">
      <p class="sub">${feature.subtitle}</p>
      <h1>${feature.title}</h1>
      <p class="body">${feature.body}</p>
    </div>
    <div class="shots ${shotClass}">${shots}</div>
    <div class="footer">
      <span class="brand">Dynasty Basketball Academy · Karawang</span>
      <span class="tag">#BerprosesBersama</span>
    </div>
  </div>
  <div class="corner-mark">BALLIN · ${format === 'story' ? '9:16' : '1:1'}</div>
</body>
</html>`;
}

async function main() {
  await import('node:fs/promises').then((fs) => fs.mkdir(featuresDir, { recursive: true }));
  for (const f of MARKETING_FEATURES) {
    await import('node:fs/promises').then((fs) =>
      fs.writeFile(path.join(featuresDir, `${f.id}-story.html`), posterHtml(f, 'story')),
    );
    await import('node:fs/promises').then((fs) =>
      fs.writeFile(path.join(featuresDir, `${f.id}-post.html`), posterHtml(f, 'post')),
    );
    console.log(`Generated ${f.id}-story.html + ${f.id}-post.html`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
