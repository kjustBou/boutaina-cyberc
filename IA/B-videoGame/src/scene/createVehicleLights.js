import * as THREE from "three";

export function createVehicleLights(vehicleRoot) {
  const object = new THREE.Group();
  object.name = "Kimera presentation lights";
  const tailMaterials = findMaterials(vehicleRoot, new Set(["tail", "tail_2"]));
  const headMaterials = findMaterials(vehicleRoot, new Set(["head", "lights"]));
  configureEmissiveMaterials(tailMaterials, 0xff1208, 2.4);
  configureEmissiveMaterials(headMaterials, 0xb9d8ff, 1.35);

  const rearGlow = new THREE.PointLight(0xff180c, 4.5, 5.5, 2);
  rearGlow.position.set(0, 0.66, -2.35);
  object.add(rearGlow);

  for (const x of [-0.64, 0.64]) {
    const beam = new THREE.SpotLight(
      0xb9d8ff,
      58,
      44,
      THREE.MathUtils.degToRad(21),
      0.72,
      1.4,
    );
    beam.position.set(x, 0.67, 2.05);
    beam.target.position.set(x * 0.8, 0.02, 18);
    beam.castShadow = false;
    object.add(beam, beam.target);
  }

  const bodyFill = new THREE.PointLight(0x456fb6, 1.1, 5, 2);
  bodyFill.position.set(0.2, 2.15, -0.5);
  object.add(bodyFill);

  vehicleRoot.add(object);

  function update(vehicleState) {
    const brakeIntensity = vehicleState.brake;
    for (const material of tailMaterials) {
      material.emissiveIntensity = 2.4 + brakeIntensity * 2.6;
    }
    rearGlow.intensity = 4.5 + brakeIntensity * 5;
  }

  return { object, update };
}

function findMaterials(root, names) {
  const matches = new Set();
  root.traverse((object) => {
    if (!object.isMesh) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) {
      if (names.has(material?.name)) matches.add(material);
    }
  });
  return matches;
}

function configureEmissiveMaterials(materials, color, intensity) {
  for (const material of materials) {
    if (!material.emissive) continue;
    material.emissive.setHex(color);
    material.emissiveIntensity = intensity;
    material.toneMapped = false;
    material.needsUpdate = true;
  }
}
