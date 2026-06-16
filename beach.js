const tl = gsap.timeline({ repeat: -1 });

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

  return container.querySelector("svg");
}

loadSvg("/assets/waves.svg", "#waves-container")
  

const tl = gsap.timeline({
  repeat: -1
});

tl.to("#wave", {
  morphSVG: "#wave-mid",
  duration: 0.8,
  ease: "power2.out"
})

.to("#wave", {
  morphSVG: "#wave-limit",
  duration: 1.4,
  ease: "power3.out"
})

.to({}, {
  duration: 0.4
})

.to("#wave", {
  morphSVG: "#wave-mid",
  duration: 0.6,
  ease: "power2.in"
})

.to("#wave", {
  morphSVG: "#wave-start",
  duration: 0.5,
  ease: "power3.in"
})

.to({}, {
  duration: 0.2
});