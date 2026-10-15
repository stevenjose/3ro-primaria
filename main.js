// ==========================================
// CONTROL DE VERSIÓN (v2.5 - Google Calendar)
// ==========================================
const APP_VERSION = "2.5";

document.getElementById("page-title").textContent = `Splat-Portal 3º Primaria v${APP_VERSION}`;
document.getElementById("version-badge-text").textContent = `v${APP_VERSION}`;
document.getElementById("version-footer-text").textContent = APP_VERSION;

// ==========================================
// DATOS DE RESPALDO PARA PRUEBAS EN LOCAL
// ==========================================
const fallbackExamenes = [
  {
    fecha: "20 OCT",
    materia: "Inglés",
    titulo: "Unit 1: Animals & Grammar",
    color: "#00f5d4",
    estado: "proximo",
  },
  {
    fecha: "21 OCT",
    materia: "Matemáticas",
    titulo: "Las Horas del Reloj",
    color: "#eaff00",
    estado: "proximo",
    fechaCompleta: "20261021T090000Z/20261021T100000Z"
  },
  {
    fecha: "24 OCT",
    materia: "Matemáticas",
    titulo: "Tablas y Restas Llevando",
    color: "#eaff00",
    estado: "proximo",
  },
  {
    fecha: "10 OCT",
    materia: "Medi",
    titulo: "Control Unidad 3",
    color: "#ff006e",
    estado: "pasado",
  },
];

const fallbackMaterias = [
  {
    id: "english",
    titulo: "Inglés",
    icono: "fa-solid fa-language",
    descripcion:
      "Repaso de vocabulario con Robo-Teacher 3D y la Guía Interactiva de Gramática (It is vs They are).",
    enlaces: [
      {
        texto: "▶ JUGAR TEST",
        url: "https://stevenjose.github.io/examen-one-ingles/",
      },
      {
        texto: "📖 GUÍA GRAMÁTICA",
        url: "https://stevenjose.github.io/gram-tica/",
      },
    ],
  },
  {
    id: "maths",
    titulo: "Matemáticas",
    icono: "fa-solid fa-calculator",
    descripcion:
      "Jueguecitos interactivos para practicar las tablas de multiplicar, aprender a restar llevando y leer el reloj analógico.",
    enlaces: [
      {
        texto: "▶ TABLAS MULTIPLICAR",
        url: "https://stevenjose.github.io/tabla-multiplicar/",
      },
      {
        texto: "✏️ RESTAS LLEVANDO",
        url: "https://stevenjose.github.io/restas-llevando/",
      },
      {
        texto: "⏰ EL RELOJ",
        url: "https://stevenjose.github.io/reloj-analogico/",
      }
    ],
  },
  {
    id: "medi",
    titulo: "Medi",
    icono: "fa-solid fa-earth-americas",
    descripcion:
      "Guías y test interactivos de la Unidad 3 para afianzar conceptos clave de forma visual y sencilla.",
    enlaces: [
      {
        texto: "▶ ACCEDER UNIDAD 3",
        url: "https://stevenjose.github.io/unidad-3-medi-pro/",
      },
    ],
  },
  {
    id: "drive",
    titulo: "Documentos",
    icono: "fa-solid fa-folder-open",
    descripcion:
      "Carpeta compartida en la nube para consultar, subir y descargar fichas, esquemas y materiales de clase.",
    enlaces: [
      {
        texto: "📂 ABRIR CARPETA DRIVE",
        url: "https://drive.google.com/drive/folders/1i1NMoN6iZmiviaS9UngoK6qGMkx2pgeY",
      },
    ],
  },
];

// ==========================================
// SINTETIZADOR DE SONIDOS DE TINTA (SPLATOON)
// ==========================================
let soundEnabled = true;
let inkLevel = 45;
const splatPalette = ["#eaff00", "#ff006e", "#00f5d4", "#6023f5", "#ff5400"];

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx && AudioCtx) {
    audioCtx = new AudioCtx();
  }
}

// Sonido de gota grande al hacer clic
function playSplatSound() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";

  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(130, now + 0.06);
  osc.frequency.exponentialRampToValueAtTime(580, now + 0.13);

  gain.gain.setValueAtTime(0.13, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

// Sonido suave de burbuja al arrastrar la pluma pintando
function playBrushStreamSound() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";

  const randomFreq = 280 + Math.random() * 320;
  osc.frequency.setValueAtTime(randomFreq, now);
  osc.frequency.exponentialRampToValueAtTime(randomFreq * 1.4, now + 0.045);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById("sound-icon");
  const btn = document.getElementById("sound-btn");
  if (soundEnabled) {
    icon.className = "fa-solid fa-volume-high";
    btn.style.background = "#00f5d4";
    playSplatSound();
  } else {
    icon.className = "fa-solid fa-volume-xmark";
    btn.style.background = "#64748b";
  }
}

// ==========================================
// RÁFAGA DE TINTA CON LA PLUMA (CLIC Y ARRASTRAR)
// ==========================================
let isPainting = false;
let lastSprayTime = 0;
let activeStreamColor = splatPalette[0];

function addInkProgress(amount) {
  inkLevel = Math.min(100, +(inkLevel + amount).toFixed(1));
  document.getElementById("ink-val").textContent = Math.floor(inkLevel);
  document.getElementById("ink-fill").style.width = `${inkLevel}%`;
}

// Mancha principal al hacer clic
function shootRandomInk(e) {
  playSplatSound();
  addInkProgress(3);

  const splat = document.createElement("div");
  splat.className = "click-splat";
  const randomColor =
    splatPalette[Math.floor(Math.random() * splatPalette.length)];
  activeStreamColor = randomColor;
  splat.style.background = randomColor;
  splat.style.boxShadow = `0 0 12px ${randomColor}`;

  const x = e ? e.clientX : window.innerWidth / 2;
  const y = e ? e.clientY : 120;
  splat.style.left = `${x}px`;
  splat.style.top = `${y}px`;

  document.body.appendChild(splat);
  setTimeout(() => splat.remove(), 1200);
}

// Chorro de gotas al arrastrar la pluma presionada
function spawnInkTrail(x, y) {
  const now = Date.now();
  if (now - lastSprayTime < 28) return; 
  lastSprayTime = now;

  playBrushStreamSound();
  addInkProgress(0.4);

  const dropsCount = 2;
  for (let i = 0; i < dropsCount; i++) {
    const drop = document.createElement("div");
    drop.className = "trail-splat";

    const size = i === 0 ? 22 + Math.random() * 20 : 8 + Math.random() * 12;
    const offsetX = i === 0 ? 0 : (Math.random() - 0.5) * 38;
    const offsetY = i === 0 ? 0 : (Math.random() - 0.5) * 38;

    const color =
      Math.random() > 0.25
        ? activeStreamColor
        : splatPalette[Math.floor(Math.random() * splatPalette.length)];

    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    drop.style.background = color;
    drop.style.boxShadow = `0 0 8px ${color}`;
    drop.style.left = `${x + offsetX}px`;
    drop.style.top = `${y + offsetY}px`;

    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), 950);
  }
}

// Eventos globales de ratón (PC)
window.addEventListener("mousedown", (e) => {
  isPainting = true;
  activeStreamColor =
    splatPalette[Math.floor(Math.random() * splatPalette.length)];
  spawnInkTrail(e.clientX, e.clientY);
});

window.addEventListener("mousemove", (e) => {
  if (!isPainting) return;
  spawnInkTrail(e.clientX, e.clientY);
});

window.addEventListener("mouseup", () => {
  isPainting = false;
});

// Eventos táctiles (Móvil / Tablet)
window.addEventListener("touchstart", (e) => {
    isPainting = true;
    activeStreamColor = splatPalette[Math.floor(Math.random() * splatPalette.length)];
    const touch = e.touches[0];
    if (touch) spawnInkTrail(touch.clientX, touch.clientY);
  }, { passive: true }
);

window.addEventListener("touchmove", (e) => {
    if (!isPainting) return;
    const touch = e.touches[0];
    if (touch) spawnInkTrail(touch.clientX, touch.clientY);
  }, { passive: true }
);

window.addEventListener("touchend", () => {
  isPainting = false;
});

// ==========================================
// RENDERIZADO DE CALENDARIO Y MATERIAS
// ==========================================
function renderExamenes(examenes) {
  const calContainer = document.getElementById("calendar-container");
  examenes.sort((a, b) => (a.estado === "pasado" ? 1 : -1));

  calContainer.innerHTML = examenes
    .map((ex) => {
      const esPasado = ex.estado === "pasado";
      const claseCard = esPasado ? "calendar-card pasado" : "calendar-card";
      const borderColor = esPasado ? "#64748b" : ex.color || "#00f5d4";
      
      let badgeHTML = "";
      if (esPasado) {
        badgeHTML = '<span class="splat-badge badge-done">✓ COMBATE GANADO</span>';
      } else {
        const gcalLink = ex.fechaCompleta
          ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ex.titulo)}&dates=${ex.fechaCompleta}&details=Examen+de+${encodeURIComponent(ex.materia)}`
          : "#";

        badgeHTML = `
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <span class="splat-badge badge-next">⚡ PRÓXIMO COMBATE</span>
              ${ex.fechaCompleta ? `
              <a href="${gcalLink}" target="_blank" class="splat-badge" style="background:#fff; color:#000; text-decoration:none; display:inline-flex; align-items:center; gap:4px; border-color:#000;" onclick="event.stopPropagation()">
                  <i class="fa-brands fa-google"></i> Guardar
              </a>` : ""}
          </div>
        `;
      }

      return `
            <div class="${claseCard}" style="border-left-color: ${borderColor}" onclick="shootRandomInk(event)">
                <div class="cal-date-box" style="background: ${borderColor}">
                    📅<br>${ex.fecha}
                </div>
                <div class="cal-info">
                    <h4>${ex.titulo}</h4>
                    <p>Modo: <strong>${ex.materia}</strong></p>
                    <div style="margin-top: 6px;">${badgeHTML}</div>
                </div>
            </div>
        `;
    })
    .join("");
}

const subjectInkColors = {
  english: "#00f5d4", 
  maths: "#eaff00", 
  medi: "#ff006e", 
  drive: "#ff9e00", 
};

function renderMaterias(materias) {
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = materias
    .map((mat) => {
      const inkColor = subjectInkColors[mat.id] || "#eaff00";
      const enlacesHTML = mat.enlaces
        .map(
          (link) => `
            <a href="${link.url}" target="_blank" class="btn-splat" onclick="shootRandomInk(event); event.stopPropagation();">
                ${link.texto}
            </a>
        `,
        )
        .join("");

      return `
            <div class="splat-card" style="--ink-color: ${inkColor}">
                <div class="card-corner-splat"></div>
                <div>
                    <div class="card-icon-badge">
                        <i class="${mat.icono}"></i>
                    </div>
                    <h3 class="card-title">${mat.titulo}</h3>
                    <p class="card-desc">${mat.descripcion}</p>
                </div>
                <div class="links-group">
                    ${enlacesHTML}
                </div>
            </div>
        `;
    })
    .join("");
}

// Cargar JSON (con fallback para local)
fetch("examenes.json")
  .then((res) => res.json())
  .then((data) => renderExamenes(data))
  .catch(() => renderExamenes(fallbackExamenes));

fetch("materias.json")
  .then((res) => res.json())
  .then((data) => renderMaterias(data))
  .catch(() => renderMaterias(fallbackMaterias));