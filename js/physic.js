export function calculateTorque(objects, G, leftWeightEl, rightWeightEl, totalWeightEl) {
  let leftTorque = 0, rightTorque = 0, totalLeftWeight = 0, totalRightWeight = 0;

  objects.forEach((obj) => {
    const d = obj.x;
    const force = obj.weight * G;
    if (d < 0) {
      leftTorque += Math.abs(d) * force;
      totalLeftWeight += obj.weight;
    } else {
      rightTorque += d * force;
      totalRightWeight += obj.weight;
    }
  });

  leftWeightEl.textContent = totalLeftWeight.toFixed(1);
  rightWeightEl.textContent = totalRightWeight.toFixed(1);
  totalWeightEl.textContent = (totalLeftWeight + totalRightWeight).toFixed(1);

  return rightTorque - leftTorque;
}

export function calculateMomentOfInertia(objects, BOARD_MASS_I_FACTOR) {
  let I = 0;
  objects.forEach((obj) => {
    I += obj.weight * Math.pow(obj.x, 2);
  });
  return I + BOARD_MASS_I_FACTOR;
}

export function updateDropAnimations(objects, deltaTime, DROP_DURATION) {
  objects.forEach(obj => {
    if (obj.isDropping) {
      obj.dropTimer = (obj.dropTimer || 0) + deltaTime;
      let progress = 1 - Math.min(1, obj.dropTimer / DROP_DURATION);
      obj.dropProgress = Math.pow(progress, 2);

      if (obj.dropProgress === 0) {
        obj.isDropping = false;
        delete obj.dropTimer;
        delete obj.dropProgress;
        localStorage.setItem("seesawObjects", JSON.stringify(objects));
      }
    }
  });
}
