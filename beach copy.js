console.log("rodou")

async function loadSvg(svgPath, containerSelector) {
  const response = await fetch(svgPath);

  if (!response.ok) {
    throw new Error(`Erro ao carregar SVG: ${svgPath}`);
  }

  const svgContent = await response.text();

  const container = document.querySelector(containerSelector);

  if (!container) {
    throw new Error(`Container não encontrado: ${containerSelector}`);
  }

  container.insertAdjacentHTML("beforeend", svgContent);
  console.log("inserted");

  return container.querySelector("svg");
}

loadSvg("/water/A-back.svg", "#waves-container")
loadSvg("/water/A-mid.svg", "#waves-container")
loadSvg("/water/A-front.svg", "#waves-container")  

/* ═══════════════════════════════════════════════════════════════════
   BEACH WAVE ANIMATION — GSAP Logic
   Spec: organic beach waves, no mechanical loops.

   Estratégia:
   - 3 conjuntos independentes (A, B, C) com offsets de início escalonados
   - Cada conjunto percorre back → mid → front via translateY
   - Opacidade/transparência acompanha o avanço com pequeno atraso
   - Espuma de borda segue a crista, sai mais lentamente que a água
   - Espuma residual permanece depois que a água recua (500-1500ms)
   - Areia molhada segue a água com delay (200-500ms), demora a recuar
   - Destaques solares pulsam lentamente em fases diferentes
   - Todas as timelines repetem de forma independente
═══════════════════════════════════════════════════════════════════ */

/* ── Helpers ── */
const rand = (a, b) => a + Math.random() * (b - a);
const $    = id    => document.getElementById(id);

/* ── Constantes de posição (px, eixo Y) ──────────────────────────
   O viewBox SVG é 960×540. As ondas começam acima da cena e
   avançam para baixo (translateY positivo = descida = praia).

   BACK_Y   → completamente fora do topo (hidden)
   START_Y  → recém visível no topo (estado "back" em repouso)
   MID_Y    → avanço intermediário
   FRONT_Y  → avanço máximo (inundação total da praia)
─────────────────────────────────────────────────────────────────── */
const BACK_Y  = -540 * 0.72;  // acima da viewport
const START_Y = -540 * 0.10;  // ligeiramente fora da borda superior
const MID_Y   =  540 * 0.05;  // avanço médio
const FRONT_Y =  540 * 0.28;  // avanço máximo

/* ── Configuração por conjunto de ondas ──────────────────────────
   delay     → offset de início em segundos (cria sobreposição temporal)
   cycleMult → multiplica as durações de cada ciclo (variação de ritmo)
   frontY    → ponto máximo de alcance (varia entre conjuntos)
─────────────────────────────────────────────────────────────────── */
const SETS = {
  A: { delay: 0,   cycleMult: 1.00, frontY: FRONT_Y },
  B: { delay: 2.1, cycleMult: 1.10, frontY: FRONT_Y * 0.93 },
  C: { delay: 4.2, cycleMult: 0.92, frontY: FRONT_Y * 1.06 },
};

/* ═══════════════════════════════════════════════════════════════════
   animateWaveSet(id, cfg)
   Executa um ciclo completo de onda e repete indefinidamente.
   Cada repetição re-sorteia as durações para evitar loop mecânico.
═══════════════════════════════════════════════════════════════════ */
function animateWaveSet(id, cfg) {
  const back  = $(`w${id}-back`);
  const mid   = $(`w${id}-mid`);
  const front = $(`w${id}-front`);

  const wsBack  = $(`ws${id}-back`);
  const wsMid   = $(`ws${id}-mid`);
  const wsFront = $(`ws${id}-front`);

  /* Estado inicial: tudo oculto acima da cena */
  gsap.set([back, mid, front],       { y: BACK_Y, opacity: 0 });
  gsap.set([wsBack, wsMid, wsFront], { y: BACK_Y, opacity: 0 });

  function runCycle() {
    const c        = cfg.cycleMult;
    const advBack  = rand(0.6, 0.9) * c;   // back → START_Y
    const advMid   = rand(0.8, 1.1) * c;   // → MID_Y
    const advFront = rand(1.2, 1.6) * c;   // → FRONT_Y
    const dwell    = rand(0.3, 0.8);        // pausa no pico
    const retMid   = rand(0.9, 1.2) * c;
    const retBack  = rand(0.7, 1.0) * c;
    const retFade  = rand(0.5, 0.9) * c;

    const tl = gsap.timeline({ onComplete: runCycle });

    /* 1. BACK — onda aparece no topo */
    tl.to(back, {
      y: START_Y,
      opacity: 1,
      duration: advBack,
      ease: 'power2.out',
    });

    /* 2. MID — onda avança para a zona intermediária */
    tl.to(back,  { y: MID_Y, opacity: 0.85, duration: advMid, ease: 'power3.out' }, '+=0')
      .to(mid,   { y: MID_Y, opacity: 0.80, duration: advMid, ease: 'power3.out' }, '<0.08')
      .to(wsBack, { y: MID_Y * 0.5, opacity: 0.65, duration: advMid, ease: 'power2.out' }, `<${rand(0.2, 0.45)}`);

    /* 3. FRONT — avanço máximo, areia inundada */
    tl.to(back,   { y: cfg.frontY, opacity: 0,    duration: advFront, ease: 'power3.out' }, '+=0')
      .to(mid,    { y: cfg.frontY, opacity: 0.45, duration: advFront, ease: 'power3.out' }, '<0.10')
      .to(front,  { y: cfg.frontY, opacity: 0.32, duration: advFront, ease: 'power3.out' }, '<0.14')
      .to(wsMid,  { y: cfg.frontY * 0.55, opacity: 0.55, duration: advFront, ease: 'power2.out' }, `<${rand(0.25, 0.5)}`)
      .to(wsFront,{ y: cfg.frontY * 0.85, opacity: 0.48, duration: advFront, ease: 'power2.out' }, `<${rand(0.15, 0.3)}`);

    /* 4. DWELL — pausa no pico (300-800ms variável) */
    tl.to({}, { duration: dwell });

    /* 5. RECUO — água se retira, areia molhada demora mais */
    tl.to(front, { y: BACK_Y, opacity: 0, duration: retMid,  ease: 'power3.in' }, '+=0')
      .to(mid,   { y: BACK_Y, opacity: 0, duration: retBack, ease: 'power3.in' }, `<${rand(0.15, 0.35)}`)
      .to(back,  { y: BACK_Y, opacity: 0, duration: retFade, ease: 'power2.in' }, `<${rand(0.10, 0.25)}`)
      // areia molhada: delay de entrada 800-2000ms após água iniciar recuo
      .to(wsFront, { y: BACK_Y, opacity: 0, duration: retMid  * rand(1.4, 1.9), ease: 'power2.in' }, `<${rand(0.6, 1.2)}`)
      .to(wsMid,   { y: BACK_Y, opacity: 0, duration: retBack * rand(1.3, 1.8), ease: 'power2.in' }, `<${rand(0.3, 0.8)}`)
      .to(wsBack,  { y: BACK_Y, opacity: 0, duration: retFade * rand(1.2, 1.6), ease: 'power2.in' }, `<${rand(0.2, 0.6)}`);
  }

  gsap.delayedCall(cfg.delay, runCycle);
}

/* ═══════════════════════════════════════════════════════════════════
   animateFoamEdge()
   Espuma de borda acompanha a crista da onda, mas:
   - entra 100-300ms depois da água
   - sai 500-1500ms mais devagar
═══════════════════════════════════════════════════════════════════ */
function animateFoamEdge() {
  const foams = [$('foam-edge-1'), $('foam-edge-2'), $('foam-edge-3')];

  gsap.set(foams, { y: BACK_Y, opacity: 0, scale: 1 });

  function runFoamCycle(el, delayOffset) {
    function cycle() {
      const advDur = rand(2.0, 3.0);
      const dwell  = rand(0.4, 0.9);
      const retDur = rand(1.5, 2.5); // saída mais lenta que a água

      gsap.timeline({ onComplete: cycle })
        .to(el, {
          y: FRONT_Y,
          opacity: rand(0.60, 0.80),
          scale: rand(0.97, 1.03),
          duration: advDur,
          ease: 'power2.out',
          delay: rand(0.1, 0.3), // atraso de 100-300ms após a água
        })
        .to(el, { duration: dwell })
        .to(el, {
          y: BACK_Y,
          opacity: 0,
          scale: rand(0.94, 0.98),
          duration: retDur,
          ease: 'power1.in',
        });
    }

    gsap.delayedCall(delayOffset, cycle);
  }

  runFoamCycle(foams[0], 0.8);
  runFoamCycle(foams[1], 2.7);
  runFoamCycle(foams[2], 4.8);
}

/* ═══════════════════════════════════════════════════════════════════
   animateResidualFoam()
   Espuma residual: aparece quando a onda atinge o pico e persiste
   enquanto a água já começou a recuar (defasagem de fase intencional).
═══════════════════════════════════════════════════════════════════ */
function animateResidualFoam() {
  const residuals = [
    $('foam-r1'), $('foam-r2'), $('foam-r3'),
    $('foam-r4'), $('foam-r5'), $('foam-r6'),
  ];

  residuals.forEach((el, i) => {
    gsap.set(el, { opacity: 0 });

    function cycle() {
      const peakDelay = rand(2.2, 3.8); // aguarda onda chegar ao pico
      const fadeIn    = rand(0.4, 0.8);
      const linger    = rand(1.2, 2.8); // permanece após início do recuo
      const fadeOut   = rand(0.8, 1.8);
      const gap       = rand(0.5, 1.5); // pausa antes do próximo ciclo

      gsap.timeline({ onComplete: () => gsap.delayedCall(gap, cycle) })
        .to(el, { opacity: rand(0.5, 0.85), duration: fadeIn,  ease: 'power2.out', delay: peakDelay })
        .to(el, { duration: linger })
        .to(el, { opacity: 0,              duration: fadeOut, ease: 'power2.in' });
    }

    gsap.delayedCall(i * 0.9 + rand(0.2, 0.8), cycle);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   animateHighlights()
   Reflexos solares: pulsam lentamente com opacidade e escala baixas.
═══════════════════════════════════════════════════════════════════ */
function animateHighlights() {
  const hls = [$('hl1'), $('hl2'), $('hl3')];

  hls.forEach((el, i) => {
    gsap.set(el, { opacity: 0 });

    gsap.to(el, {
      opacity: rand(0.18, 0.40),
      x: rand(-8, 8),
      scaleX: rand(0.92, 1.12),
      duration: rand(2.5, 4.5),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 1.2,
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   animateReflection()
   Reflexo de superfície: translação horizontal suave e lenta.
═══════════════════════════════════════════════════════════════════ */
function animateReflection() {
  const el = $('surface-reflection');

  gsap.to(el, {
    x: rand(6, 14),
    opacity: rand(0.5, 0.9),
    duration: rand(5, 8),
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

/* ═══════════════════════════════════════════════════════════════════
   BOOT — inicializa todas as camadas
═══════════════════════════════════════════════════════════════════ */
animateWaveSet('A', SETS.A);
animateWaveSet('B', SETS.B);
animateWaveSet('C', SETS.C);
animateFoamEdge();
animateResidualFoam();
animateHighlights();
animateReflection();

/* ═══════════════════════════════════════════════════════════════════
   DEBUG CONTROLS
═══════════════════════════════════════════════════════════════════ */
$('toggle-slow').addEventListener('change', e => {
  gsap.globalTimeline.timeScale(e.target.checked ? 0.25 : 1);
});

$('toggle-outlines').addEventListener('change', e => {
  const layers = document.querySelectorAll('.water-layer, .foam-edge, .foam-residual, .wet-sand');
  layers.forEach(l => {
    l.style.outline = e.target.checked ? '1px solid rgba(255, 80, 80, 0.4)' : '';
  });
});