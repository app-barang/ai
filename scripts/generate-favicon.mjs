import sharp from 'sharp';
import fs from 'fs';

const inputSvg = 'app/icon.svg';
const outputIco = 'public/favicon.ico';

async function generateFavicon() {
  try {
    // Generate multiple sizes for ICO
    const sizes = [16, 32, 48];
    const pngBuffers = await Promise.all(
      sizes.map(size => sharp(inputSvg, { density: 300 })
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer())
    );

    // Create ICO with multiple sizes
    await sharp(pngBuffers[0])
      .png()
      .toFile('public/favicon-16.png');
    await sharp(pngBuffers[1])
      .png()
      .toFile('public/favicon-32.png');
    await sharp(pngBuffers[2])
      .png()
      .toFile('public/favicon-48.png');

    // Create ICO using the 32px as main
    await sharp(pngBuffers[1])
      .png()
      .toFile('public/favicon.ico');

    // Also create apple-touch-icon
    await sharp(inputSvg, { density: 300 })
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile('public/apple-touch-icon.png');

    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();