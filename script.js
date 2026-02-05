// San Valentín interactivo (vanilla JS) — compatible con Safari móvil y desktop

const $ = (sel) => document.querySelector(sel);

const titleEl = $("#title");
const subtitleEl = $("#subtitle");
const mascotEl = $("#mascot");
const yesBtn = $("#yesBtn");
const noBtn = $("#noBtn");
const hintEl = $("#hint");
const signatureEl = $("#signature");

const success = $("#success");
const successTitle = $("#successTitle");
const successText = $("#successText");
const copyBtn = $("#copyBtn");
const restartBtn = $("#restartBtn");

const confettiCanvas = $("#confetti");
confettiCanvas.style.pointerEvents = "none";
const ctx = confettiCanvas.getContext("2d");

// Personaliza desde la URL (opcional)
// Ej: .../index.html?para=Valen&de=Juan
const qs = new URLSearchParams(location.search);
const para = (qs.get("para") || "Valerin").trim(); // nombre de ella (opcional)
const de = (qs.get("de") || "Juan Andrés").trim();     // tu nombre (opcional)

const reset = (qs.get("reset") || "").trim(); // si es "1", reinicia el estado
if (reset === "1") {
  localStorage.removeItem("sv_accepted");
}

signatureEl.textContent = de ? `Hecho con amor por ${de} ✨` : "Hecho con amor ✨";

// ===== Mascotas (SVGs originales, sin gifs externos) =====
const Mascots = {
  happy: svgBlob({ eyes: "happy", mouth: "smile", cheeks: true, tinyHearts: true }),
  puppy: svgBlob({ eyes: "puppy", mouth: "smile", cheeks: true, tinyHearts: false }),
  shocked: svgBlob({ eyes: "wide", mouth: "o", cheeks: false, tinyHearts: false }),
  sad: svgBlob({ eyes: "sad", mouth: "down", cheeks: false, tinyHearts: false }),
  drama: svgBlob({ eyes: "closed", mouth: "bigO", cheeks: false, tinyHearts: true }),
  victory: svgBlob({ eyes: "sparkle", mouth: "smile", cheeks: true, tinyHearts: true }),
};

// Escenas: cada “No” avanza
const scenes = [
  {
    title: (para ? `${para}, ¿quieres ser mi San Valentín?` : "¿Quieres ser mi San Valentín?"),
    subtitle: "Prometo postres, risas y abrazos infinitos.",
    noLabel: "No",
    hint: "Tip: cada “No” hace al “Sí” más valiente.",
    mascot: "happy",
  },
  {
    title: "Ejem... ¿segurísima?",
    subtitle: "Lo pregunto porque me gustas MUCHO (nivel: infinito).",
    noLabel: "No 🙈",
    hint: "Ok, ok… entendí. Pero mira el botón rosado 😌",
    mascot: "puppy",
  },
  {
    title: "Piénsalo otra vez, porfa",
    subtitle: "Traje mi argumento más fuerte: carita tierna certificada.",
    noLabel: "Nope",
    hint: "Cada click al No sube el poder del Sí 💗",
    mascot: "shocked",
  },
  {
    title: "Última oportunidad oficial",
    subtitle: "Después de esto me convierto en un drama total.",
    noLabel: "Nooo",
    hint: "Ya casi… respira y mira el botón rosado 😅",
    mascot: "drama",
  },
  {
    title: "Ok, ok… ya entendí 😔",
    subtitle: "Pero igual voy a insistir un poquito (con respeto).",
    noLabel: "No (final)",
    hint: "Este Sí ya está gigantesco… coincidencia? no lo creo.",
    mascot: "sad",
  },
  {
    title: "Listo, el No se cansó",
    subtitle: "Ahora solo queda una opción: decir Sí y ser felices 😌",
    noLabel: "Ya no se puede",
    hint: "Dale al Sí y activamos modo celebración 🎉",
    mascot: "victory",
    lockNo: true,
  },
];

yesBtn.addEventListener("click", () => {
  const remember = (qs.get("remember") || "").trim();
  if (remember === "1") {
    try { localStorage.setItem("sv_accepted", "true"); } catch {}
  }
  showSuccess();
});

noBtn.addEventListener("click", () => {
  if (step < scenes.length - 1) step++;
  const remember = (qs.get("remember") || "").trim();
if (remember === "1") {
  try {
    if (localStorage.getItem("sv_accepted") === "true") {
      showSuccess();
    } else {
      render();
    }
  } catch {
    render();
  }
} else {
  // por defecto, no recuerda el estado
  render();
}
  // micro vibración en móviles (si está disponible)
  try { if (navigator.vibrate) navigator.vibrate(18); } catch {}
});

copyBtn.addEventListener("click", async () => {
  const msg = (para ? `${para}, ` : "") + "¡SÍ! Somos San Valentín 💖";
  try {
    await navigator.clipboard.writeText(msg);
    copyBtn.textContent = "¡Copiado! ✅";
    setTimeout(() => (copyBtn.textContent = "Copiar mensajito"), 1200);
  } catch {
    // fallback: prompt
    window.prompt("Copia este mensajito:", msg);
  }
});

restartBtn.addEventListener("click", () => {
  try { localStorage.removeItem("sv_accepted"); } catch {}
  success.hidden = true;
  step = 0;
  stopConfetti();
  const remember = (qs.get("remember") || "").trim();
if (remember === "1") {
  try {
    if (localStorage.getItem("sv_accepted") === "true") {
      showSuccess();
    } else {
      render();
    }
  } catch {
    render();
  }
} else {
  // por defecto, no recuerda el estado
  render();
}
});
// Estado
let step = 0;

// Inicio: por defecto SIEMPRE arranca desde cero (sin saltarse el juego).
// Si quieres que “recuerde” el sí al volver a abrir, agrega ?remember=1
const remember = (qs.get("remember") || "").trim();
if (remember === "1") {
  try {
    if (localStorage.getItem("sv_accepted") === "true") {
      showSuccess();
    } else {
      render();
    }
  } catch {
    render();
  }
} else {
  // por defecto, no recuerda el estado
  render();
}
function render(){
  const s = scenes[step];

  titleEl.textContent = s.title;
  subtitleEl.textContent = s.subtitle;
  mascotEl.innerHTML = Mascots[s.mascot] || Mascots.happy;

  // Escalado del botón "Sí"
  const scale = Math.min(1 + step * 0.18, 2.25);
  document.documentElement.style.setProperty("--yes-scale", scale.toFixed(2));

  // Texto del botón No y estado
  noBtn.textContent = s.noLabel || "No";
  if (s.lockNo) {
    noBtn.disabled = true;
    hintEl.textContent = s.hint || "";
  } else {
    noBtn.disabled = false;
    hintEl.textContent = s.hint || "";
  }

  // Animación sutil en el botón Sí cuando crece
  yesBtn.animate(
    [{ transform: `scale(${scale})` }, { transform: `scale(${(scale + 0.05).toFixed(2)})` }, { transform: `scale(${scale})` }],
    { duration: 260, easing: "ease-out" }
  );
}

function showSuccess(){
  success.hidden = false;
  successTitle.textContent = para ? `¡${para.toUpperCase()}, SABÍA QUE DIRÍAS QUE SÍ!` : "¡SABÍA QUE DIRÍAS QUE SÍ!";
  successText.innerHTML = `Ahora envíame un mensajito: <strong>“Listo, somos San Valentín 💖”</strong>`;
  startConfetti();
}

// ===== Confetti / corazones (canvas) =====
let confettiRunning = false;
let particles = [];
let rafId = null;

function resizeCanvas(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  confettiCanvas.width = Math.floor(confettiCanvas.clientWidth * dpr);
  confettiCanvas.height = Math.floor(confettiCanvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", () => {
  if (!success.hidden) resizeCanvas();
});

function startConfetti(){
  resizeCanvas();
  particles = makeParticles(140);
  confettiRunning = true;
  tick();
}

function stopConfetti(){
  confettiRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  particles = [];
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
}

function makeParticles(n){
  const W = confettiCanvas.clientWidth;
  const H = confettiCanvas.clientHeight;
  const out = [];
  for (let i=0;i<n;i++){
    out.push({
      x: Math.random()*W,
      y: -20 - Math.random()*H,
      r: 6 + Math.random()*10,
      vy: 1.2 + Math.random()*2.8,
      vx: -0.7 + Math.random()*1.4,
      rot: Math.random()*Math.PI*2,
      vr: (-0.06 + Math.random()*0.12),
      kind: Math.random() < 0.55 ? "heart" : "dot",
      alpha: 0.75 + Math.random()*0.25,
    });
  }
  return out;
}

function tick(){
  if (!confettiRunning) return;
  const W = confettiCanvas.clientWidth;
  const H = confettiCanvas.clientHeight;

  ctx.clearRect(0,0,W,H);

  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    // wrap
    if (p.y > H + 30){
      p.y = -20;
      p.x = Math.random()*W;
    }
    if (p.x < -30) p.x = W + 30;
    if (p.x > W + 30) p.x = -30;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;

    if (p.kind === "heart"){
      drawHeart(0,0,p.r);
    } else {
      drawDot(0,0,p.r);
    }

    ctx.restore();
  }

  rafId = requestAnimationFrame(tick);
}

function drawDot(x,y,r){
  ctx.beginPath();
  ctx.arc(x,y,r*0.35,0,Math.PI*2);
  // colores suaves (sin librerías)
  ctx.fillStyle = `rgba(255,47,118,0.85)`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x+ r*0.25,y- r*0.2,r*0.22,0,Math.PI*2);
  ctx.fillStyle = `rgba(255,106,160,0.7)`;
  ctx.fill();
}

function drawHeart(x,y,s){
  ctx.beginPath();
  const t = s*0.16;
  // corazón simple
  ctx.moveTo(x, y + s*0.15);
  ctx.bezierCurveTo(x, y - s*0.10, x - s*0.55, y - s*0.05, x - s*0.42, y + s*0.28);
  ctx.bezierCurveTo(x - s*0.32, y + s*0.55, x, y + s*0.72, x, y + s*0.88);
  ctx.bezierCurveTo(x, y + s*0.72, x + s*0.32, y + s*0.55, x + s*0.42, y + s*0.28);
  ctx.bezierCurveTo(x + s*0.55, y - s*0.05, x, y - s*0.10, x, y + s*0.15);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,47,118,0.78)";
  ctx.fill();

  // brillo
  ctx.beginPath();
  ctx.arc(x - s*0.18, y + s*0.18, t, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();
}

// ===== SVG builder (mascota tipo “gomita”) =====
function svgBlob({eyes, mouth, cheeks, tinyHearts}){
  // Ojos
  const Eye = {
    happy: `
      <path d="M 126 120 Q 146 102 166 120" stroke="#2b1d22" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 234 120 Q 254 102 274 120" stroke="#2b1d22" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    puppy: `
      <circle cx="150" cy="118" r="16" fill="#2b1d22"/>
      <circle cx="250" cy="118" r="16" fill="#2b1d22"/>
      <circle cx="145" cy="112" r="5" fill="#ffffff"/>
      <circle cx="245" cy="112" r="5" fill="#ffffff"/>`,
    wide: `
      <circle cx="150" cy="118" r="18" fill="#2b1d22"/>
      <circle cx="250" cy="118" r="18" fill="#2b1d22"/>
      <circle cx="144" cy="110" r="6" fill="#ffffff"/>
      <circle cx="244" cy="110" r="6" fill="#ffffff"/>`,
    sad: `
      <circle cx="150" cy="118" r="15" fill="#2b1d22"/>
      <circle cx="250" cy="118" r="15" fill="#2b1d22"/>
      <path d="M 133 104 Q 150 96 167 104" stroke="#2b1d22" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M 233 104 Q 250 96 267 104" stroke="#2b1d22" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    closed: `
      <path d="M 132 116 Q 150 126 168 116" stroke="#2b1d22" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M 232 116 Q 250 126 268 116" stroke="#2b1d22" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    sparkle: `
      <circle cx="150" cy="118" r="16" fill="#2b1d22"/>
      <circle cx="250" cy="118" r="16" fill="#2b1d22"/>
      <path d="M 145 106 L 150 118 L 155 106 L 150 110 Z" fill="#ffffff"/>
      <path d="M 245 106 L 250 118 L 255 106 L 250 110 Z" fill="#ffffff"/>`
  }[eyes] || "";

  // Boca
  const Mouth = {
    smile: `<path d="M 170 165 Q 200 190 230 165" stroke="#2b1d22" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    down: `<path d="M 170 182 Q 200 160 230 182" stroke="#2b1d22" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    o: `<circle cx="200" cy="176" r="14" fill="#2b1d22"/>`,
    bigO: `<circle cx="200" cy="178" r="18" fill="#2b1d22"/><circle cx="200" cy="178" r="9" fill="#ff6aa0" opacity="0.55"/>`,
  }[mouth] || "";

  const Cheeks = cheeks ? `
    <ellipse cx="120" cy="155" rx="18" ry="10" fill="rgba(255,47,118,0.25)"/>
    <ellipse cx="280" cy="155" rx="18" ry="10" fill="rgba(255,47,118,0.25)"/>` : "";

  const Hearts = tinyHearts ? `
    <g opacity="0.75">
      <path d="M60 85 C60 70 80 70 80 85 C80 70 100 70 100 85 C100 102 80 112 80 112 C80 112 60 102 60 85 Z" fill="rgba(255,47,118,0.35)">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -6; 0 0" dur="1.6s" repeatCount="indefinite"/>
      </path>
      <path d="M310 70 C310 58 326 58 326 70 C326 58 342 58 342 70 C342 84 326 92 326 92 C326 92 310 84 310 70 Z" fill="rgba(255,106,160,0.30)">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -7; 0 0" dur="1.9s" repeatCount="indefinite"/>
      </path>
    </g>` : "";

  return `
  <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mascota tierna">
    <defs>
      <linearGradient id="blob" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#ff8ab5"/>
        <stop offset="1" stop-color="#ff2f76"/>
      </linearGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.8" result="b"/>
        <feMerge>
          <feMergeNode in="b"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    ${Hearts}

    <g filter="url(#soft)">
      <path d="M100 200
        C55 180 48 128 70 98
        C95 62 132 44 170 50
        C190 30 230 30 250 50
        C290 44 330 66 345 105
        C360 140 348 185 305 202
        C270 214 235 210 200 214
        C165 210 130 214 100 200 Z"
        fill="url(#blob)"/>
      <path d="M120 206 C160 226 240 226 280 206" stroke="rgba(255,255,255,0.35)" stroke-width="10" stroke-linecap="round" fill="none"/>
    </g>

    ${Eye}
    ${Cheeks}
    ${Mouth}

    <!-- brillos -->
    <circle cx="132" cy="78" r="20" fill="rgba(255,255,255,0.22)"/>
    <circle cx="158" cy="64" r="10" fill="rgba(255,255,255,0.18)"/>
  </svg>`;
}
