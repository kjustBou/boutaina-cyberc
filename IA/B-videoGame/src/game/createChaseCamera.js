import * as THREE from "three";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const desiredPosition = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();
const localOffset = new THREE.Vector3();

export function createChaseCamera(camera) {
  const currentTarget = new THREE.Vector3();
  let initialized = false;

  function update(vehicleState, deltaTime, snap = false) {
    const speedStretch = vehicleState.normalizedSpeed * 1.5;
    localOffset.set(2.2, 2.55, -6.8 - speedStretch);
    localOffset.applyAxisAngle(WORLD_UP, vehicleState.heading);

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
