import { randColor, createObjectDOM, renderObjects, updateObjectPositions, addLog } from "./function.js";
import { calculateTorque, calculateMomentOfInertia, updateDropAnimations } from "./physic.js";

const plank = document.getElementById("plank");
const pivot = document.getElementById("pivot");
const container = document.getElementById("seesawContainer");
const nextWeightEl = document.getElementById("nextWeight");
const leftWeightEl = document.getElementById("leftWeight");
const rightWeightEl = document.getElementById("rightWeight");
const totalWeightEl = document.getElementById("totalWeight");
const angleDisplayEl = document.getElementById("angleDisplay");
const resetButton = document.getElementById("resetButton");
const pauseButton = document.getElementById("pauseButton");
const logList = document.getElementById("logList");

let objects = JSON.parse(localStorage.getItem("seesawObjects")) || [];
let nextWeight = Math.floor(Math.random() * 10) + 1;
let isPaused = false;

let nextObjectId = 0;
let currentAngle = 0;
let angularVelocity = 0;

const G = 9.81;
const MAX_ANGLE_DEG = 30;
const DAMPING = 0.005;
const MAX_ANGLE_RAD = MAX_ANGLE_DEG * (Math.PI / 180);
const BOARD_MASS_I_FACTOR = 10000;
const DROP_DURATION = 0.7;

let lastTime = 0;

function addWeightHandler(e) {
  if (isPaused) return;
  const plankRect = plank.getBoundingClientRect();
  const clickX = e.clientX - (plankRect.left + plankRect.width / 2);

  const color = randColor();
  const currentAddedWeight = nextWeight;

  const newObj = {
    id: nextObjectId++,
    x: clickX,
    weight: currentAddedWeight,
    color,
    isDropping: true,
    dropProgress: 1.0,
  };

  objects.push(newObj);
  localStorage.setItem("seesawObjects", JSON.stringify(objects));

  nextWeight = Math.floor(Math.random() * 10) + 1;
  nextWeightEl.textContent = `${nextWeight} kg`;
  addLog(newObj, logList, deleteWeight);

  const el = createObjectDOM(newObj);
  container.appendChild(el);
  updateObjectPositions(container, pivot, plank, currentAngle, objects, true);
}

function deleteWeight(id, listItemEl) {
  objects = objects.filter(o => o.id !== id);
  localStorage.setItem("seesawObjects", JSON.stringify(objects));
  const el = document.querySelector(`.weight-object[data-obj-id="${id}"]`);
  if (el) el.remove();
  if (listItemEl) listItemEl.remove();
  calculateTorque(objects, G, leftWeightEl, rightWeightEl, totalWeightEl);
}

function resetAll() {
  objects = [];
  localStorage.removeItem("seesawObjects");
  document.querySelectorAll(".weight-object").forEach((n) => n.remove());
  currentAngle = 0;
  angularVelocity = 0;
  plank.style.transform = `translateX(-50%) rotate(0deg)`;
  angleDisplayEl.textContent = `0°`;
  leftWeightEl.textContent = "0";
  rightWeightEl.textContent = "0";
  totalWeightEl.textContent = "0";
  logList.innerHTML = "";
}

function togglePause() {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "Devam Et" : "Durdur";
}

function gameLoop(time) {
  if (!isPaused) {
    const deltaTime = (time - lastTime) / 1000;

    const netTork = calculateTorque(objects, G, leftWeightEl, rightWeightEl, totalWeightEl);
    const I = calculateMomentOfInertia(objects, BOARD_MASS_I_FACTOR);
    const angularAcceleration = netTork / I;

    angularVelocity += angularAcceleration * deltaTime;
    angularVelocity *= (1 - DAMPING);

    currentAngle += angularVelocity * deltaTime;
    currentAngle = Math.max(-MAX_ANGLE_RAD, Math.min(MAX_ANGLE_RAD, currentAngle));

    updateDropAnimations(objects, deltaTime, DROP_DURATION);
    updateObjectPositions(container, pivot, plank, currentAngle, objects, false);

    angleDisplayEl.textContent = `${(currentAngle * (180 / Math.PI)).toFixed(1)}°`;
  }

  lastTime = time;
  requestAnimationFrame(gameLoop);
}

plank.addEventListener("click", addWeightHandler);
resetButton.addEventListener("click", resetAll);
pauseButton.addEventListener("click", togglePause);

nextWeightEl.textContent = `${nextWeight} kg`;
nextObjectId = objects.length > 0 ? Math.max(...objects.map(o => o.id || 0)) + 1 : 0;
renderObjects(container, objects, plank, currentAngle);
requestAnimationFrame(gameLoop);
