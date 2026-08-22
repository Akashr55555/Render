const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const iconJpegPath = path.join(process.cwd(), 'src/assets/images/pdfsketch_pen_on_book_icon_1786393586478.jpg');

async function generateLogo() {
  const width = 512;
  const height = 512;

  // Read icon image if available
  let iconBuffer = null;
  if (fs.existsSync(iconJpegPath)) {
    iconBuffer = await sharp(iconJpegPath)
      .resize(240, 240, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();
  }

  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38e8cb" />
        <stop offset="100%" stop-color="#00a89d" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0e1726" flood-opacity="0.12" />
      </filter>
    </defs>

    <!-- Background Canvas -->
    <rect width="100%" height="100%" fill="#ffffff" />

    <!-- Outer Decorative Card Frame -->
    <rect x="36" y="36" width="440" height="440" rx="48" fill="#ffffff" stroke="url(#cardBorder)" stroke-width="4" filter="url(#shadow)" />

    <!-- Text Branding below icon -->
    <g transform="translate(256, 420)">
      <text text-anchor="middle" font-family="Plus Jakarta Sans, Outfit, system-ui, sans-serif" font-weight="900" font-size="42" letter-spacing="-1">
        <tspan fill="#0e1726">PDF</tspan>
        <tspan fill="#00a89d">Sketch</tspan>
        <tspan fill="#475569" font-size="28" font-weight="700">.com</tspan>
      </text>
    </g>
  </svg>
  `;

  const composites = [{ input: Buffer.from(svgOverlay), top: 0, left: 0 }];

  if (iconBuffer) {
    composites.push({
      input: iconBuffer,
      top: 100,
      left: 136
    });
  }

  const logoPngPath = path.join(assetsDir, 'pdfsketch-logo.png');
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(logoPngPath);

  console.log('Generated valid 512x512 logo at:', logoPngPath);
}

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  let iconBuffer = null;
  if (fs.existsSync(iconJpegPath)) {
    iconBuffer = await sharp(iconJpegPath)
      .resize(100, 100, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();
  }

  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e1b4b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>

      <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38e8cb" />
        <stop offset="100%" stop-color="#00a89d" />
      </linearGradient>

      <filter id="badgeShadow">
        <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000000" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Rich Dark Background -->
    <rect width="100%" height="100%" fill="url(#bgGrad)" />

    <!-- Decorative Glow Circles -->
    <circle cx="1050" cy="120" r="280" fill="#00a89d" opacity="0.12" />
    <circle cx="150" cy="520" r="220" fill="#6366f1" opacity="0.10" />

    <!-- Top Left Brand Badge Container -->
    <rect x="90" y="70" width="120" height="120" rx="24" fill="#ffffff" stroke="#38e8cb" stroke-width="3" filter="url(#badgeShadow)" />

    <!-- Brand Typography Header -->
    <g transform="translate(230, 130)">
      <text font-family="Plus Jakarta Sans, Outfit, system-ui, sans-serif" font-weight="900" font-size="52" letter-spacing="-1">
        <tspan fill="#ffffff">PDF</tspan>
        <tspan fill="#38e8cb">Sketch</tspan>
        <tspan fill="#94a3b8" font-size="32" font-weight="700">.com</tspan>
      </text>
      <text y="36" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-weight="600" font-size="20" fill="#cbd5e1" letter-spacing="0.5">
        Complete Online PDF Workspace &amp; Tools
      </text>
    </g>

    <!-- Top Right Tag/Badge -->
    <g transform="translate(870, 80)">
      <rect width="240" height="48" rx="24" fill="rgba(56, 232, 203, 0.15)" stroke="#38e8cb" stroke-width="1.5" />
      <text x="120" y="30" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-weight="800" font-size="16" fill="#38e8cb" letter-spacing="0.5">
        100% FREE &amp; SECURE
      </text>
    </g>

    <!-- Main Headline -->
    <text x="90" y="280" font-family="Plus Jakarta Sans, Outfit, system-ui, sans-serif" font-weight="900" font-size="56" fill="#ffffff" letter-spacing="-1">
      Free Online PDF Tools
    </text>

    <!-- Subheadline -->
    <text x="90" y="340" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-weight="500" font-size="26" fill="#94a3b8">
      Merge, Split, Compress, Convert, Edit &amp; AI Summarize PDFs Online
    </text>

    <!-- Grid of Popular Tool Badges -->
    <g transform="translate(90, 410)">
      <!-- Tool 1 -->
      <g transform="translate(0, 0)">
        <rect width="180" height="52" rx="14" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1" />
        <text x="90" y="32" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="18" fill="#e2e8f0">
          Merge PDF
        </text>
      </g>
      <!-- Tool 2 -->
      <g transform="translate(200, 0)">
        <rect width="180" height="52" rx="14" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1" />
        <text x="90" y="32" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="18" fill="#e2e8f0">
          Compress PDF
        </text>
      </g>
      <!-- Tool 3 -->
      <g transform="translate(400, 0)">
        <rect width="180" height="52" rx="14" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1" />
        <text x="90" y="32" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="18" fill="#e2e8f0">
          PDF to Word
        </text>
      </g>
      <!-- Tool 4 -->
      <g transform="translate(600, 0)">
        <rect width="180" height="52" rx="14" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1" />
        <text x="90" y="32" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="18" fill="#e2e8f0">
          Edit &amp; OCR
        </text>
      </g>
      <!-- Tool 5 -->
      <g transform="translate(800, 0)">
        <rect width="180" height="52" rx="14" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1" />
        <text x="90" y="32" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="18" fill="#e2e8f0">
          AI Summarize
        </text>
      </g>
    </g>

    <!-- Bottom Accent Line & URL -->
    <rect x="90" y="520" width="1020" height="2" fill="url(#tealGrad)" opacity="0.6" />
    <text x="90" y="565" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="22" fill="#38e8cb" letter-spacing="0.5">
      https://pdfsketch.com
    </text>
  </svg>
  `;

  const composites = [{ input: Buffer.from(svgOverlay), top: 0, left: 0 }];

  if (iconBuffer) {
    composites.push({
      input: iconBuffer,
      top: 80,
      left: 100
    });
  }

  const ogPngPath = path.join(assetsDir, 'pdfsketch-og.png');
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    }
  })
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(ogPngPath);

  console.log('Generated valid 1200x630 OG image at:', ogPngPath);
}

async function main() {
  await generateLogo();
  await generateOgImage();
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
