const ENGINE_URL = new URL(
  "../../assets/audio/engine/astonmartinvantagev12-chevrolet-corvette-c6-sound-effect-.mp3",
  import.meta.url,
).href;
const MUSIC_URL = new URL(
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
    minimumPlaybackRate: 0.68,
    maximumPlaybackRate: 1.48,
    idleGain: 0.09,
    rpmGain: 0.13,
    throttleGain: 0.1,
    minimumFilterHz: 1050,
    maximumFilterHz: 6500,
    smoothingSeconds: 0.08,
  }),
  music: Object.freeze({
    baseGain: 0.18,
    intensityGain: 0.025,
    minimumFilterHz: 10500,
    maximumFilterHz: 13500,
    smoothingSeconds: 0.35,
  }),
});

export function createAudioSystem() {
  const musicElement = new Audio(MUSIC_URL);
  musicElement.preload = "auto";
  musicElement.loop = true;

  const engineBytesPromise = fetch(ENGINE_URL).then((response) => {
    if (!response.ok) {
      throw new Error(`Engine sample failed to load (${response.status}).`);
    }
    return response.arrayBuffer();
  });

  let context = null;
  let engineSource = null;
  let engineGain = null;
  let engineFilter = null;
  let musicGain = null;
  let musicFilter = null;
  let graphReadyPromise = null;
  const state = {
    started: false,
    contextState: "not-created",
    enginePlaybackRate: 0,
    engineGain: 0,
    engineFilterHz: 0,
    musicGain: 0,
    musicFilterHz: 0,
    musicPlaybackRate: 1,
    musicPaused: true,
    musicCurrentTime: 0,
  };

  async function prepare() {
    await engineBytesPromise;
    musicElement.load();
  }

  async function start() {
    if (state.started) {
      await context.resume();
      return;
    }

    if (!context) {
      context = new AudioContext({ latencyHint: "interactive" });
      const masterGain = context.createGain();
      masterGain.gain.value = AUDIO_TUNING.masterGain;
      masterGain.connect(context.destination);

      musicGain = context.createGain();
      musicGain.gain.value = AUDIO_TUNING.music.baseGain;
      musicFilter = context.createBiquadFilter();
      musicFilter.type = "lowpass";
      musicFilter.frequency.value = AUDIO_TUNING.music.minimumFilterHz;
      const musicSource = context.createMediaElementSource(musicElement);
      musicSource.connect(musicFilter).connect(musicGain).connect(masterGain);

      graphReadyPromise = createEngineGraph(context, masterGain);
    }

    // play() is invoked before the first await so it remains part of the user's
    // Start Drive gesture and satisfies browser autoplay policies.
    const musicPlayback = musicElement.play();
    const contextResume = context.resume();
    await Promise.all([musicPlayback, contextResume, graphReadyPromise]);
    state.started = true;
    state.contextState = context.state;
    state.musicPaused = musicElement.paused;
  }

  async function createEngineGraph(audioContext, masterGain) {
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
    engineSource.connect(engineFilter).connect(engineGain).connect(masterGain);
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
      rpmIntensity,
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

    engineSource.playbackRate.setTargetAtTime(
      engineRate,
      now,
      AUDIO_TUNING.engine.smoothingSeconds,
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

    state.contextState = context.state;
    state.enginePlaybackRate = engineRate;
    state.engineGain = engineVolume;
    state.engineFilterHz = engineFilterHz;
    state.musicGain = musicVolume;
    state.musicFilterHz = musicFilterHz;
    state.musicPlaybackRate = musicElement.playbackRate;
    state.musicPaused = musicElement.paused;
    state.musicCurrentTime = musicElement.currentTime;
  }

  return { prepare, start, update, state };
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function mix(start, end, amount) {
  return start + (end - start) * amount;
}
