const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const srcImagePath = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a4abe219-5cd0-4bb9-a064-b44e489629bf\\media__1779642843159.png';
const publicDir = 'c:\\Users\\Lenovo\\Desktop\\PROYECTO STACK\\metodo-stack - base -V2 DIA 22 DE ABRIL 2026 copia\\public';

async function main() {
  console.log('Iniciando procesamiento de imágenes sin márgenes blancos vacíos...');
  
  if (!fs.existsSync(srcImagePath)) {
    console.error(`Error: No se encontró la imagen origen en: ${srcImagePath}`);
    process.exit(1);
  }

  const imgBuffer = fs.readFileSync(srcImagePath);
  const imgBase64 = imgBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${imgBase64}`;

  console.log('Iniciando Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('Procesando imágenes en el navegador...');
  
  const result = await page.evaluate(async (srcDataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // --- 1. PROCESAR VERSIÓN DESKTOP (hero.webp) ---
        // Ancho optimizado para escritorio: 1200px (mantiene proporciones originales)
        const desktopWidth = 1200;
        const desktopHeight = Math.round((desktopWidth / originalWidth) * originalHeight);
        
        const canvasDesktop = document.createElement('canvas');
        canvasDesktop.width = desktopWidth;
        canvasDesktop.height = desktopHeight;
        const ctxDesktop = canvasDesktop.getContext('2d');
        ctxDesktop.imageSmoothingEnabled = true;
        ctxDesktop.imageSmoothingQuality = 'high';
        ctxDesktop.drawImage(img, 0, 0, desktopWidth, desktopHeight);
        
        const desktopWebp = canvasDesktop.toDataURL('image/webp', 0.85);
        
        // --- 2. PROCESAR VERSIÓN MÓVIL OPTIMIZADA (hero-mobile.webp) ---
        // Para celulares, mantendremos el aspecto horizontal original pero a menor escala (640px de ancho)
        // para que se muestre como un banner delgado y elegante en el centro de la tarjeta,
        // eliminando por completo los márgenes vacíos superiores/inferiores que hacían ver desuniforme el celular.
        const mobileWidth = 640; 
        const mobileHeight = Math.round((mobileWidth / originalWidth) * originalHeight);
        
        const canvasMobile = document.createElement('canvas');
        canvasMobile.width = mobileWidth;
        canvasMobile.height = mobileHeight;
        const ctxMobile = canvasMobile.getContext('2d');
        
        ctxMobile.imageSmoothingEnabled = true;
        ctxMobile.imageSmoothingQuality = 'high';
        ctxMobile.drawImage(img, 0, 0, mobileWidth, mobileHeight);
        
        const mobileWebp = canvasMobile.toDataURL('image/webp', 0.82);
        
        resolve({
          desktop: desktopWebp,
          mobile: mobileWebp,
          dims: {
            original: { w: originalWidth, h: originalHeight },
            desktop: { w: desktopWidth, h: desktopHeight },
            mobile: { w: mobileWidth, h: mobileHeight }
          }
        });
      };
      img.onerror = (err) => reject('Error al cargar la imagen');
      img.src = srcDataUrl;
    });
  }, dataUrl);

  await browser.close();
  
  console.log('Imagen procesada con éxito.');
  console.log(`- Original: ${result.dims.original.w}x${result.dims.original.h}`);
  console.log(`- Desktop: ${result.dims.desktop.w}x${result.dims.desktop.h}`);
  console.log(`- Mobile (horizontal unpadded): ${result.dims.mobile.w}x${result.dims.mobile.h}`);
  
  // Guardar hero.webp
  const desktopData = result.desktop.replace(/^data:image\/webp;base64,/, '');
  const desktopPath = path.join(publicDir, 'hero.webp');
  fs.writeFileSync(desktopPath, Buffer.from(desktopData, 'base64'));
  console.log(`- Guardado: ${desktopPath} (${Math.round(fs.statSync(desktopPath).size / 1024)} KB)`);

  // Guardar hero-mobile.webp
  const mobileData = result.mobile.replace(/^data:image\/webp;base64,/, '');
  const mobilePath = path.join(publicDir, 'hero-mobile.webp');
  fs.writeFileSync(mobilePath, Buffer.from(mobileData, 'base64'));
  console.log(`- Guardado: ${mobilePath} (${Math.round(fs.statSync(mobilePath).size / 1024)} KB)`);

  console.log('¡Procesamiento completo!');
}

main().catch(err => {
  console.error('Error durante la ejecución del script:', err);
});
