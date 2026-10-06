// There is no screech sample in assets/, so the sound is synthesized: white
// noise (random samples) squeezed through a narrow band-pass filter turns
// into a thin, high "squeal". Its volume follows how hard and how fast the
// car is braking, and its pitch drops as the car slows down.
export const BRAKE_TUNING = Object.freeze({
  minimumSpeed: 9,
  fullSpeed: 26,
  maximumGain: 0.07,
  minimumFilterHz: 1300,
  maximumFilterHz: 2700,
  smoothingSeconds: 0.06,
});

export function createBrakeScreech(context, destination) {
  const noiseBuffer = context.createBuffer(
    1,
    context.sampleRate * 2,
    context.sampleRate,
  );
  const samples = noiseBuffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 9;
  filter.frequency.value = BRAKE_TUNING.minimumFilterHz;

  const gain = context.createGain();
  gain.gain.value = 0;

  source.connect(filter).connect(gain).connect(destination);
  source.start();

  // Returns the target volume so the audio system can expose it for debugging.
  function update(vehicleState) {
    const now = context.currentTime;
    const speedFactor = clamp01(
      (Math.abs(vehicleState.speed) - BRAKE_TUNING.minimumSpeed) /
        (BRAKE_TUNING.fullSpeed - BRAKE_TUNING.minimumSpeed),
    );
    const volume =
      vehicleState.brake > 0.4
        ? BRAKE_TUNING.maximumGain * vehicleState.brake * speedFactor
        : 0;
    const filterHz =
      BRAKE_TUNING.minimumFilterHz +
      (BRAKE_TUNING.maximumFilterHz - BRAKE_TUNING.minimumFilterHz) *
        speedFactor;

    gain.gain.setTargetAtTime(volume, now, BRAKE_TUNING.smoothingSeconds);
    filter.frequency.setTargetAtTime(
      filterHz,
      now,
      BRAKE_TUNING.smoothingSeconds,
    );
    return volume;
  }

  return { update };
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}
