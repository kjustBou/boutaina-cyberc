import * as THREE from "three";

const AXLE_AXIS = new THREE.Vector3(1, 0, 0);
const STEERING_AXIS = new THREE.Vector3(0, 1, 0);
const MAX_STEERING_ANGLE = THREE.MathUtils.degToRad(24);
const FULL_ROTATION = Math.PI * 2;

export function createWheelRig(wheelDefinitions) {
  const wheels = wheelDefinitions.map((definition) => ({
    ...definition,
    baseQuaternion: definition.object.quaternion.clone(),
    spinAngle: 0,
  }));
  const steeringQuaternion = new THREE.Quaternion();
  const spinQuaternion = new THREE.Quaternion();
  const state = {
    steeringAngle: 0,
    spinAngles: Object.fromEntries(wheels.map((wheel) => [wheel.key, 0])),
  };

  function update(vehicleState, deltaTime) {
    state.steeringAngle = vehicleState.steering * MAX_STEERING_ANGLE;
    steeringQuaternion.setFromAxisAngle(STEERING_AXIS, state.steeringAngle);

    for (const wheel of wheels) {
      wheel.spinAngle =
        (wheel.spinAngle + (vehicleState.speed / wheel.radius) * deltaTime) %
        FULL_ROTATION;
      spinQuaternion.setFromAxisAngle(AXLE_AXIS, wheel.spinAngle);

      // Spin occurs around each wheel's local X axle. Front-wheel steering is
      // applied in the vehicle parent's Y axis before the imported transform.
      wheel.object.quaternion
        .copy(wheel.baseQuaternion)
        .multiply(spinQuaternion);
      if (wheel.isFront) {
        wheel.object.quaternion.premultiply(steeringQuaternion);
      }

      state.spinAngles[wheel.key] = wheel.spinAngle;
    }
  }

  return { update, state };
}
