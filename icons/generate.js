const fs = require('fs');
const path = require('path');

// Simple PNG generator - creates solid color icons with embedded text
// Uses minimal PNG format without external dependencies

const sizes = [32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple PNG with solid green background
function createPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // Create image data (RGB pixels)
  const rawData = [];

  // Green color (#238636)
  const r = 0x23, g = 0x86, b = 0x36;
  // Darker green for border
  const br = 0x1a, bg = 0x6b, bb = 0x29;
  // White for text area
  const wr = 0xff, wg = 0xff, wb = 0xff;

  const borderWidth = Math.max(2, Math.floor(width * 0.05));
  const cornerRadius = Math.floor(width * 0.15);

  for (let y = 0; y < height; y++) {
    rawData.push(0); // Filter byte for each row
    for (let x = 0; x < width; x++) {
      // Check if inside rounded rectangle
      const inCorner = isInRoundedCorner(x, y, width, height, cornerRadius);

      if (inCorner) {
        // Transparent (but we're using RGB, so use dark color)
        rawData.push(0x0d, 0x11, 0x17);
      } else {
        // Check for border
        const isBorder = x < borderWidth || x >= width - borderWidth ||
                        y < borderWidth || y >= height - borderWidth;

        // Center area for "BJ" text simulation
        const centerX = width / 2;
        const centerY = height / 2;
        const textWidth = width * 0.4;
        const textHeight = height * 0.3;
        const inTextArea = x > centerX - textWidth/2 && x < centerX + textWidth/2 &&
                          y > centerY - textHeight/2 && y < centerY + textHeight/2;

        if (inTextArea && !isBorder) {
          rawData.push(wr, wg, wb);
        } else if (isBorder) {
          rawData.push(br, bg, bb);
        } else {
          rawData.push(r, g, b);
        }
      }
    }
  }

  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function isInRoundedCorner(x, y, width, height, radius) {
  // Top-left corner
  if (x < radius && y < radius) {
    const dx = radius - x;
    const dy = radius - y;
    return (dx * dx + dy * dy) > (radius * radius);
  }
  // Top-right corner
  if (x >= width - radius && y < radius) {
    const dx = x - (width - radius);
    const dy = radius - y;
    return (dx * dx + dy * dy) > (radius * radius);
  }
  // Bottom-left corner
  if (x < radius && y >= height - radius) {
    const dx = radius - x;
    const dy = y - (height - radius);
    return (dx * dx + dy * dy) > (radius * radius);
  }
  // Bottom-right corner
  if (x >= width - radius && y >= height - radius) {
    const dx = x - (width - radius);
    const dy = y - (height - radius);
    return (dx * dx + dy * dy) > (radius * radius);
  }
  return false;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = makeCRCTable();

  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCRCTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

// Generate all icons
const iconsDir = __dirname;

console.log('Generating PWA icons...\n');

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);

  const png = createPNG(size, size);
  fs.writeFileSync(filepath, png);

  console.log(`Created: ${filename} (${png.length} bytes)`);
});

console.log('\nAll icons generated successfully!');
