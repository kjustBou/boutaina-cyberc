import * as THREE from "three";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const desiredPosition = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();
const localOffset = new THREE.Vector3();

// After standing still this long, the camera eases into a slow orbit instead
// of staying locked behind the car — a cinematic touch for a stopped,
// admiring moment rather than active driving.
const IDLE_DELAY_SECONDS = 4;
const IDLE_ORBIT_SPEED = 0.18;
const IDLE_BLEND_SECONDS = 2.5;

export function createChaseCamera(camera) {
  const currentTarget = new THREE.Vector3();
  let initialized = false;
  let idleSeconds = 0;
  let idleAngle = 0;

  function update(vehicleState, deltaTime, snap = false) {
    const isMoving = Math.abs(vehicleState.speed) > 0.3;
    idleSeconds = isMoving ? 0 : idleSeconds + deltaTime;
    const idleBlend = clamp01(
      (idleSeconds - IDLE_DELAY_SECONDS) / IDLE_BLEND_SECONDS,
    );
    idleAngle += deltaTime * IDLE_ORBIT_SPEED * idleBlend;

    const speedStretch = vehicleState.normalizedSpeed * 1.5;
    localOffset.set(2.2, 2.55, -6.8 - speedStretch);
    localOffset.applyAxisAngle(WORLD_UP, vehicleState.heading + idleAngle);

    desiredPosition.set(
      vehicleState.position.x,
      0,
      vehicleState.position.z,
    );
    desiredPosition.add(localOffset);

    const lookAhead = 3.5 + vehicleState.normalizedSpeed * 4;
    desiredTarget.set(
      vehicleState.position.x + Math.sin(vehicleState.heading) * lookAhead,
      0.8,
      vehicleState.position.z + Math.cos(vehicleState.heading) * lookAhead,
    );

    if (!initialized || snap) {
      camera.position.copy(desiredPosition);
      currentTarget.copy(desiredTarget);
      initialized = true;
    } else {
      const positionBlend = 1 - Math.exp(-4.2 * deltaTime);
      const targetBlend = 1 - Math.exp(-5.2 * deltaTime);
      camera.position.lerp(desiredPosition, positionBlend);
      currentTarget.lerp(desiredTarget, targetBlend);
    }

    camera.lookAt(currentTarget);
  }

  return { update };
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}
