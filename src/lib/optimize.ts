import sharp from "sharp";

export const optimizeImage = async (imageURL: Buffer<ArrayBufferLike>) => {
  return await sharp(imageURL)
    .jpeg({
      quality: 70,
      mozjpeg: true,
      progressive: true, // Una imagen progresiva no descarga de arriba a abajo (como la baseline), sino que primero muestra una versión borrosa de baja calidad y, a medida que se descarga más, va ganando nitidez.
    })
    .toBuffer();
};
