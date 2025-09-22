const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

// Configurar ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: "uploads/" });

// Endpoint de conversión WAV → MP3
app.post("/convert", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).send("No se subió ningún archivo");

  const inputPath = req.file.path;
  const outputPath = path.join("outputs", req.file.originalname + ".mp3");

  ffmpeg(inputPath)
    .audioCodec("libmp3lame")
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

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
