import express, { json, urlencoded } from "express";
import multer from "multer";
import { optimizeImage } from "./lib/optimize";

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static("public"));
app.use(json());
app.use(urlencoded({ extended: true }));

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.json({ ok: false, msg: "No se puede leer el req.file" });
  }

  const { buffer } = req.file;

  if (!buffer) {
    return res.json({ ok: false, msg: "No se puede leer el buffer" });
  }

  try {
    const optimizedBuffer = await optimizeImage(buffer);
    res.set("Content-Type", "image/jpeg");
    res.set(
      "Content-Disposition",
      "attachment; filename=imagen-optimizada.jpg"
    );
    res.send(optimizedBuffer);
  } catch (error) {
    console.log(error);
    res.json({ ok: false, error });
  }
});

app.listen(3000, () => {
  console.log("server andando todo cachilupi");
});
