const rand = (a, b) => a + Math.random() * (b - a);

async function loadPath(svgPath) {
  const res = await fetch(svgPath);
  const text = await res.text();

  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  return doc.querySelector("path").getAttribute("d");
}
  
async function init() {
  const back = await loadPath("./water/A-back.svg");
  const front = await loadPath("./water/A-front.svg");

  const wave = document.querySelector("#wave");

  // estado inicial
  wave.setAttribute("d", back);

  const set_a = [back, front]

  animateWaveSet(set_a, wave)
}

init();

function animateWaveSet(set, wave) {

  const tl = gsap.timeline({ repeat: -1 });

  const [back, front] = set;

  c = 1
  const advBack  = rand(0.6, 0.9) * c;   // back → START_Y
    const advMid   = rand(0.8, 1.1) * c;   // → MID_Y
    const advFront = rand(2.2, 2.6) * c;   // → FRONT_Y
    const dwell    = rand(0.3, 0.5);        // pausa no pico
    

  tl.to(wave, {    
    duration: advFront,
    morphSVG: { shape: front },
    ease: "power2.out'"
  })  
  
  tl.to({}, { duration: dwell });

  tl.to(wave, {
    duration: advFront,
    morphSVG: { shape: back },
    ease: "power2.in'"
  });

  tl.to({}, { duration: dwell });

}

