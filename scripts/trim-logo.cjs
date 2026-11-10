/* One-off: trim transparent padding from the logo PNGs. */
const fs = require('fs');
const { PNG } = require('pngjs');

function trim(file, pad = 8) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const { width, height, data } = png;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error('fully transparent: ' + file);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    const srcStart = ((minY + y) * width + minX) * 4;
    data.copy(out.data, y * w * 4, srcStart, srcStart + w * 4);
  }
  fs.writeFileSync(file, PNG.sync.write(out));
  console.log(`${file}: ${width}x${height} -> ${w}x${h}`);
}

['public/img/logo-white.png', 'public/img/logo-black.png'].forEach((f) => trim(f));
