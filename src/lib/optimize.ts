import sharp from "sharp";

export const optimizeImage = async (buffer: Buffer<ArrayBufferLike>) => {
  // await sharp(buffer).metadata()

  return await sharp(buffer)
    .jpeg({
      quality: 70,
      mozjpeg: true,
      progressive: true, // Una imagen progresiva no descarga de arriba a abajo (como la baseline), sino que primero muestra una versión borrosa de baja calidad y, a medida que se descarga más, va ganando nitidez.
    })
    .toBuffer();
};
