const plank = document.getElementById("plank");
const container = document.getElementById("seesawContainer");


let objects = [];
let nextObjectId = 0;

// Sayıların random renkle düşmesini sağlayan kısım.

function randColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`;
}

function addWeightHandler(e) {
  const plankRect = plank.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const clickX = e.clientX - (plankRect.left + plankRect.width / 2);

  const weight = Math.floor(Math.random() * 10) + 1;
  const color = randColor();

  const size = 20 + weight * 2;
  const startY = -50;
  const endY = plankRect.top - containerRect.top - 5; 

  const el = document.createElement("div");
  el.className = "weight-object";
  el.textContent = `${weight}`;
  el.style.background = color;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.lineHeight = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.position = "absolute";
  el.style.color = "white";
  el.style.fontWeight = "bold";
  el.style.textShadow = "0 0 3px rgba(0,0,0,0.6)";
  el.style.left = `${plankRect.left + plankRect.width / 2 + clickX - containerRect.left}px`;
  el.style.top = `${startY}px`;
  el.style.transform = "translate(-50%, 0)";
  el.style.transition = "top 0.7s cubic-bezier(0.25, 1, 0.5, 1)";

  container.appendChild(el);

  setTimeout(() => {
    el.style.top = `${endY - size / 2}px`;
  }, 50);

  objects.push({ id: nextObjectId++, x: clickX, weight, color });
  console.log(`yeni ağırlık eklendi ${weight}kg (x: ${clickX}px)`);
}

plank.addEventListener("click", addWeightHandler);

const style = document.createElement("style");
style.textContent = `
  .weight-object {
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
    border: 2px solid rgba(255,255,255,0.6);
    user-select: none;
  }
  .weight-object:hover {
    transform: translate(-50%, -5px);
  }
`;
document.head.appendChild(style);
