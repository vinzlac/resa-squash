import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken } from '@/app/utils/auth';
import { ErrorCode } from '@/app/types/errors';
import { createCanvas, loadImage } from 'canvas';
import jsQR from 'jsqr';

export async function POST(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json(
      { error: { code: ErrorCode.UNAUTHORIZED, message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const { qrCodeUri } = await request.json();
    
    if (!qrCodeUri || !qrCodeUri.startsWith('data:image/')) {
      return NextResponse.json(
        { error: { code: ErrorCode.INVALID_PARAMETER, message: 'qrCodeUri invalide' } },
        { status: 400 }
      );
    }

    // Extraire le base64 de l'URI
    const base64Data = qrCodeUri.split(',')[1];
    
    // Convertir en Buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('📤 Image reçue - Taille:', imageBuffer.length, 'bytes');
    
    // Charger l'image avec canvas
    const image = await loadImage(imageBuffer);
    
    console.log('📤 Image chargée - Dimensions:', image.width, 'x', image.height);
    
    console.log('📤 Utilisation de jsQR avec prétraitement avancé...');
    
    // Créer un canvas avec l'image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    // Obtenir les données de l'image
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    
    // Améliorer l'image pour la détection QR
    const processedImageData = new Uint8ClampedArray(imageData.data);
    
    // Appliquer plusieurs améliorations
    for (let i = 0; i < processedImageData.length; i += 4) {
      const r = processedImageData[i];
      const g = processedImageData[i + 1];
      const b = processedImageData[i + 2];
      
      // Convertir en niveaux de gris
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      // Améliorer le contraste
      const contrast = gray > 140 ? 255 : 0; // Seuil ajusté
      
      processedImageData[i] = contrast;     // R
      processedImageData[i + 1] = contrast; // G
      processedImageData[i + 2] = contrast; // B
      processedImageData[i + 3] = 255;      // A
    }
    
    console.log('📤 Image traitée - Dimensions:', imageData.width, 'x', imageData.height);
    
    // Essayer de décoder avec jsQR
    const code = jsQR(processedImageData, imageData.width, imageData.height);
    
    if (code) {
      console.log('📥 QR Code détecté avec jsQR:', code.data);
      
      const codes = [{
        data: code.data,
        location: code.location
      }];
      
      return NextResponse.json({
        success: true,
        qrCodes: codes,
        totalCodes: codes.length,
        format: qrCodeUri.split(';')[0].split('/')[1],
        size: imageBuffer.length,
        debug: {
          imageWidth: image.width,
          imageHeight: image.height,
          codesFound: codes.length
        }
      });
    } else {
      // Si pas de QR code trouvé, essayer avec une image redimensionnée
      console.log('🔍 Aucun QR code avec l\'image originale, essai avec redimensionnement...');
      
      const scaleFactor = 3;
      const scaledCanvas = createCanvas(image.width * scaleFactor, image.height * scaleFactor);
      const scaledCtx = scaledCanvas.getContext('2d');
      
      // Désactiver le lissage pour garder les pixels nets
      scaledCtx.imageSmoothingEnabled = false;
      scaledCtx.drawImage(image, 0, 0, image.width * scaleFactor, image.height * scaleFactor);
      
      const scaledImageData = scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
      
      // Appliquer le même traitement sur l'image redimensionnée
      const scaledProcessedData = new Uint8ClampedArray(scaledImageData.data);
      for (let i = 0; i < scaledProcessedData.length; i += 4) {
        const r = scaledProcessedData[i];
        const g = scaledProcessedData[i + 1];
        const b = scaledProcessedData[i + 2];
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const contrast = gray > 140 ? 255 : 0;
        
        scaledProcessedData[i] = contrast;
        scaledProcessedData[i + 1] = contrast;
        scaledProcessedData[i + 2] = contrast;
        scaledProcessedData[i + 3] = 255;
      }
      
      const scaledCode = jsQR(scaledProcessedData, scaledCanvas.width, scaledCanvas.height);
      
      if (scaledCode) {
        console.log('📥 QR Code détecté avec image redimensionnée:', scaledCode.data);
        
        const codes = [{
          data: scaledCode.data,
          location: scaledCode.location
        }];
        
        return NextResponse.json({
          success: true,
          qrCodes: codes,
          totalCodes: codes.length,
          format: qrCodeUri.split(';')[0].split('/')[1],
          size: imageBuffer.length,
          debug: {
            imageWidth: image.width,
            imageHeight: image.height,
            scaledWidth: scaledCanvas.width,
            scaledHeight: scaledCanvas.height,
            codesFound: codes.length
          }
        });
      } else {
        console.log('❌ Aucun QR code détecté même avec redimensionnement');
        return NextResponse.json({
          success: false,
          error: 'Aucun QR code détecté dans l\'image',
          debug: {
            imageWidth: image.width,
            imageHeight: image.height,
            scaledWidth: scaledCanvas.width,
            scaledHeight: scaledCanvas.height
          }
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('Erreur lors du décodage du QR code:', error);
    return NextResponse.json(
      { error: { code: ErrorCode.INTERNAL_SERVER_ERROR, message: 'Erreur serveur' } },
      { status: 500 }
    );
  }
}
