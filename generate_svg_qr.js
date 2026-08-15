/**
 * Generates a high-resolution QR Code SVG with the company logo
 * embedded in the center on a white background.
 * Run once: node generate_svg_qr.js
 *
 * QR encodes: https://www.bhoodevadevelopers.com
 * When scanned on mobile, it opens index.html showing social links.
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://links.bhoodevadevelopers.com';
const LOGO_FILE = path.join(__dirname, 'logo.png');
const OUT_SVG = path.join(__dirname, 'Bhoodeva_Developers_QR.svg');
const OUT_PNG_PLAIN = path.join(__dirname, 'Bhoodeva_Developers_QR_plain.png');

/* ───────── 1. Plain PNG (no logo) ───────── */
QRCode.toFile(OUT_PNG_PLAIN, TARGET_URL, {
  width: 800,
  margin: 2,
  color: { dark: '#d35d26', light: '#ffffff' },
  errorCorrectionLevel: 'H'
}, (err) => {
  if (err) { console.error('PNG error:', err); return; }
  console.log('✅  Plain PNG saved →', OUT_PNG_PLAIN);
});

/* ───────── 2. SVG with logo in white box center ───────── */
let logoB64 = '';
if (fs.existsSync(LOGO_FILE)) {
  logoB64 = 'data:image/png;base64,' + fs.readFileSync(LOGO_FILE).toString('base64');
} else {
  console.warn('⚠️  logo.png not found — SVG will be generated without logo.');
}

QRCode.toString(TARGET_URL, {
  type: 'svg',
  errorCorrectionLevel: 'H',
  color: { dark: '#d35d26', light: '#ffffff' }
}, (err, svgString) => {
  if (err) { console.error('SVG error:', err); return; }

  let finalSvg = svgString;

  if (logoB64) {
    const match = svgString.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
    if (match) {
      const w = parseFloat(match[1]);
      const h = parseFloat(match[2]);
      const pad = 1.2;                       // white border around logo
      const ls = Math.min(w, h) * 0.22;    // logo occupies 22% of QR
      const lx = (w - ls) / 2;
      const ly = (h - ls) / 2;

      const overlay = `
  <!-- white background box -->
  <rect x="${(lx - pad).toFixed(2)}" y="${(ly - pad).toFixed(2)}"
        width="${(ls + pad * 2).toFixed(2)}" height="${(ls + pad * 2).toFixed(2)}"
        fill="#ffffff" rx="1" ry="1"/>
  <!-- company logo -->
  <image href="${logoB64}"
         x="${lx.toFixed(2)}" y="${ly.toFixed(2)}"
         width="${ls.toFixed(2)}" height="${ls.toFixed(2)}"/>
</svg>`;

      finalSvg = svgString.replace('</svg>', overlay);
      console.log('✅  Logo embedded in SVG center');
    }
  }

  fs.writeFileSync(OUT_SVG, finalSvg, 'utf8');
  console.log('✅  SVG saved →', OUT_SVG);
  console.log('\n📌  Scan SVG — opens: ' + TARGET_URL);
  console.log('📌  Upload index.html + logo.png to GoDaddy public_html/');
});
