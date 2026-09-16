import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MUSTANG_URL = new URL(
  "../../assets/models/mustang-alpha-2k.glb",
  import.meta.url,
).href;
const TARGET_LENGTH_METERS = 4.6;
const ROAD_SURFACE_Y = 0.025;

export async function loadMustang() {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(MUSTANG_URL);
  const model = gltf.scene;
  model.name = "Mustang Alpha";

  const sourceBounds = new THREE.Box3().setFromObject(model);
  const sourceSize = sourceBounds.getSize(new THREE.Vector3());

  // Sketchfab exports can use different forward axes. The longest horizontal
  // dimension is the car length, which this scene aligns with the Z axis.
  const rotatedToRoad = sourceSize.x > sourceSize.z;
  if (rotatedToRoad) {
    model.rotation.y = Math.PI / 2;
    model.updateMatrixWorld(true);
  }

  const alignedBounds = new THREE.Box3().setFromObject(model);
  const alignedSize = alignedBounds.getSize(new THREE.Vector3());
  const sourceLength = Math.max(alignedSize.x, alignedSize.z);
  const scale = TARGET_LENGTH_METERS / sourceLength;
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
    object.castShadow = true;
    object.receiveShadow = true;

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) {
      if (material?.name) materialNames.add(material.name);
    }
  });

  const wheelGroups = ["Wheel", "Wheel_4"]
    .map((name) => model.getObjectByName(name))
    .filter(Boolean);
  const finalBounds = new THREE.Box3().setFromObject(model);
  const finalSize = finalBounds.getSize(new THREE.Vector3());

  const validation = {
    sourceSize: vectorToRoundedObject(sourceSize),
    finalSizeMeters: vectorToRoundedObject(finalSize),
    appliedScale: Number(scale.toFixed(6)),
    rotatedToRoad,
    meshCount,
    materialNames: [...materialNames],
    wheelGroups: wheelGroups.map((wheel) => ({
      name: wheel.name,
      children: wheel.children.map((child) => child.name),
    })),
    wheelLayout: "Each group contains the front and rear wheel on one side",
    wheelRotationSafe: false,
  };

  console.group("TurboDust Mustang validation");
  console.table(validation);
  console.log("Wheel hierarchy", validation.wheelGroups);
  console.groupEnd();

  // The wrapper owns driving transforms while the child keeps the corrective
  // scale, rotation, and centering required by the Sketchfab export.
  const vehicleRoot = new THREE.Group();
  vehicleRoot.name = "Mustang vehicle root";
  vehicleRoot.add(model);

  return { model: vehicleRoot, validation };
}

function vectorToRoundedObject(vector) {
  return {
    x: Number(vector.x.toFixed(3)),
    y: Number(vector.y.toFixed(3)),
    z: Number(vector.z.toFixed(3)),
  };
}
