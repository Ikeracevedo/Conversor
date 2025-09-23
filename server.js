const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: "uploads/" });

// Endpoint: convertir WAV → MP3
app.post("/convert", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No se subió ningún archivo");

  const bitrate = req.body.bitrate || "192k"; // parámetro opcional
  const inputPath = req.file.path;

  // nombre base sin extensión
  const baseName = path.parse(req.file.originalname).name;
  const outputPath = path.join("outputs", baseName + ".mp3");

  ffmpeg(inputPath)
    .audioCodec("libmp3lame")
    .audioBitrate(bitrate)
    .save(outputPath)
    .on("end", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);   // borrar original
        fs.unlinkSync(outputPath);  // borrar convertido después de descargar
      });
    })
    .on("error", (err) => {
      console.error("Error:", err);
      res.status(500).send("Error en la conversión");
    });
});

// crea carpetas si no existen
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// servir frontend estático
app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});


