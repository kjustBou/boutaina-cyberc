// A small, continuous sway so the car doesn't feel perfectly rigid: a slow
// bob driven by speed (like rolling over an uneven road) plus a quick dip
// when the throttle or brake changes hard (like weight shifting).
export function createSuspensionBob() {
  const state = { bobY: 0, pitch: 0 };
  let previousThrottle = 0;
  let previousBrake = 0;
  let wavePhase = 0;

  function update(vehicleState, deltaTime) {
    const speedFraction = Math.min(Math.abs(vehicleState.speed) / 30, 1);
    wavePhase += deltaTime * (2.2 + speedFraction * 3.5);

    const throttleChange = vehicleState.throttle - previousThrottle;
    const brakeChange = vehicleState.brake - previousBrake;
    previousThrottle = vehicleState.throttle;
    previousBrake = vehicleState.brake;

    const targetBob = Math.sin(wavePhase) * 0.012 * speedFraction;
    const targetPitch =
      -throttleChange * 0.05 + brakeChange * 0.07 - speedFraction * 0.01;

    // Smoothly glide towards the target instead of snapping, so the motion
    // reads as suspension rather than a glitch.
    state.bobY += (targetBob - state.bobY) * Math.min(1, deltaTime * 6);
    state.pitch += (targetPitch - state.pitch) * Math.min(1, deltaTime * 5);

    return state;
  }

  return { update, state };
}
