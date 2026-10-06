import "./styles.css";
import * as THREE from "three";
import { createAudioSystem } from "./audio/createAudioSystem.js";
import { applyVehicleTransform } from "./game/applyVehicleTransform.js";
import { createChaseCamera } from "./game/createChaseCamera.js";
import { createDustTrail } from "./game/createDustTrail.js";
import { createKeyboardInput } from "./game/createKeyboardInput.js";
import { createSuspensionBob } from "./game/createSuspensionBob.js";
import {
  createVehicleState,
  updateVehicleState,
} from "./game/vehicleState.js";
import { createScene } from "./scene/createScene.js";
import { createRoad } from "./scene/createRoad.js";
import { createNightEnvironment } from "./scene/createNightEnvironment.js";
import { createVehicleLights } from "./scene/createVehicleLights.js";
import { loadKimera } from "./scene/loadKimera.js";
import { createHud } from "./ui/createHud.js";
import { createStartExperience } from "./ui/createStartExperience.js";

const canvas = document.querySelector("#game-canvas");
const loadingStatus = document.querySelector("#loading-status");
const { scene, camera, renderer, updateLighting } = createScene(canvas);
const timer = new THREE.Timer();
timer.connect(document);
const keyboard = createKeyboardInput();
const vehicleState = createVehicleState();
const chaseCamera = createChaseCamera(camera);
const suspension = createSuspensionBob();
const dustTrail = createDustTrail();
const road = createRoad();
const nightEnvironment = createNightEnvironment();
const audioSystem = createAudioSystem();
const startExperience = createStartExperience();
const hud = createHud();
let vehicleModel = null;
let wheelRig = null;
let vehicleLights = null;

scene.add(road.object, nightEnvironment.object, dustTrail.object);

// M toggles the sound. The page shows a small "Sound off" label through the
// data-muted attribute, the same way the start screen is driven by
// data-experience.
window.addEventListener("keydown", (event) => {
  if (event.code !== "KeyM" || event.repeat) return;
  document.body.dataset.muted = String(audioSystem.toggleMute());
});

try {
  const [loadedVehicle] = await Promise.all([
    loadKimera(),
    audioSystem.prepare(),
  ]);
  const { model, validation } = loadedVehicle;
  vehicleModel = model;
  wheelRig = loadedVehicle.wheelRig;
  vehicleLights = createVehicleLights(vehicleModel);
  applyVehicleTransform(vehicleModel, vehicleState);
  chaseCamera.update(vehicleState, 0, true);
  scene.add(vehicleModel);

  window.__TURBODUST_VALIDATION__ = validation;
  window.__TURBODUST_VEHICLE_STATE__ = vehicleState;
  window.__TURBODUST_WHEEL_STATE__ = wheelRig.state;
  window.__TURBODUST_AUDIO_STATE__ = audioSystem.state;
  window.__TURBODUST_WORLD_STATE__ = {
    road: road.state,
    environment: nightEnvironment.state,
  };
  document.body.dataset.appStatus = "ready";
  loadingStatus.textContent = "Night drive ready";

  startExperience.setReady(async () => {
    await audioSystem.start();
  });
} catch (error) {
  console.error("Could not prepare TurboDust.", error);
  loadingStatus.textContent = "TurboDust failed to load";
  startExperience.setError("The drive could not be prepared");
}

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const deltaTime = Math.min(timer.getDelta(), 0.05);

  if (vehicleModel) {
    if (startExperience.state.started) {
      updateVehicleState(vehicleState, keyboard.state, deltaTime);
    }
    const suspensionState = suspension.update(vehicleState, deltaTime);
    applyVehicleTransform(vehicleModel, vehicleState, suspensionState);
    wheelRig.update(vehicleState, deltaTime);
    vehicleLights.update(vehicleState);
    chaseCamera.update(vehicleState, deltaTime);
    audioSystem.update(vehicleState);
    hud.update(vehicleState);
    dustTrail.update(vehicleState, deltaTime);
  }

  road.update(vehicleState.position.z);
  nightEnvironment.update(vehicleState.position.z, timer.getElapsed());
  updateLighting(vehicleState);

  renderer.render(scene, camera);
});
