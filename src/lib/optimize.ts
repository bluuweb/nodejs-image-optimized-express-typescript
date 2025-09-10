import sharp from "sharp";

export const optimizeImage = async (
  buffer: Buffer<ArrayBufferLike>,
  quality: number = 70
) => {
  // await sharp(buffer).metadata()

  return await sharp(buffer)
    .jpeg({
      quality: Math.max(10, Math.min(100, quality)), // Asegurar que esté entre 10-100
      mozjpeg: true,
      progressive: true, // Una imagen progresiva no descarga de arriba a abajo (como la baseline), sino que primero muestra una versión borrosa de baja calidad y, a medida que se descarga más, va ganando nitidez.
    })
    .toBuffer();
};
