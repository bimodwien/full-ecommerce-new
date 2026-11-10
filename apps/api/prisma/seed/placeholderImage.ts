import sharp from 'sharp';

const GRAY = '#6b7280';
const SIZE = 800;

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Gray tile with the product name, rendered to PNG like real uploads.
export default async function placeholderImage(name: string) {
  const fontSize = Math.min(72, Math.floor(1000 / name.length));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
    <rect width="100%" height="100%" fill="${GRAY}"/>
    <text x="50%" y="50%" fill="#ffffff" font-family="sans-serif" font-size="${fontSize}"
      font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(name)}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
