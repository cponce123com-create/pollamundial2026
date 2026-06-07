// Genera logo-og.png (1200x630), icon-192.png e icon-512.png desde logo.svg
// El texto se renderiza inline como SVG para evitar dependencias de fuentes externas
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");
const svgPath = path.join(publicDir, "logo.svg");

if (!fs.existsSync(svgPath)) {
  console.log("⚠  logo.svg not found, skipping image generation");
  process.exit(0);
}

const svgBuffer = fs.readFileSync(svgPath);
const DARK_BG = { r: 13, g: 17, b: 23 };

/** Render just the SVG icon (trophy + ball, no text) */
function renderSvgIcon(size) {
  // Strip <text> elements from SVG, keep only shapes
  const svg = fs.readFileSync(svgPath, "utf-8");
  const cleanSvg = svg.replace(/<text[\s\S]*?<\/text>/g, "");
  return Buffer.from(cleanSvg);
}

/** Generate text as an inline SVG overlay */
function textOverlaySvg(lines, fontSize, color, yStart) {
  let svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">`;
  svg += `<stop offset="0%" stop-color="#ffd700"/><stop offset="100%" stop-color="#ffaa00"/></linearGradient></defs>`;
  let y = yStart;
  for (const line of lines) {
    svg += `<text x="600" y="${y}" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="${color}" letter-spacing="4">${line}</text>`;
    y += fontSize + 8;
  }
  svg += `</svg>`;
  return Buffer.from(svg);
}

/** Generate a PNG from logo.svg at the given size */
async function generatePNG(size, filename) {
  const outPath = path.join(publicDir, filename);

  if (size === "1200x630") {
    const [w, h] = [1200, 630];

    // Step 1: render the icon (without text) at a good size
    const iconSvg = renderSvgIcon(400);
    const iconPng = await sharp(iconSvg)
      .resize(280, 280, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    // Step 2: create text overlays as SVG
    const titleSvg = textOverlaySvg(["LA POLLA DEL PONCE"], 42, "url(#g)", 400);
    const subtitleSvg = textOverlaySvg(["MUNDIAL 2026"], 28, "white", 458);

    // Step 3: composite everything
    const layers = [
      { input: iconPng, top: 60, left: Math.round((w - 280) / 2) },
      { input: titleSvg, top: 0, left: 0 },
      { input: subtitleSvg, top: 0, left: 0 },
    ];

    await sharp({
      create: { width: w, height: h, channels: 3, background: DARK_BG },
    })
      .composite(layers)
      .png()
      .toFile(outPath);
    console.log(`✅ ${filename} (${w}×${h}) generated`);
    return;
  }

  // Square icons (192/512) — render SVG directly
  const [w, h] = Array.isArray(size) ? size : [size, size];
  const iconSvg = renderSvgIcon(w);
  await sharp(iconSvg)
    .resize(w, h, { fit: "contain", background: DARK_BG })
    .png()
    .toFile(outPath);
  console.log(`✅ ${filename} (${w}×${h}) generated`);
}

async function main() {
  await generatePNG("1200x630", "logo-og.png");
  await generatePNG(192, "icon-192.png");
  await generatePNG(512, "icon-512.png");
}

main().catch((err) => {
  console.error("❌ Image generation failed:", err.message);
  process.exit(0);
});
