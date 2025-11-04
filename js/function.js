export function randColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`;
}

export function getPivotLocal(container, pivot) {
  const contRect = container.getBoundingClientRect();
  const pivotRect = pivot.getBoundingClientRect();
  const px = pivotRect.left - contRect.left + pivotRect.width / 2;
  const py = pivotRect.top - contRect.top + pivotRect.height / 2;
  return { px, py };
}

export function axisAndNormal(angleRad) {
  const ux = Math.cos(angleRad);
  const uy = Math.sin(angleRad);
  const nx = Math.sin(angleRad);
  const ny = -Math.cos(angleRad);
  return { ux, uy, nx, ny, a: angleRad };
}

export function computeTargetCenter(container, pivot, plank, distanceFromPivot, radius, angleRad, dropFactor = 0) {
  const { px, py } = getPivotLocal(container, pivot);
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

export function createObjectDOM(obj) {
  const el = document.createElement("div");
  el.className = "weight-object";
  el.textContent = `${obj.weight}kg`;
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
  el.dataset.objId = obj.id;
  return el;
}

export function renderObjects(container, objects, plank, currentAngle) {
  document.querySelectorAll(".weight-object").forEach((n) => n.remove());
  objects.forEach((obj) => {
    const el = createObjectDOM(obj);
    container.appendChild(el);
  });
  updateObjectPositions(container, pivot, plank, currentAngle, objects, true);
}

export function updateObjectPositions(container, pivot, plank, currentAngle, objects, instant = false) {
  const angleDeg = currentAngle * (180 / Math.PI);
  plank.style.transform = `translateX(-50%) rotate(${angleDeg}deg)`;

  document.querySelectorAll(".weight-object").forEach((el) => {
    const objId = parseInt(el.dataset.objId);
    const obj = objects.find(o => o.id === objId);
    if (!obj) return;

    const dist = parseFloat(el.dataset.x);
    const size = parseFloat(el.style.width) || 28;
    const r = size / 2;

    const isDropping = obj.isDropping || false;
    const dropFactor = obj.dropProgress || 0;

    const { cx, cy } = computeTargetCenter(container, pivot, plank, dist, r, currentAngle, dropFactor);
    if (instant || !isDropping) {
      el.style.transition = "left 0.05s linear, top 0.05s linear";
    } else {
      el.style.transition = "none";
    }

    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;
  });
}

export function addLog(obj, logList, deleteWeight) {
  const li = document.createElement("li");
  li.className = "log-item";
  const side = obj.x >= 0 ? "SAĞ" : "SOL";
  const pos = Math.abs(obj.x.toFixed(0));

  const textSpan = document.createElement("span");
  textSpan.className = "log-text";
  textSpan.textContent = `Ağırlık: ${obj.weight} kg | Konum: ${side} tarafa konumlandırıldı. (${pos}) px`;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Sil";

  deleteBtn.addEventListener("click", () => deleteWeight(obj.id, li));

  li.appendChild(textSpan);
  li.appendChild(deleteBtn);
  logList.prepend(li);
}
