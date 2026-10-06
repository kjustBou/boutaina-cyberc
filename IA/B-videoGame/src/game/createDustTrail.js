import * as THREE from "three";

const MAX_PARTICLES = 90;
const SPAWN_SPEED_THRESHOLD = 10;
const PARTICLE_LIFETIME = 0.9;
const SPAWN_INTERVAL = 0.035;

// One pool of particles is created up front and recycled forever: each
// particle is "dead" (scale 0) until spawned, then ages until it fades out.
// This avoids creating/destroying objects every frame, which would be slow
// and would pressure the garbage collector.
export function createDustTrail() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(MAX_PARTICLES * 3);
  const opacities = new Float32Array(MAX_PARTICLES);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xbfc7d6,
    size: 0.5,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  const ages = new Float32Array(MAX_PARTICLES).fill(Infinity);
  let nextSlot = 0;
  let timeSinceSpawn = 0;
  const rearOffset = new THREE.Vector3();

  function update(vehicleState, deltaTime) {
    const speed = Math.abs(vehicleState.speed);

    if (speed > SPAWN_SPEED_THRESHOLD) {
      timeSinceSpawn += deltaTime;
      // Spawn faster at higher speed, capped by SPAWN_INTERVAL as a floor.
      const interval = Math.max(SPAWN_INTERVAL, 0.3 / (speed / 20));
      while (timeSinceSpawn >= interval) {
        timeSinceSpawn -= interval;
        spawnParticle(vehicleState);
      }
    }

    for (let index = 0; index < MAX_PARTICLES; index += 1) {
      if (ages[index] === Infinity) continue;
      ages[index] += deltaTime;
      const life = ages[index] / PARTICLE_LIFETIME;
      if (life >= 1) {
        ages[index] = Infinity;
        positions[index * 3 + 1] = -1000; // park off-screen
        continue;
      }
      positions[index * 3 + 1] += deltaTime * 0.4; // drift upward slightly
    }
    geometry.attributes.position.needsUpdate = true;
  }

  function spawnParticle(vehicleState) {
    const slot = nextSlot;
    nextSlot = (nextSlot + 1) % MAX_PARTICLES;
    ages[slot] = 0;

    rearOffset.set((Math.random() - 0.5) * 1.6, 0.1, -2.4 - Math.random() * 0.6);
    rearOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicleState.heading);

    positions[slot * 3] = vehicleState.position.x + rearOffset.x;
    positions[slot * 3 + 1] = rearOffset.y;
    positions[slot * 3 + 2] = vehicleState.position.z + rearOffset.z;
  }

  return { object: points, update };
}
