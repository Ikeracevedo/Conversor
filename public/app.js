// ===== Config =====
const MAX_SIZE_MB = 100; // límite
const ACCEPTED_MIME = ['audio/wav'];
const ACCEPTED_EXT = ['.wav'];

// ===== Elementos del DOM =====
const form = document.getElementById('convert-form');
const inputFile = document.getElementById('file');
const bitrateSel = document.getElementById('bitrate');       // <- corregido
const btn = document.getElementById('btn-convertir');
const msgBox = document.getElementById('msg');
const progressWrap = document.getElementById('progress-wrap'); // <- corregido
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const dropArea = document.getElementById('drop-area');
const fileMeta = document.getElementById('file-meta'); // opcional

// ===== Helpers de UI =====
function setButtonDisabled(disabled) {
  if (disabled) btn.setAttribute('disabled', '');
  else btn.removeAttribute('disabled');
}

function showMsg(type, text) {
  // type: 'success' | 'error' | 'info' | ''
  if (!type) { msgBox.innerHTML = ''; return; } // <- corregido
  const classes = {
    success: 'text-green-700 bg-green-50 border border-green-200 rounded-md p-3',
    error:   'text-red-700 bg-red-50 border border-red-200 rounded-md p-3',
    info:    'text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3',
  };
  msgBox.innerHTML = `<div class="${classes[type] || ''}">${text}</div>`;
}

function resetProgress() {
  progressWrap.classList.add('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = 'Preparando…';
}

function showProgress(visible, percent = 0, label = 'Preparando…') {
  if (!visible) { resetProgress(); return; }
  progressWrap.classList.remove('hidden');
  progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  progressText.textContent = label;
}

// Drag & Drop highlight
function setDropHighlight(on) {
  if (!dropArea) return;
  if (on) {
    dropArea.classList.remove('border-gray-300', 'bg-white');
    dropArea.classList.add('border-gray-900', 'bg-gray-50');
  } else {
    dropArea.classList.add('border-gray-300', 'bg-white');
    dropArea.classList.remove('border-gray-900', 'bg-gray-50');
  }
}

// ===== Validaciones =====
function hasAcceptedExtension(name) {
  const lower = name.toLowerCase();
  return ACCEPTED_EXT.some(ext => lower.endsWith(ext));
}

function isAcceptedFile(file) {
  const byMime = ACCEPTED_MIME.includes(file.type);
  const byExt  = hasAcceptedExtension(file.name);
  return byMime || byExt;
}

function isWithinSize(file) {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB <= MAX_SIZE_MB;                   // <- ahora booleano
}

function describeFile(file) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  return `${file.name} — ${sizeMB} MB`;
}

// ===== Reset al cambiar archivo/bitrate =====
function resetUI() {
  setButtonDisabled(false);
  showMsg('', '');
  resetProgress();
  if (fileMeta) fileMeta.textContent = '';        // <- corregido uso de fileMeta
}

// ===== Eventos: selección de archivo =====
inputFile.addEventListener('change', () => {
  resetUI();
  const f = inputFile.files?.[0];
  if (!f) return;

  if (fileMeta) fileMeta.textContent = describeFile(f);

  if (!isAcceptedFile(f)) {
    showMsg('error', 'Archivo no válido. Solo se acepta .wav');
    setButtonDisabled(true);
    return;
  }
  if (!isWithinSize(f)) {
    showMsg('error', `El archivo supera el límite de ${MAX_SIZE_MB} MB.`);
    setButtonDisabled(true);
    return;
  }

  showMsg('info', 'Archivo válido. Puedes convertir.');
  setButtonDisabled(false);
});

// ===== Drag & drop =====
;['dragenter','dragover'].forEach(evt =>
  dropArea?.addEventListener(evt, (e) => {
    e.preventDefault(); e.stopPropagation();
    setDropHighlight(true);
  })
);

;['dragleave','dragend','drop'].forEach(evt =>
  dropArea?.addEventListener(evt, (e) => {
    e.preventDefault(); e.stopPropagation();
    if (evt !== 'drop') setDropHighlight(false);
  })
);

dropArea?.addEventListener('drop', (e) => {
  setDropHighlight(false);
  const dt = e.dataTransfer;
  if (!dt || !dt.files || dt.files.length === 0) return;
  const f = dt.files[0];

  // Asignar al input
  const dataTransfer = new DataTransfer();            // <- mayúscula
  dataTransfer.items.add(f);
  inputFile.files = dataTransfer.files;

  inputFile.dispatchEvent(new Event('change'));
});

// ===== Envío real al backend =====
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const f = inputFile.files?.[0];
  if (!f) return showMsg('error', 'Primero selecciona un archivo .wav');
  if (!isAcceptedFile(f)) return showMsg('error', 'Archivo no válido. Solo se acepta .wav');
  if (!isWithinSize(f)) return showMsg('error', `El archivo supera el límite de ${MAX_SIZE_MB} MB.`);

  const bitrate = bitrateSel.value || '192k';

  setButtonDisabled(true);
  showMsg('info', 'Validando archivo…');
  showProgress(false);

  const fd = new FormData();
  fd.append('file', f);          // nombre de campo que espera multer
  fd.append('bitrate', bitrate);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/convert');  // coincide con tu backend
  xhr.responseType = 'blob';

  xhr.upload.onprogress = (evt) => {
    if (!evt.lengthComputable) return;
    const pct = Math.round((evt.loaded / evt.total) * 100);
    showProgress(true, pct, pct < 100 ? 'Subiendo…' : 'Subida completada');
  };

  xhr.onload = () => {
    if (xhr.status !== 200) {
      showMsg('error', `Error del servidor: ${xhr.status} ${xhr.responseText || ''}`);
      setButtonDisabled(false);
      showProgress(false);
      return;
    }

    // Conversión terminada → descargar
    showProgress(true, 100, 'Convirtiendo…');
    const blob = xhr.response;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (f.name || 'audio').replace(/\.wav$/i, '') + '.mp3';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);

    showMsg('success', '¡Listo! Descarga completada.');
    setButtonDisabled(false);
    showProgress(false);
  };

  xhr.onerror = () => {
    showMsg('error', 'Error de red durante la subida/conversión.');
    setButtonDisabled(false);
    showProgress(false);
  };

  xhr.send(fd);
});

// Limpiar mensajes duros al cambiar bitrate
bitrateSel.addEventListener('change', () => {
  if (msgBox.textContent.includes('Archivo supera') || msgBox.textContent.includes('no válido')) {
    showMsg('', '');
  }
});

console.log('[frontend] app.js cargado 🎧');
