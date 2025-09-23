# 🎵 Conversor WAV → MP3

Aplicación web sencilla para convertir archivos **.wav** en **.mp3** usando **Node.js + Express + Multer + FFmpeg** en el backend, y un **frontend minimalista en HTML/JS**.

---

## 🚀 Características

- Subida de archivos `.wav` desde la UI (drag & drop o input).
- Conversión a `.mp3` con bitrate seleccionable (128k, 192k, 256k, 320k).
- Descarga automática del archivo convertido.
- Validaciones en el cliente: tipo de archivo y tamaño máximo.
- Limpieza automática de archivos temporales en el servidor.

---

## 📂 Estructura del proyecto

    wav-to-mp3/
    ├── server.js # Backend con Express + Multer + FFmpeg
    ├── package.json # Dependencias y scripts
    ├── uploads/ # Carpeta temporal para archivos subidos
    ├── outputs/ # Carpeta temporal para resultados
    ├── public/ # Frontend
    │ ├── index.html # UI principal
    │ ├── app.js # Lógica frontend (validaciones, fetch, progreso)
    │ └── styles.css # Estilos opcionales (usamos Tailwind por CDN)
    └── README.md


---

## 🛠️ Requisitos previos

- [Node.js](https://nodejs.org/) (v16 o superior recomendado)
- NPM o Yarn
- FFmpeg (ya integrado con [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static))

---

## 📥 Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/usuario/wav-to-mp3.git
   cd wav-to-mp3


2. Instala dependencias:

   ```bash
    npm install

3. Crea las carpetas necesarias:

   ```bash
    mkdir -p uploads outputs

---

## ▶️ Uso

1. Inicia el servidor:

   ```bash
   node server.js


2. Abre el navegador en:

   ```bash
    http://localhost:3000
    

3. Sube un archivo .wav, elige el bitrate y presiona Convertir.

4. Descarga automática del mp3
