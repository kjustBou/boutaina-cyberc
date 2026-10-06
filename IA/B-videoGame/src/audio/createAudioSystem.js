import { createBrakeScreech } from "./createBrakeScreech.js";

const ENGINE_URL = new URL(
  "../../assets/audio/engine/astonmartinvantagev12-chevrolet-corvette-c6-sound-effect-.mp3",
  import.meta.url,
).href;
// Two versions of the same track. The calm one dominates at low speed and the
// energetic one takes over as the car speeds up. If they sound reversed to
// your ear, swap these two paths.
const CALM_MUSIC_URL = new URL(
  "../../assets/audio/music/Neon Horizon-250.mp3",
  import.meta.url,
).href;
const ENERGETIC_MUSIC_URL = new URL(
  "../../assets/audio/music/Neon Horizon-350.mp3",
  import.meta.url,
).href;

// These values are intentionally centralized so the mix can be tuned without
// changing how audio is connected to the vehicle state.
export const AUDIO_TUNING = Object.freeze({
  masterGain: 0.72,
  engine: Object.freeze({
    loopStart: 4.75,
    loopEnd: 7,
    // A narrower range and a slower glide keep the pitch from sweeping through
    // "many gears" while accelerating. Widen the range for a wilder engine.
    minimumPlaybackRate: 0.82,
    maximumPlaybackRate: 1.32,
    // Below 1, pitch climbs quickly at first and then levels off.
    pitchCurve: 0.7,
    pitchSmoothingSeconds: 0.3,
    idleGain: 0.09,
    rpmGain: 0.13,
    throttleGain: 0.1,
    minimumFilterHz: 1050,
    maximumFilterHz: 6500,
    smoothingSeconds: 0.08,
  }),
  music: Object.freeze({
    baseGain: 0.2,
    intensityGain: 0.05,
    minimumFilterHz: 10500,
    maximumFilterHz: 13500,
    smoothingSeconds: 0.35,
    // Speed range (0 to 1) over which the calm track fades into the
    // energetic one.
    crossfadeStart: 0.15,
    crossfadeEnd: 0.8,
  }),
});

export function createAudioSystem() {
  const calmElement = createMusicElement(CALM_MUSIC_URL);
  const energeticElement = createMusicElement(ENERGETIC_MUSIC_URL);

  const engineBytesPromise = fetch(ENGINE_URL).then((response) => {
    if (!response.ok) {
      throw new Error(`Engine sample failed to load (${response.status}).`);
    }
    return response.arrayBuffer();
  });

  let context = null;
  let masterGain = null;
  let engineSource = null;
  let engineGain = null;
  let engineFilter = null;
  let musicGain = null;
  let musicFilter = null;
  let calmGain = null;
  let energeticGain = null;
  let brakeScreech = null;
  let graphReadyPromise = null;
  let muted = false;
  const state = {
    started: false,
    muted: false,
    contextState: "not-created",
    enginePlaybackRate: 0,
    engineGain: 0,
    engineFilterHz: 0,
    musicGain: 0,
    musicFilterHz: 0,
    calmMusicGain: 1,
    energeticMusicGain: 0,
    brakeScreechGain: 0,
    musicPaused: true,
    calmCurrentTime: 0,
    energeticCurrentTime: 0,
  };

  async function prepare() {
    await engineBytesPromise;
    calmElement.load();
    energeticElement.load();
  }

  async function start() {
    if (state.started) {
      await context.resume();
      return;
    }

    if (!context) {
      context = new AudioContext({ latencyHint: "interactive" });
      masterGain = context.createGain();
      masterGain.gain.value = muted ? 0 : AUDIO_TUNING.masterGain;
      masterGain.connect(context.destination);

      // Both tracks feed one shared filter and volume, so speed can still
      // shape the whole music bus while the crossfade picks the track.
      musicGain = context.createGain();
      musicGain.gain.value = AUDIO_TUNING.music.baseGain;
      musicFilter = context.createBiquadFilter();
      musicFilter.type = "lowpass";
      musicFilter.frequency.value = AUDIO_TUNING.music.minimumFilterHz;
      musicFilter.connect(musicGain).connect(masterGain);

      calmGain = context.createGain();
      calmGain.gain.value = 1;
      context
        .createMediaElementSource(calmElement)
        .connect(calmGain)
        .connect(musicFilter);
      energeticGain = context.createGain();
      energeticGain.gain.value = 0;
      context
        .createMediaElementSource(energeticElement)
        .connect(energeticGain)
        .connect(musicFilter);

      brakeScreech = createBrakeScreech(context, masterGain);
      graphReadyPromise = createEngineGraph(context, masterGain);
    }

    // play() is invoked before the first await so it remains part of the user's
    // Start Drive gesture and satisfies browser autoplay policies. Both tracks
    // start together so their beats stay lined up while crossfading.
    const musicPlayback = Promise.all([
      calmElement.play(),
      energeticElement.play(),
    ]);
    const contextResume = context.resume();
    await Promise.all([musicPlayback, contextResume, graphReadyPromise]);
    state.started = true;
    state.contextState = context.state;
    state.musicPaused = calmElement.paused;
  }

  async function createEngineGraph(audioContext, destination) {
    const engineBytes = await engineBytesPromise;
    const engineBuffer = await audioContext.decodeAudioData(engineBytes.slice(0));

    engineSource = audioContext.createBufferSource();
    engineSource.buffer = engineBuffer;
    engineSource.loop = true;
    engineSource.loopStart = AUDIO_TUNING.engine.loopStart;
    engineSource.loopEnd = Math.min(
      AUDIO_TUNING.engine.loopEnd,
      engineBuffer.duration,
    );

    engineFilter = audioContext.createBiquadFilter();
    engineFilter.type = "lowpass";
    engineFilter.Q.value = 0.7;
    engineFilter.frequency.value = AUDIO_TUNING.engine.minimumFilterHz;
    engineGain = audioContext.createGain();
    engineGain.gain.value = 0;
    engineSource.connect(engineFilter).connect(engineGain).connect(destination);
    engineSource.start(0, AUDIO_TUNING.engine.loopStart);
  }

  function update(vehicleState) {
    if (!state.started || context.state !== "running") return;

    const now = context.currentTime;
    const rpmIntensity = clamp01((vehicleState.simulatedRpm - 850) / (6500 - 850));
    const throttleIntensity = Math.abs(vehicleState.throttle);
    const engineRate = mix(
      AUDIO_TUNING.engine.minimumPlaybackRate,
      AUDIO_TUNING.engine.maximumPlaybackRate,
      Math.pow(rpmIntensity, AUDIO_TUNING.engine.pitchCurve),
    );
    const engineVolume =
      AUDIO_TUNING.engine.idleGain +
      rpmIntensity * AUDIO_TUNING.engine.rpmGain +
      throttleIntensity * AUDIO_TUNING.engine.throttleGain;
    const engineFilterHz = mix(
      AUDIO_TUNING.engine.minimumFilterHz,
      AUDIO_TUNING.engine.maximumFilterHz,
      Math.min(1, rpmIntensity * 0.82 + throttleIntensity * 0.28),
    );
    const musicVolume =
      AUDIO_TUNING.music.baseGain +
      vehicleState.normalizedSpeed * AUDIO_TUNING.music.intensityGain;
    const musicFilterHz = mix(
      AUDIO_TUNING.music.minimumFilterHz,
      AUDIO_TUNING.music.maximumFilterHz,
      vehicleState.normalizedSpeed,
    );

    // Equal-power crossfade: sine and cosine keep the combined loudness steady
    // while one track fades out and the other fades in.
    const blend = clamp01(
      (vehicleState.normalizedSpeed - AUDIO_TUNING.music.crossfadeStart) /
        (AUDIO_TUNING.music.crossfadeEnd - AUDIO_TUNING.music.crossfadeStart),
    );
    const calmLevel = Math.cos(blend * Math.PI * 0.5);
    const energeticLevel = Math.sin(blend * Math.PI * 0.5);

    engineSource.playbackRate.setTargetAtTime(
      engineRate,
      now,
      AUDIO_TUNING.engine.pitchSmoothingSeconds,
    );
    engineGain.gain.setTargetAtTime(
      engineVolume,
      now,
      AUDIO_TUNING.engine.smoothingSeconds,
    );
    engineFilter.frequency.setTargetAtTime(
      engineFilterHz,
      now,
      AUDIO_TUNING.engine.smoothingSeconds,
    );
    musicGain.gain.setTargetAtTime(
      musicVolume,
      now,
      AUDIO_TUNING.music.smoothingSeconds,
    );
    musicFilter.frequency.setTargetAtTime(
      musicFilterHz,
      now,
      AUDIO_TUNING.music.smoothingSeconds,
    );
    calmGain.gain.setTargetAtTime(
      calmLevel,
      now,
      AUDIO_TUNING.music.smoothingSeconds,
    );
    energeticGain.gain.setTargetAtTime(
      energeticLevel,
      now,
      AUDIO_TUNING.music.smoothingSeconds,
    );

    state.contextState = context.state;
    state.enginePlaybackRate = engineRate;
    state.engineGain = engineVolume;
    state.engineFilterHz = engineFilterHz;
    state.musicGain = musicVolume;
    state.musicFilterHz = musicFilterHz;
    state.calmMusicGain = calmLevel;
    state.energeticMusicGain = energeticLevel;
    state.brakeScreechGain = brakeScreech.update(vehicleState);
    state.musicPaused = calmElement.paused;
    state.calmCurrentTime = calmElement.currentTime;
    state.energeticCurrentTime = energeticElement.currentTime;
  }

  // Mute only touches the master volume, so the game keeps running and the
  // sound resumes exactly where the music is.
  function toggleMute() {
    muted = !muted;
    state.muted = muted;
    if (masterGain) {
      masterGain.gain.setTargetAtTime(
        muted ? 0 : AUDIO_TUNING.masterGain,
        context.currentTime,
        0.05,
      );
    }
    return muted;
  }

  return { prepare, start, update, toggleMute, state };
}

function createMusicElement(url) {
  const element = new Audio(url);
  element.preload = "auto";
  element.loop = true;
  return element;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function mix(start, end, amount) {
  return start + (end - start) * amount;
}
