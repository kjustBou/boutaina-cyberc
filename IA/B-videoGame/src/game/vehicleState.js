import { ROAD_BOUNDS } from "../config/road.js";

export const VEHICLE_CONFIG = Object.freeze({
  maxForwardSpeed: 24,
  maxReverseSpeed: 6,
  forwardAcceleration: 5.2,
  reverseAcceleration: 3,
  brakeDeceleration: 9,
  coastDeceleration: 1.25,
  aerodynamicDrag: 0.0025,
  throttleResponse: 2.4,
  brakeResponse: 5,
  steeringResponse: 2.8,
  steeringReturn: 3.8,
  maxYawRate: 0.52,
  idleRpm: 850,
  maxRpm: 6500,
});

export function createVehicleState({ x = 2.6, z = 0 } = {}) {
  return {
    position: { x, z },
    heading: 0,
    speed: 0,
    throttle: 0,
    brake: 0,
    steering: 0,
    normalizedSpeed: 0,
    simulatedRpm: VEHICLE_CONFIG.idleRpm,
  };
}

export function updateVehicleState(state, input, deltaTime) {
  const dt = Math.min(Math.max(deltaTime, 0), 0.05);
  const forwardPressed = input.forward && !input.reverse;
  const reversePressed = input.reverse && !input.forward;

  let targetThrottle = 0;
  let isBraking = false;

  if (forwardPressed) {
    if (state.speed < -0.15) isBraking = true;
    else targetThrottle = 1;
  } else if (reversePressed) {
    if (state.speed > 0.15) isBraking = true;
    else targetThrottle = -1;
  }

  state.throttle = moveTowards(
    state.throttle,
    targetThrottle,
    VEHICLE_CONFIG.throttleResponse * dt,
  );
  state.brake = moveTowards(
    state.brake,
    isBraking ? 1 : 0,
    VEHICLE_CONFIG.brakeResponse * dt,
  );

  if (state.brake > 0.01) {
    state.speed = moveTowards(
      state.speed,
      0,
      VEHICLE_CONFIG.brakeDeceleration * state.brake * dt,
    );
  } else {
    const acceleration =
      state.throttle >= 0
        ? state.throttle * VEHICLE_CONFIG.forwardAcceleration
        : state.throttle * VEHICLE_CONFIG.reverseAcceleration;
    state.speed += acceleration * dt;

    const drag =
      VEHICLE_CONFIG.coastDeceleration +
      state.speed * state.speed * VEHICLE_CONFIG.aerodynamicDrag;
    state.speed = moveTowards(state.speed, 0, drag * dt);
  }

  state.speed = Math.min(
    VEHICLE_CONFIG.maxForwardSpeed,
    Math.max(-VEHICLE_CONFIG.maxReverseSpeed, state.speed),
  );

  // The vehicle faces +Z, so positive Y rotation appears left from the chase
  // camera. This mapping keeps the arrow direction aligned with the screen.
  const steeringTarget =
    (input.left ? 1 : 0) - (input.right ? 1 : 0);
  const steeringRate =
    steeringTarget === 0
      ? VEHICLE_CONFIG.steeringReturn
      : VEHICLE_CONFIG.steeringResponse;
  state.steering = moveTowards(
    state.steering,
    steeringTarget,
    steeringRate * dt,
  );

  const speedForSteering = Math.min(Math.abs(state.speed) / 8, 1);
  const travelDirection = Math.sign(state.speed);
  state.heading = normalizeAngle(
    state.heading +
      state.steering *
        VEHICLE_CONFIG.maxYawRate *
        speedForSteering *
        travelDirection *
        dt,
  );

  state.position.x += Math.sin(state.heading) * state.speed * dt;
  state.position.z += Math.cos(state.heading) * state.speed * dt;
  keepVehicleOnRoad(state, dt);

  state.normalizedSpeed = Math.min(
    Math.abs(state.speed) / VEHICLE_CONFIG.maxForwardSpeed,
    1,
  );
  state.simulatedRpm = Math.round(
    Math.min(
      VEHICLE_CONFIG.maxRpm,
      VEHICLE_CONFIG.idleRpm +
        state.normalizedSpeed * 4800 +
        Math.abs(state.throttle) * 500,
    ),
  );

  return state;
}

function keepVehicleOnRoad(state, dt) {
  const previousX = state.position.x;
  state.position.x = Math.min(
    ROAD_BOUNDS.maxX,
    Math.max(ROAD_BOUNDS.minX, state.position.x),
  );

  if (state.position.x !== previousX) {
    const pushingRight =
      state.position.x === ROAD_BOUNDS.maxX && Math.sin(state.heading) > 0;
    const pushingLeft =
      state.position.x === ROAD_BOUNDS.minX && Math.sin(state.heading) < 0;

    if (pushingRight || pushingLeft) {
      state.heading = moveTowards(state.heading, 0, 1.2 * dt);
    }
  }
}

function moveTowards(current, target, maximumChange) {
  if (current < target) return Math.min(current + maximumChange, target);
  if (current > target) return Math.max(current - maximumChange, target);
  return target;
}

function normalizeAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
