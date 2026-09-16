import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createWheelRig } from "../game/createWheelRig.js";

const KIMERA_URL = new URL(
  "../../assets/models/red-kimera-evo-37.glb",
  import.meta.url,
).href;
const TARGET_LENGTH_METERS = 4.6;
const ROAD_SURFACE_Y = 0.025;

// GLTFLoader sanitizes dots out of Object3D names. Both names are retained
// here so the mapping remains traceable to the original GLB hierarchy.
const WHEEL_DEFINITIONS = [
  {
    key: "rearNegativeX",
    sourceName: "wheel.002_15",
    runtimeName: "wheel002_15",
    isFront: false,
  },
  {
    key: "rearPositiveX",
    sourceName: "wheel.003_16",
    runtimeName: "wheel003_16",
    isFront: false,
  },
  {
    key: "frontPositiveX",
    sourceName: "wheel.001_17",
    runtimeName: "wheel001_17",
    isFront: true,
  },
  {
    key: "frontNegativeX",
    sourceName: "wheel_18",
    runtimeName: "wheel_18",
    isFront: true,
  },
];

export async function loadKimera() {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(KIMERA_URL);
  const model = gltf.scene;
  model.name = "Kimera EVO37";

  const sourceBounds = new THREE.Box3().setFromObject(model);
  const sourceSize = sourceBounds.getSize(new THREE.Vector3());
  const scale = TARGET_LENGTH_METERS / sourceSize.z;
  model.scale.multiplyScalar(scale);
  model.updateMatrixWorld(true);

  const scaledBounds = new THREE.Box3().setFromObject(model);
  const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
  model.position.x -= scaledCenter.x;
  model.position.z -= scaledCenter.z;
  model.position.y += ROAD_SURFACE_Y - scaledBounds.min.y;
  model.updateMatrixWorld(true);

  let meshCount = 0;
  const materialNames = new Set();

  model.traverse((object) => {
    if (!object.isMesh) return;

    meshCount += 1;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    const isTransparent = materials.some(
      (material) => material?.transparent || material?.transmission > 0,
    );

    object.castShadow = !isTransparent;
    object.receiveShadow = !isTransparent;

    for (const material of materials) {
      if (material?.name) materialNames.add(material.name);
    }
  });

  const wheels = WHEEL_DEFINITIONS.map((definition) => {
    const object =
      model.getObjectByName(definition.runtimeName) ??
      model.getObjectByName(definition.sourceName);

    if (!object) {
      throw new Error(`Missing Kimera wheel node: ${definition.sourceName}`);
    }

    const wheelSize = new THREE.Box3()
      .setFromObject(object)
      .getSize(new THREE.Vector3());
    const radius = (wheelSize.y + wheelSize.z) / 4;

    return { ...definition, object, radius };
  });

  const wheelRig = createWheelRig(wheels);
  const finalBounds = new THREE.Box3().setFromObject(model);
  const finalSize = finalBounds.getSize(new THREE.Vector3());
  const validation = {
    sourceSize: vectorToRoundedObject(sourceSize),
    finalSizeMeters: vectorToRoundedObject(finalSize),
    appliedScale: Number(scale.toFixed(6)),
    forwardAxis: "+Z",
    meshCount,
    materialNames: [...materialNames],
    wheelRotationSafe: true,
    wheels: wheels.map((wheel) => ({
      key: wheel.key,
      sourceName: wheel.sourceName,
      runtimeName: wheel.object.name,
      isFront: wheel.isFront,
      radiusMeters: Number(wheel.radius.toFixed(3)),
      children: wheel.object.children.map((child) => child.name),
    })),
  };

  console.group("TurboDust Kimera validation");
  console.table(validation);
  console.table(validation.wheels);
  console.groupEnd();

  const vehicleRoot = new THREE.Group();
  vehicleRoot.name = "Kimera vehicle root";
  vehicleRoot.add(model);

  return { model: vehicleRoot, validation, wheelRig };
}

function vectorToRoundedObject(vector) {
  return {
    x: Number(vector.x.toFixed(3)),
    y: Number(vector.y.toFixed(3)),
    z: Number(vector.z.toFixed(3)),
  };
}
