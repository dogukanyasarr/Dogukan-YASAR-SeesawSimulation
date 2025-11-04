import { randColor, createObjectDOM, renderObjects, updateObjectPositions, addLog } from "./function.js";
import { calculateTorque } from "./physic.js";


// HTML elementlerini burdan çağırıyorum
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

// siteyi kapattıktan sonra tekrar açtığımda simülasyonda nerde kaldıysam ordan devam etmemi sağlıyor(local storage).
let objects = JSON.parse(localStorage.getItem("seesawObjects")) || [];

// random ağırlıklar oluşmasını sağlıyor.
let nextWeight = Math.floor(Math.random() * 10) + 1;

const MAX_ANGLE = 30; // eğimin max 30 olacağını sabit olarak verdim.
const DROP_DURATION = 0.7; // ağırlıkların havadan düşme animasyon hızı.
let nextObjectId = 0;
let lastTime = 0;

let isPaused = false; 

// düşen ağırlıkların animasyon güncellemeleri
function updateDropAnimations(objects, deltaTime, duration) {
  objects.forEach(obj => {
    if (obj.isDropping) {
      obj.dropProgress -= deltaTime / duration;
      if (obj.dropProgress <= 0) {
        obj.dropProgress = 0;
        obj.isDropping = false;
      }
    }
  });
}

// plank'e tıkladığımda ağırlıların eklenme fonksiyonu
function addWeightHandler(e) {
  if (isPaused) return; 

  const plankRect = plank.getBoundingClientRect();
  const clickX = e.clientX - (plankRect.left + plankRect.width / 2);

  const color = randColor();
  const currentAddedWeight = nextWeight;

  // random renklerle oluşan ağırlıklar
  const newObj = {
    id: nextObjectId++,
    x: clickX,
    weight: currentAddedWeight,
    color,
    isDropping: true,
    dropProgress: 1.0
  };

  objects.push(newObj);
  localStorage.setItem("seesawObjects", JSON.stringify(objects));

  nextWeight = Math.floor(Math.random() * 10) + 1;
  nextWeightEl.textContent = `${nextWeight} kg`;
  addLog(newObj, logList, deleteWeight);

  const el = createObjectDOM(newObj);
  container.appendChild(el);
}

// ağırlıkları, ağırlık kaydı bölümünden silme.
function deleteWeight(id, listItemEl) {
  if (isPaused) return; 

  objects = objects.filter(o => o.id !== id);
  localStorage.setItem("seesawObjects", JSON.stringify(objects));

  const el = document.querySelector(`.weight-object[data-obj-id="${id}"]`);
  if (el) el.remove();
  if (listItemEl) listItemEl.remove();
}

// matematiksel tahta'nın eğimini ölçme
function updateSeesaw() {
  const { leftTorque, rightTorque, totalLeftWeight, totalRightWeight } = calculateTorque(objects);

  leftWeightEl.textContent = totalLeftWeight.toFixed(1);
  rightWeightEl.textContent = totalRightWeight.toFixed(1);
  totalWeightEl.textContent = (totalLeftWeight + totalRightWeight).toFixed(1);

  const torqueDiff = rightTorque - leftTorque;
  const angleDeg = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, torqueDiff / 10));
  const angleInRad = angleDeg * (Math.PI / 180);

  plank.style.transform = `translateX(-50%) rotate(${angleDeg}deg)`;
  angleDisplayEl.textContent = `${angleDeg.toFixed(1)}°`;

  updateObjectPositions(container, pivot, plank, angleInRad, objects, false);
}

function gameLoop(time) {
  if (!isPaused) { 
    const deltaTime = (time - lastTime) / 1000;
    updateDropAnimations(objects, deltaTime, DROP_DURATION);
    updateSeesaw();
  }
  lastTime = time;
  requestAnimationFrame(gameLoop);
}
// resetleme işlemi
function resetAll() {
  objects = [];
  localStorage.removeItem("seesawObjects");
  document.querySelectorAll(".weight-object").forEach((n) => n.remove());
  plank.style.transform = `translateX(-50%) rotate(0deg)`;
  angleDisplayEl.textContent = `0°`;
  leftWeightEl.textContent = "0";
  rightWeightEl.textContent = "0";
  totalWeightEl.textContent = "0";
  logList.innerHTML = "";
}

// ağırlık ekleme işlemini durdurma/başlatma
function togglePause() {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "Devam Et" : "Durdur";
}

plank.addEventListener("click", addWeightHandler);
resetButton.addEventListener("click", resetAll);
pauseButton.addEventListener("click", togglePause); 

nextWeightEl.textContent = `${nextWeight} kg`;
nextObjectId = objects.length > 0 ? Math.max(...objects.map(o => o.id || 0)) + 1 : 0;
renderObjects(container, objects, plank, 0);
requestAnimationFrame(gameLoop);
