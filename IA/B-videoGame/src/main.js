import "./styles.css";
import * as THREE from "three";
import { createAudioSystem } from "./audio/createAudioSystem.js";
import { applyVehicleTransform } from "./game/applyVehicleTransform.js";
import { createChaseCamera } from "./game/createChaseCamera.js";
import { createKeyboardInput } from "./game/createKeyboardInput.js";
import {
  createVehicleState,
  updateVehicleState,
} from "./game/vehicleState.js";
import { createScene } from "./scene/createScene.js";
import { createRoad } from "./scene/createRoad.js";
import { createNightEnvironment } from "./scene/createNightEnvironment.js";
import { createVehicleLights } from "./scene/createVehicleLights.js";
import { loadKimera } from "./scene/loadKimera.js";
import { createStartExperience } from "./ui/createStartExperience.js";

const canvas = document.querySelector("#game-canvas");
const loadingStatus = document.querySelector("#loading-status");
const { scene, camera, renderer, updateLighting } = createScene(canvas);
const timer = new THREE.Timer();
timer.connect(document);
const keyboard = createKeyboardInput();
const vehicleState = createVehicleState();
const chaseCamera = createChaseCamera(camera);
const road = createRoad();
const nightEnvironment = createNightEnvironment();
const audioSystem = createAudioSystem();
const startExperience = createStartExperience();
let vehicleModel = null;
let wheelRig = null;
let vehicleLights = null;

scene.add(road.object, nightEnvironment.object);

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
    applyVehicleTransform(vehicleModel, vehicleState);
    wheelRig.update(vehicleState, deltaTime);
    vehicleLights.update(vehicleState);
    chaseCamera.update(vehicleState, deltaTime);
    audioSystem.update(vehicleState);
  }

  road.update(vehicleState.position.z);
  nightEnvironment.update(vehicleState.position.z);
  updateLighting(vehicleState);

  renderer.render(scene, camera);
});
