const fs = require('fs');
const path = require('path');

function getPngSize(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504E47 || buffer.readUInt32BE(4) !== 0x0D0A1A0A) {
    throw new Error('Not a PNG');
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function getJpgSize(buffer) {
  if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    throw new Error('Not a JPEG');
  }
  let offset = 2;
  while (offset < buffer.length) {
    const marker = buffer.readUInt16BE(offset);
    offset += 2;
    if (marker === 0xFFD9 || marker === 0xFFDA) {
      break; // End of image or start of scan
    }
    const length = buffer.readUInt16BE(offset);
    if (marker >= 0xFFC0 && marker <= 0xFFC3) {
      // SOF0, SOF1, SOF2
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return { width, height };
    }
    offset += length;
  }
  throw new Error('Could not find SOF marker in JPEG');
}

const dir = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a4abe219-5cd0-4bb9-a064-b44e489629bf';
const img1Path = path.join(dir, 'media__1779642585409.jpg');
const img2Path = path.join(dir, 'media__1779642843159.png');

try {
  const buf1 = fs.readFileSync(img1Path);
  console.log('Image 1 (JPG):', buf1.length, 'bytes');
  console.log('Image 1 Size:', getJpgSize(buf1));
} catch (e) {
  console.error('Error reading Image 1:', e.message);
}

try {
  const buf2 = fs.readFileSync(img2Path);
  console.log('Image 2 (PNG):', buf2.length, 'bytes');
  console.log('Image 2 Size:', getPngSize(buf2));
} catch (e) {
  console.error('Error reading Image 2:', e.message);
}
