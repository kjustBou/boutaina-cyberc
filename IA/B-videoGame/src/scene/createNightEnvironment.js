import * as THREE from "three";
import {
  ROAD_SEGMENT_COUNT,
  ROAD_SEGMENT_LENGTH,
} from "../config/road.js";

const HALF_SEGMENT_COUNT = Math.floor(ROAD_SEGMENT_COUNT / 2);
const transform = new THREE.Object3D();

export function createNightEnvironment() {
  const object = new THREE.Group();
  object.name = "Night desert environment";

  const skyAnchor = createSkyAnchor();
  object.add(skyAnchor);

  const resources = createSceneryResources();
  const segments = Array.from({ length: ROAD_SEGMENT_COUNT }, () => {
    const segment = createScenerySegment(resources);
    object.add(segment.object);
    return segment;
  });
  const state = {
    centerSegment: Number.NaN,
    recycledSegments: 0,
    visibleInstances: 0,
  };

  function update(vehicleZ, force = false) {
    skyAnchor.position.z = vehicleZ;

    const centerSegment = Math.floor(vehicleZ / ROAD_SEGMENT_LENGTH);
    if (!force && centerSegment === state.centerSegment) return;

    state.centerSegment = centerSegment;
    for (let offset = -HALF_SEGMENT_COUNT; offset <= HALF_SEGMENT_COUNT; offset += 1) {
      const worldSegment = centerSegment + offset;
      const slot = positiveModulo(worldSegment, segments.length);
      const segment = segments[slot];
      if (!force && segment.object.userData.worldSegment === worldSegment) continue;
      segment.object.position.z = worldSegment * ROAD_SEGMENT_LENGTH;
      segment.object.userData.worldSegment = worldSegment;
      segment.visibleInstances = segment.populate(worldSegment);
    }
    state.visibleInstances = segments.reduce(
      (total, segment) => total + segment.visibleInstances,
      0,
    );
    state.recycledSegments += 1;
  }

  update(0, true);
  return { object, update, state };
}

function createSkyAnchor() {
  const anchor = new THREE.Group();
  anchor.name = "Following night sky";

  const starCount = 850;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const random = createRandom(4731);
  const warmStar = new THREE.Color(0xffe8cf);
  const coolStar = new THREE.Color(0x9fcaff);

  for (let index = 0; index < starCount; index += 1) {
    const positionIndex = index * 3;
    positions[positionIndex] = (random() - 0.5) * 300;
    positions[positionIndex + 1] = 18 + random() * 92;
    positions[positionIndex + 2] = (random() - 0.5) * 360;

    const color = random() > 0.82 ? warmStar : coolStar;
    const brightness = 0.45 + random() * 0.55;
    colors[positionIndex] = color.r * brightness;
    colors[positionIndex + 1] = color.g * brightness;
    colors[positionIndex + 2] = color.b * brightness;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      size: 0.2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      fog: false,
    }),
  );
  stars.name = "Procedural stars";
  anchor.add(stars);

  const skyGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(190, 58),
    new THREE.MeshBasicMaterial({
      map: createSkyGlowTexture(),
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
    }),
  );
  skyGlow.name = "Faint aurora haze";
  skyGlow.position.set(10, 42, 155);
  anchor.add(skyGlow);

  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 32),
    new THREE.MeshBasicMaterial({
      color: 0xb7d3e8,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      fog: false,
      side: THREE.DoubleSide,
    }),
  );
  moon.name = "Distant moon";
  moon.position.set(-52, 43, 150);
  anchor.add(moon);

  return anchor;
}

function createSkyGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(22, 118, 118, 0)");
  gradient.addColorStop(0.35, "rgba(31, 124, 112, 0.7)");
  gradient.addColorStop(0.62, "rgba(84, 37, 96, 0.35)");
  gradient.addColorStop(1, "rgba(5, 10, 28, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSceneryResources() {
  return {
    mountainGeometry: new THREE.ConeGeometry(1, 1, 6),
    rockGeometry: new THREE.DodecahedronGeometry(1, 0),
    poleGeometry: new THREE.CylinderGeometry(0.035, 0.055, 1, 6),
    lightGeometry: new THREE.SphereGeometry(0.11, 7, 5),
    palmTrunkGeometry: new THREE.CylinderGeometry(0.07, 0.12, 1, 6),
    palmCrownGeometry: new THREE.ConeGeometry(1, 0.55, 7),
    buildingGeometry: new THREE.BoxGeometry(1, 1, 1),
    mountainMaterial: new THREE.MeshBasicMaterial({ color: 0x080b13 }),
    rockMaterial: new THREE.MeshStandardMaterial({
      color: 0x14141a,
      roughness: 1,
    }),
    poleMaterial: new THREE.MeshStandardMaterial({
      color: 0x1b2028,
      roughness: 0.75,
      metalness: 0.3,
    }),
    lightMaterial: new THREE.MeshBasicMaterial({ color: 0xff9b57 }),
    palmMaterial: new THREE.MeshBasicMaterial({ color: 0x080d10 }),
    buildingMaterial: new THREE.MeshBasicMaterial({ color: 0x070a12 }),
    cityLightMaterial: new THREE.MeshBasicMaterial({ color: 0xb84b58 }),
  };
}

function createScenerySegment(resources) {
  const object = new THREE.Group();
  object.name = "Recycled scenery segment";

  const mountains = createInstances(
    resources.mountainGeometry,
    resources.mountainMaterial,
    4,
  );
  const rocks = createInstances(
    resources.rockGeometry,
    resources.rockMaterial,
    5,
  );
  const poles = createInstances(
    resources.poleGeometry,
    resources.poleMaterial,
    4,
  );
  const poleLights = createInstances(
    resources.lightGeometry,
    resources.lightMaterial,
    4,
  );
  const palmTrunks = createInstances(
    resources.palmTrunkGeometry,
    resources.palmMaterial,
    2,
  );
  const palmCrowns = createInstances(
    resources.palmCrownGeometry,
    resources.palmMaterial,
    2,
  );
  const buildings = createInstances(
    resources.buildingGeometry,
    resources.buildingMaterial,
    5,
  );
  const cityLights = createInstances(
    resources.lightGeometry,
    resources.cityLightMaterial,
    5,
  );

  object.add(
    mountains,
    rocks,
    poles,
    poleLights,
    palmTrunks,
    palmCrowns,
    buildings,
    cityLights,
  );

  function populate(worldSegment) {
    const random = createRandom(worldSegment * 7919 + 104729);
    let visibleInstances = 0;

    for (let index = 0; index < mountains.count; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const radius = 7 + random() * 11;
      const height = 6 + random() * 11;
      setInstance(
        mountains,
        index,
        side * (45 + random() * 50),
        height / 2 - 0.1,
        localZ(random),
        radius * 1.5,
        height,
        radius,
        random() * Math.PI,
      );
    }
    visibleInstances += mountains.count;

    for (let index = 0; index < rocks.count; index += 1) {
      const side = random() < 0.5 ? -1 : 1;
      const size = 0.35 + random() * 1.25;
      setInstance(
        rocks,
        index,
        side * (7.3 + random() * 15),
        size * 0.42,
        localZ(random),
        size * (0.8 + random() * 0.7),
        size * 0.8,
        size,
        random() * Math.PI,
      );
    }
    visibleInstances += rocks.count;

    const poleCount = random() > 0.32 ? 2 : 0;
    poles.count = poleCount;
    poleLights.count = poleCount;
    for (let index = 0; index < poleCount; index += 1) {
      const side = index === 0 ? -1 : 1;
      const x = side * (7.2 + random() * 1.5);
      const z = localZ(random);
      const height = 4 + random() * 1.8;
      setInstance(poles, index, x, height / 2, z, 1, height, 1);
      setInstance(poleLights, index, x, height, z, 1, 1, 1);
    }
    visibleInstances += poleCount * 2;

    const palmCount = Math.abs(worldSegment) % 4 === 2 ? 1 : 0;
    palmTrunks.count = palmCount;
    palmCrowns.count = palmCount;
    for (let index = 0; index < palmCount; index += 1) {
      const side = random() < 0.5 ? -1 : 1;
      const x = side * (10 + random() * 9);
      const z = localZ(random);
      const height = 4.5 + random() * 2.8;
      setInstance(palmTrunks, index, x, height / 2, z, 1, height, 1);
      setInstance(palmCrowns, index, x, height + 0.2, z, 1.7, 1.3, 1.7);
    }
    visibleInstances += palmCount * 2;

    const buildingCount = Math.abs(worldSegment) % 7 === 3 ? 5 : 0;
    buildings.count = buildingCount;
    cityLights.count = buildingCount;
    const citySide = random() < 0.5 ? -1 : 1;
    for (let index = 0; index < buildingCount; index += 1) {
      const height = 3 + random() * 8;
      const x = citySide * (38 + index * 3.2 + random() * 2);
      const z = -22 + index * 8 + random() * 3;
      setInstance(buildings, index, x, height / 2, z, 2.2, height, 2.2);
      setInstance(cityLights, index, x, height * 0.72, z - 1.12, 0.55, 0.55, 0.55);
    }
    visibleInstances += buildingCount * 2;

    for (const mesh of [
      mountains,
      rocks,
      poles,
      poleLights,
      palmTrunks,
      palmCrowns,
      buildings,
      cityLights,
    ]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }

    return visibleInstances;
  }

  return { object, populate, visibleInstances: 0 };
}

function createInstances(geometry, material, count) {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.count = count;
  return mesh;
}

function setInstance(
  mesh,
  index,
  x,
  y,
  z,
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
  rotationY = 0,
) {
  transform.position.set(x, y, z);
  transform.rotation.set(0, rotationY, 0);
  transform.scale.set(scaleX, scaleY, scaleZ);
  transform.updateMatrix();
  mesh.setMatrixAt(index, transform.matrix);
}

function localZ(random) {
  return (random() - 0.5) * (ROAD_SEGMENT_LENGTH - 5);
}

function createRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
