import express, {
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import multer from "multer";
import { optimizeImage } from "./lib/optimize";

const app = express();

// Aplicar un rate limit (límite de solicitudes) por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// activa protecciones por defecto
app.use(helmet()); // En Express (Node.js), helmet es un middleware de seguridad que ayuda a proteger tu aplicación configurando automáticamente ciertos encabezados HTTP

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    if (!/^image\/(jpe?g|png|webp)$/i.test(file.mimetype)) {
      return cb(new Error("Tipo de archivo no permitido"));
    }
    cb(null, true);
  },
});

app.use(
  express.static("public", {
    etag: true, // Usar caching inteligente (etag + maxAge)
    maxAge: "1h",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff"); // Añadir una capa de seguridad extra con X-Content-Type-Options: nosniff
    },
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se puede leer el archivo" });
  }

  const { buffer, mimetype } = req.file;
  const quality = parseInt(req.body.quality) || 80;

  if (!/^image\/(jpe?g|png|webp)$/i.test(mimetype)) {
    return res
      .status(400)
      .json({
        error:
          "Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP.",
      });
  }

  if (!buffer) {
    return res.status(400).json({ error: "No se puede procesar el archivo" });
  }

  // Validar calidad
  if (quality < 10 || quality > 100) {
    return res
      .status(400)
      .json({ error: "La calidad debe estar entre 10 y 100" });
  }

  try {
    const optimizedBuffer = await optimizeImage(buffer, quality);
    res.set("Content-Type", "image/jpeg");
    res.set(
      "Content-Disposition",
      "attachment; filename=imagen-optimizada.jpg"
    );
    res.send(optimizedBuffer);
  } catch (error) {
    console.error("Error al optimizar imagen:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al procesar la imagen" });
  }
});

// Manejo de errores de multer
interface MulterError extends Error {
  code: string;
}

app.use(
  (err: MulterError | Error, _: Request, res: Response, next: NextFunction) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        ok: false,
        msg: `Ocurrió un error: ${err.message}`,
      });
    }

    next();
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server andando todo cachilupi: http://localhost:" + PORT);
});
