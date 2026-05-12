const sharp = require('sharp');
const path = require('path');

const images = ['testimonio-1', 'testimonio-2', 'testimonio-3'];
const dir = path.join(__dirname, '..', 'public', 'testimonios');

images.forEach(name => {
  const input = path.join(dir, name + '.png');
  const output = path.join(dir, name + '.webp');
  sharp(input)
    .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(output, (err, info) => {
      if (err) console.error('Error con', name, err);
      else console.log('OK:', name + '.webp', info.size, 'bytes');
    });
});
