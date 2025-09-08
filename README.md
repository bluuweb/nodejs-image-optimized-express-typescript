# Compresor de Imágenes con Express y TypeScript

¡Bienvenido! Este proyecto es una aplicación web sencilla para optimizar imágenes JPEG usando Node.js, Express, TypeScript y Sharp. Permite subir una imagen desde el navegador y descargarla comprimida, lista para usar en la web.

## Características

- **Subida de imágenes** desde un formulario web.
- **Compresión y optimización** automática usando Sharp.
- **Descarga directa** de la imagen optimizada (ventana "guardar como").
- **Configuración progresiva** para mejor experiencia de carga en web.
- **Código modular y tipado** con TypeScript.

## Estructura del proyecto

```
├── public/
│   └── index.html           # Formulario web para subir imágenes
├── src/
│   ├── index.ts             # Servidor Express principal
│   ├── lib/
│   │   └── optimize.ts      # Función de optimización de imágenes
│   ├── original.jpg         # Imagen de ejemplo
│   ├── imagen-optimizada.jpg
│   ├── imagen-optimizada (1).jpg
│   ├── imagen-optimizada (2).jpg
│   ├── imagen-optimizada (3).jpg
│   ├── imagen-optimizada (4).jpg
├── package.json             # Dependencias y scripts
├── .gitignore
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/bluuweb/nodejs-image-optimized-express-typescript.git
   cd nodejs-image-optimized-express-typescript
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

## Uso

1. Abre `http://localhost:3000` en tu navegador.
2. Sube una imagen JPEG desde el formulario.
3. Automáticamente se descargará la imagen optimizada.

## ¿Cómo funciona?

- El formulario HTML envía la imagen al endpoint `/upload`.
- Express recibe el archivo usando `multer` (en memoria).
- La función `optimizeImage` (Sharp) procesa la imagen:
  - Calidad ajustada (`quality: 70` por defecto)
  - Compresión con `mozjpeg`
  - Imagen progresiva para mejor experiencia web
- El servidor responde con la imagen optimizada y fuerza la descarga.

## Personalización

Puedes modificar la calidad y otras opciones en `src/lib/optimize.ts`:

```typescript
sharp(imageBuffer).jpeg({
  quality: 80,
  progressive: true,
  chromaSubsampling: "4:4:4",
  mozjpeg: true,
});
```

Consulta la [documentación de Sharp](https://sharp.pixelplumbing.com/api-output#jpeg) para más configuraciones.

## Créditos

- [Express](https://expressjs.com/)
- [Sharp](https://sharp.pixelplumbing.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Multer](https://github.com/expressjs/multer)

---

¡Listo para optimizar imágenes de forma rápida y sencilla!
