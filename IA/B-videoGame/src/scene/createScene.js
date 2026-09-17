import * as THREE from "three";

const BACKGROUND_COLOR = 0x02040d;

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND_COLOR);
  scene.fog = new THREE.Fog(BACKGROUND_COLOR, 42, 205);

  const camera = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    360,
  );
  camera.position.set(7.7, 3.4, -9.2);
  camera.lookAt(2.6, 0.85, 1.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const updateLighting = addNightLighting(scene);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  window.addEventListener("resize", resize);

  return {
    scene,
    camera,
    renderer,
    updateLighting,
    dispose() {
      window.removeEventListener("resize", resize);
      renderer.dispose();
    },
  };
}

function addNightLighting(scene) {
  const skyLight = new THREE.HemisphereLight(0x668dbd, 0x100b13, 1.35);
  scene.add(skyLight);

  const moonLight = new THREE.DirectionalLight(0xb8d4ff, 3.25);
  moonLight.position.set(-12, 18, 10);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.camera.left = -12;
  moonLight.shadow.camera.right = 12;
  moonLight.shadow.camera.top = 12;
  moonLight.shadow.camera.bottom = -12;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 50;
  scene.add(moonLight);
  scene.add(moonLight.target);

  const rimLight = new THREE.DirectionalLight(0x416ed1, 1.35);
  rimLight.position.set(8, 5, -10);
  scene.add(rimLight);
  scene.add(rimLight.target);

  const horizonLight = new THREE.DirectionalLight(0x9b4d57, 0.45);
  horizonLight.position.set(20, 4, 35);
  scene.add(horizonLight);
  scene.add(horizonLight.target);

  return function updateLighting(vehicleState) {
    const { x, z } = vehicleState.position;
    moonLight.position.set(x - 12, 18, z + 10);
    moonLight.target.position.set(x, 0, z + 3);
    rimLight.position.set(x + 8, 5, z - 10);
    rimLight.target.position.set(x, 0.7, z);
    horizonLight.position.z = z + 35;
    horizonLight.target.position.x = x;
    horizonLight.target.position.z = z;
  };
}
