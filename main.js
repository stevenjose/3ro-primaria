// ==========================================
// CONTROL DE VERSIÓN (v2.5 - Google Calendar)
// ==========================================
const APP_VERSION = "2.5";

document.getElementById("page-title").textContent =
  `Splat-Portal 3º Primaria v${APP_VERSION}`;
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
    fechaCompleta: "20261021T090000Z/20261021T100000Z",
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
      },
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

// Mancha principal al hacer clic (Ahora sí parece una salpicadura real)
function shootRandomInk(e) {
  playSplatSound();
  addInkProgress(3);

  let x = window.innerWidth / 2;
  let y = 120;
  if (e) {
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
  }

  const randomColor =
    splatPalette[Math.floor(Math.random() * splatPalette.length)];
  activeStreamColor = randomColor;

  const wrapper = document.createElement("div");
  wrapper.className = "click-splat-wrapper";
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;

  // 1. Mancha central
  const splat = document.createElement("div");
  splat.className = "click-splat";
  const centralSize = 35 + Math.random() * 20;
  splat.style.width = `${centralSize}px`;
  splat.style.height = `${centralSize}px`;
  splat.style.background = randomColor;
  splat.style.marginLeft = `-${centralSize / 2}px`;
  splat.style.marginTop = `-${centralSize / 2}px`;
  splat.style.setProperty("--rot", `${Math.random() * 360}deg`);
  wrapper.appendChild(splat);

  // 2. PICOS (Tentáculos de pintura que forman la estrella de la mancha)
  const spikeCount = 5 + Math.floor(Math.random() * 4); // 5 a 8 picos
  for (let i = 0; i < spikeCount; i++) {
    const spike = document.createElement("div");
    spike.className = "splat-spike";
    const length = 25 + Math.random() * 40; // Qué tan lejos llega la mancha
    const thickness = 5 + Math.random() * 8; // Grosor de las puntas
    spike.style.width = `${length}px`;
    spike.style.height = `${thickness}px`;
    spike.style.background = randomColor;
    spike.style.marginTop = `-${thickness / 2}px`;
    spike.style.setProperty("--rot", `${Math.random() * 360}deg`);
    wrapper.appendChild(spike);
  }

  // 3. Gotas satélites volando alrededor
  const satelliteCount = 6 + Math.floor(Math.random() * 6);
  for (let i = 0; i < satelliteCount; i++) {
    const satellite = document.createElement("div");
    satellite.className = "splat-satellite";
    const satSize = 5 + Math.random() * 10;
    satellite.style.width = `${satSize}px`;
    satellite.style.height = `${satSize}px`;
    satellite.style.background = randomColor;
    satellite.style.marginLeft = `-${satSize / 2}px`;
    satellite.style.marginTop = `-${satSize / 2}px`;

    const angle = Math.random() * 2 * Math.PI;
    const distance = 30 + Math.random() * 50;
    satellite.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    satellite.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    satellite.style.setProperty("--sz", `${0.5 + Math.random() * 0.8}`);
    wrapper.appendChild(satellite);
  }

  document.getElementById("ink-canvas").appendChild(wrapper);
  setTimeout(() => wrapper.remove(), 4000);
}

// Chorro de gotas al arrastrar / pintar continuo (Optimizado y asimétrico)
function spawnInkTrail(x, y) {
  const now = Date.now();
  if (now - lastSprayTime < 28) return;
  lastSprayTime = now;

  playBrushStreamSound();
  addInkProgress(0.3);

  const isMobile = window.innerWidth <= 768;
  const dropsCount = isMobile ? 3 : 2;

  for (let i = 0; i < dropsCount; i++) {
    const drop = document.createElement("div");
    drop.className = "trail-splat";

    const baseSize = isMobile ? 36 : 24;
    const size =
      i === 0
        ? baseSize + Math.random() * 22
        : baseSize / 2 + Math.random() * 14;

    // Desplazamientos asimétricos desordenados
    const offsetX = i === 0 ? 0 : (Math.random() - 0.5) * (isMobile ? 54 : 40);
    const offsetY = i === 0 ? 0 : (Math.random() - 0.5) * (isMobile ? 54 : 40);

    const color =
      Math.random() > 0.25
        ? activeStreamColor
        : splatPalette[Math.floor(Math.random() * splatPalette.length)];

    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    drop.style.background = color;
    drop.style.boxShadow = `0 0 6px ${color}`;

    // Creación de forma líquida e irregular única
    const r1 = 25 + Math.random() * 50;
    const r2 = 25 + Math.random() * 50;
    const r3 = 25 + Math.random() * 50;
    drop.style.borderRadius = `${r1}% ${100 - r1}% ${r2}% ${100 - r2}% / ${r3}% ${100 - r3}% ${100 - r2}% ${100 - r1}%`;
    drop.style.setProperty("--rot", `${Math.random() * 360}deg`);

    drop.style.left = `${x + offsetX}px`;
    drop.style.top = `${y + offsetY}px`;

    // ENVIAR AL LIENZO GLOBAL DE FUSIÓN (#ink-canvas)
    document.getElementById("ink-canvas").appendChild(drop);
    setTimeout(() => drop.remove(), 3500);
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
window.addEventListener(
  "touchstart",
  (e) => {
    isPainting = true;
    activeStreamColor =
      splatPalette[Math.floor(Math.random() * splatPalette.length)];
    const touch = e.touches[0];
    if (touch) spawnInkTrail(touch.clientX, touch.clientY);
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (!isPainting) return;
    const touch = e.touches[0];
    if (touch) spawnInkTrail(touch.clientX, touch.clientY);
  },
  { passive: true },
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
        badgeHTML =
          '<span class="splat-badge badge-done">✓ COMBATE GANADO</span>';
      } else {
        const gcalLink = ex.fechaCompleta
          ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ex.titulo)}&dates=${ex.fechaCompleta}&details=Examen+de+${encodeURIComponent(ex.materia)}`
          : "#";

        badgeHTML = `
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <span class="splat-badge badge-next">⚡ PRÓXIMO COMBATE</span>
              ${
                ex.fechaCompleta
                  ? `
              <a href="${gcalLink}" target="_blank" class="splat-badge" style="background:#fff; color:#000; text-decoration:none; display:inline-flex; align-items:center; gap:4px; border-color:#000;" onclick="event.stopPropagation()">
                  <i class="fa-brands fa-google"></i> Guardar
              </a>`
                  : ""
              }
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

// ==========================================
// CONTROL DE INSTALACIÓN PWA Y SERVICE WORKER
// ==========================================
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("El usuario aceptó instalar la PWA");
      }
      deferredPrompt = null;
    });
  } else {
    // Mensaje guía explicativo si se pulsa y el navegador ya la tiene o requiere menú manual
    alert(
      "💡 ¡Para instalar la app o crear un acceso directo:\n\n• En Móvil: Pulsa el menú (los 3 puntitos) de tu navegador y selecciona 'Añadir a la pantalla de inicio'.\n• En Ordenador: Haz clic en el icono de instalación 🖥️ en la barra de direcciones de Chrome o Edge.",
    );
  }
}

// Registrar el Service Worker con ruta relativa
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("Service Worker registrado con éxito"))
      .catch((err) => console.log("Error al registrar Service Worker:", err));
  });
}

// ==========================================
// SISTEMA MULTIJUGADOR: INKLINGS EN LÍNEA
// ==========================================
// REEMPLAZA ESTO CON TUS DATOS DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDPx-QCtj_Oc0nKlV4q8TIu4JT0hAPqv5Q",
  authDomain: "splat-portal.firebaseapp.com",
  databaseURL:"https://splat-portal-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "splat-portal",
  storageBucket: "splat-portal.firebasestorage.app",
  messagingSenderId: "133083337961",
  appId: "1:133083337961:web:b2cd425ec950375fe90c78",
  measurementId: "G-DZRYS1Y8N2",
};

// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referencias a la base de datos
const connectedRef = database.ref(".info/connected");
const onlineUsersRef = database.ref("online_users");

// Escuchar nuestra propia conexión
connectedRef.on("value", (snap) => {
  if (snap.val() === true) {
    // Generamos un "ID de jugador" temporal en la base de datos
    const userRef = onlineUsersRef.push();

    // MAGIA: Cuando cerramos la pestaña, Firebase elimina automáticamente nuestro ID
    userRef.onDisconnect().remove();

    // Anunciamos que estamos en línea
    userRef.set(true);
  }
});

// Escuchar cuántos usuarios totales hay en línea
onlineUsersRef.on("value", (snap) => {
  // Contamos cuántos nodos hay en 'online_users'
  const currentOnline = snap.numChildren();
  const counterElement = document.getElementById("online-count");
  if (counterElement) {
    counterElement.textContent = currentOnline;
  }
});

// ==========================================
// SISTEMA DE CHAT EN TIEMPO REAL (FIREBASE)
// ==========================================
const chatMessagesRef = database.ref("chat_messages");
let chatOpen = false;
let userNick = localStorage.getItem("splat_nick") || `Inkling_${Math.floor(100 + Math.random() * 900)}`;

// Poner nick inicial en el input
const nickInput = document.getElementById("chat-nick-input");
if (nickInput) {
  nickInput.value = userNick;
}

function saveNickname() {
  const val = document.getElementById("chat-nick-input").value.trim();
  if (val) {
    userNick = val;
    localStorage.setItem("splat_nick", userNick);
  }
}

function toggleChat() {
  chatOpen = !chatOpen;
  const chatWindow = document.getElementById("splat-chat-window");
  const badge = document.getElementById("chat-unread-badge");
  
  if (chatOpen) {
    chatWindow.classList.remove("chat-hidden");
    badge.style.display = "none";
    scrollChatToBottom();
  } else {
    chatWindow.classList.add("chat-hidden");
  }
}

function scrollChatToBottom() {
  const container = document.getElementById("chat-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Enviar mensaje
function sendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById("chat-text-input");
  const text = input.value.trim();
  if (!text) return;

  saveNickname();
  
  // Color aleatorio para este mensaje
  const color = splatPalette[Math.floor(Math.random() * splatPalette.length)];

  chatMessagesRef.push({
    user: userNick,
    text: text,
    color: color,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });

  input.value = "";
  playSplatSound();
}

// Escuchar mensajes en tiempo real (limitado a los últimos 35)
chatMessagesRef.limitToLast(35).on("child_added", (snapshot) => {
  const data = snapshot.val();
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-msg";
  msgDiv.style.background = data.color || "#00f5d4";
  msgDiv.style.color = "#07070a";

  const userSpan = document.createElement("span");
  userSpan.className = "chat-msg-user";
  userSpan.textContent = data.user || "Inkling";

  const textNode = document.createTextNode(data.text || "");

  msgDiv.appendChild(userSpan);
  msgDiv.appendChild(textNode);
  container.appendChild(msgDiv);

  scrollChatToBottom();

  // Si el chat está cerrado y entra un mensaje nuevo, avisar con el badge
  if (!chatOpen) {
    const badge = document.getElementById("chat-unread-badge");
    if (badge) badge.style.display = "inline-block";
  }
});

// ==========================================
// SISTEMA DE CHAT EN TIEMPO REAL (FIREBASE - TTL 2 HORAS)
// ==========================================
const chatMessagesRef = database.ref("chat_messages");
const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 horas en milisegundos

let chatOpen = false;
let userNick = localStorage.getItem("splat_nick") || `Inkling_${Math.floor(100 + Math.random() * 900)}`;

const nickInput = document.getElementById("chat-nick-input");
if (nickInput) {
  nickInput.value = userNick;
}

function saveNickname() {
  const val = document.getElementById("chat-nick-input").value.trim();
  if (val) {
    userNick = val;
    localStorage.setItem("splat_nick", userNick);
  }
}

function toggleChat() {
  chatOpen = !chatOpen;
  const chatWindow = document.getElementById("splat-chat-window");
  const badge = document.getElementById("chat-unread-badge");

  if (chatOpen) {
    chatWindow.classList.remove("chat-hidden");
    if (badge) badge.style.display = "none";
    scrollChatToBottom();
  } else {
    chatWindow.classList.add("chat-hidden");
  }
}

function scrollChatToBottom() {
  const container = document.getElementById("chat-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Función para purgar mensajes con más de 2 horas en Firebase
function cleanOldMessages() {
  const cutoffTime = Date.now() - TWO_HOURS_MS;
  chatMessagesRef
    .orderByChild("timestamp")
    .endAt(cutoffTime)
    .once("value", (snapshot) => {
      snapshot.forEach((child) => {
        child.ref.remove();
      });
    });
}

// Ejecutar limpieza al iniciar y luego cada 5 minutos
cleanOldMessages();
setInterval(cleanOldMessages, 5 * 60 * 1000);

// Enviar mensaje
function sendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById("chat-text-input");
  const text = input.value.trim();
  if (!text) return;

  saveNickname();

  const color = splatPalette[Math.floor(Math.random() * splatPalette.length)];

  chatMessagesRef.push({
    user: userNick,
    text: text,
    color: color,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });

  input.value = "";
  playSplatSound();

  // Limpiar mensajes expirados en cada envío
  cleanOldMessages();
}

// Escuchar mensajes nuevos en tiempo real
chatMessagesRef.limitToLast(40).on("child_added", (snapshot) => {
  const data = snapshot.val();
  const container = document.getElementById("chat-messages-container");
  if (!container || !data) return;

  // Si el mensaje en base de datos ya tiene más de 2 horas, no renderizarlo
  if (data.timestamp && Date.now() - data.timestamp > TWO_HOURS_MS) {
    snapshot.ref.remove();
    return;
  }

  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-msg";
  msgDiv.id = `msg-${snapshot.key}`; // Identificador para poder borrarlo del DOM
  msgDiv.style.background = data.color || "#00f5d4";
  msgDiv.style.color = "#07070a";

  const userSpan = document.createElement("span");
  userSpan.className = "chat-msg-user";
  userSpan.textContent = data.user || "Inkling";

  const textNode = document.createTextNode(data.text || "");

  msgDiv.appendChild(userSpan);
  msgDiv.appendChild(textNode);
  container.appendChild(msgDiv);

  scrollChatToBottom();

  if (!chatOpen) {
    const badge = document.getElementById("chat-unread-badge");
    if (badge) badge.style.display = "inline-block";
  }
});

// Eliminar mensaje visualmente si expira o es borrado de Firebase
chatMessagesRef.on("child_removed", (snapshot) => {
  const el = document.getElementById(`msg-${snapshot.key}`);
  if (el) {
    el.remove();
  }
});