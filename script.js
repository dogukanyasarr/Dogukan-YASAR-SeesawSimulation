const plank = document.getElementById("plank");
const pivot = document.getElementById("pivot");
const container = document.getElementById("seesawContainer");

let objects = [];
let nextObjectId = 0;
let currentAngle = 0;
let angularVelocity = 0;
const G = 9.81;
const MAX_ANGLE_DEG = 30;
const DAMPING = 0.005;
const MAX_ANGLE_RAD = MAX_ANGLE_DEG * (Math.PI / 180);
const BOARD_MASS_I_FACTOR = 10000;
let lastTime = 0;

function randColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`;
}

function getPivotLocal() {
  const contRect = container.getBoundingClientRect();
  const pivotRect = pivot.getBoundingClientRect();
  const px = pivotRect.left - contRect.left + pivotRect.width / 2;
  const py = pivotRect.top - contRect.top + pivotRect.height / 2;
  return { px, py };
}

function axisAndNormal(angleRad) {
  const a = angleRad;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const nx = Math.sin(a);
  const ny = -Math.cos(a);
  return { ux, uy, nx, ny, a };
}

function computeTargetCenter(distanceFromPivot, radius, angleRad, dropFactor = 0) {
  const { px, py } = getPivotLocal();
  const { ux, uy, nx, ny } = axisAndNormal(angleRad);
  const plankThickness = parseFloat(getComputedStyle(plank).height) || 12;
  const offset = plankThickness / 2 + radius + 2;

  let cx = px + distanceFromPivot * ux + nx * offset;
  let cy = py + distanceFromPivot * uy + ny * offset;

  if (dropFactor > 0) {
    const dropHeight = 200;
    cx += nx * dropHeight * dropFactor;
    cy += ny * dropHeight * dropFactor;
  }

  return { cx, cy };
}

// ağırlık toplarını fonksiyon olarak oluşturuyorum.
function createObjectDOM(obj) {
  const el = document.createElement("div");
  el.className = "weight-object";
  el.textContent = obj.weight;
  el.dataset.x = obj.x;
  el.style.background = obj.color;

  const size = 20 + obj.weight * 2;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.lineHeight = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.position = "absolute";
  el.style.transform = "translate(-50%,-50%)";
  el.style.pointerEvents = "none";
  el.style.color = "#fff";
  el.style.fontWeight = "bold";
  el.style.textShadow = "0 0 3px rgba(0,0,0,0.6)";

  container.appendChild(el);
  return el;
}

function updateObjectPositions() {
  const angleDeg = currentAngle * (180 / Math.PI);
  plank.style.transform = `translateX(-50%) rotate(${angleDeg}deg)`;

  objects.forEach((obj) => {
    const dist = obj.x;
    const r = 10 + obj.weight;
    const { cx, cy } = computeTargetCenter(dist, r, currentAngle, obj.dropProgress);
    obj.el.style.left = `${cx}px`;
    obj.el.style.top = `${cy}px`;
  });
}

// tork hesabım
function calculateTorque(objects) {
  let leftTorque = 0;
  let rightTorque = 0;

  objects.forEach((obj) => {
    const d = obj.x;
    const force = obj.weight * G;
    if (d < 0) leftTorque += Math.abs(d) * force;
    else rightTorque += d * force;
  });

  return rightTorque - leftTorque;
}

function calculateMomentOfInertia(objects) {
  let I = 0;
  objects.forEach((obj) => {
    I += obj.weight * Math.pow(obj.x, 2);
  });
  return I + BOARD_MASS_I_FACTOR;
}

function gameLoop(time) {
  const deltaTime = (time - lastTime) / 1000;

  const netTork = calculateTorque(objects);
  const I = calculateMomentOfInertia(objects);
  const angularAcceleration = netTork / I;

  angularVelocity += angularAcceleration * deltaTime;
  angularVelocity *= (1 - DAMPING);

  currentAngle += angularVelocity * deltaTime;
  currentAngle = Math.max(-MAX_ANGLE_RAD, Math.min(MAX_ANGLE_RAD, currentAngle));

  updateObjectPositions();
  lastTime = time;
  requestAnimationFrame(gameLoop);
}

function addWeightHandler(e) {
  const plankRect = plank.getBoundingClientRect();
  const clickX = e.clientX - (plankRect.left + plankRect.width / 2);

  const weight = Math.floor(Math.random() * 10) + 1;
  const color = randColor();

  const newObj = {
    id: nextObjectId++,
    x: clickX,
    weight,
    color,
    dropProgress: 1.0,
  };

  const el = createObjectDOM(newObj);
  newObj.el = el;
  objects.push(newObj);

  const dropTime = 700;
  const dropStart = performance.now();

  function animateDrop(now) {
    const progress = Math.min(1, (now - dropStart) / dropTime);
    newObj.dropProgress = Math.pow(1 - progress, 2);
    if (progress < 1) requestAnimationFrame(animateDrop);
  }

  requestAnimationFrame(animateDrop);
}

plank.addEventListener("click", addWeightHandler);
requestAnimationFrame(gameLoop);
