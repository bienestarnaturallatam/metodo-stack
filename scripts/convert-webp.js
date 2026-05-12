const sharp = require('sharp');
const path = require('path');
const pub = path.join(__dirname, '..', 'public');

const tasks = [
  // background_login: resize to max 1200px wide, webp 75
  {
    input: path.join(pub, 'background_login.png'),
    output: path.join(pub, 'background_login.webp'),
    resize: { width: 1200, withoutEnlargement: true },
    quality: 75
  },
  // icon: keep at 512x512 but compress hard - keep png for PWA manifest compatibility
  {
    input: path.join(pub, 'icon.png'),
    output: path.join(pub, 'icon.png'),
    resize: { width: 512, height: 512, fit: 'cover' },
    quality: 80,
    keepPng: true
  },
  // hero mobile: 450px wide for LCP optimization
  {
    input: path.join(pub, 'hero.webp'),
    output: path.join(pub, 'hero-mobile.webp'),
    resize: { width: 450, withoutEnlargement: true },
    quality: 80
  },
];

tasks.forEach(({ input, output, resize, quality, keepPng }) => {
  const pipeline = sharp(input).resize(resize);
  const writer = keepPng ? pipeline.png({ compressionLevel: 9, quality }) : pipeline.webp({ quality });
  writer.toFile(output, (err, info) => {
    if (err) console.error('Error:', input, err.message);
    else console.log('OK:', path.basename(output), (info.size / 1024).toFixed(1) + ' KB');
  });
});
