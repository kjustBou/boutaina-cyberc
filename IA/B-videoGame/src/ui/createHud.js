import { VEHICLE_CONFIG } from "../game/vehicleState.js";

// The dial is stylised: whatever the car's real top speed is in the game's
// units, full speed reads as DISPLAY_MAX_SPEED. That keeps the gauge feeling
// right even when the car is retuned in vehicleState.js.
const DISPLAY_MAX_SPEED = 180;
const TICK_STEP = 10;
const LABEL_STEP = 20;
const REDLINE_FROM = 140;

// 0deg points straight up. The needle sweeps 270deg, leaving a gap at the
// bottom like a classic dial.
const SWEEP_START_DEGREES = -135;
const SWEEP_DEGREES = 270;

const SVG_NS = "http://www.w3.org/2000/svg";

export function createHud() {
  const ticks = document.querySelector("#hud-ticks");
  const needle = document.querySelector("#hud-needle");
  const speedText = document.querySelector("#hud-speed");
  const rpmFill = document.querySelector("#hud-rpm-fill");

  buildTicks(ticks);

  let shownSpeed = -1;
  let shownAngle = Number.NaN;
  let shownRpm = -1;

  function update(vehicleState) {
    const speedFraction = Math.min(
      Math.abs(vehicleState.speed) / VEHICLE_CONFIG.maxForwardSpeed,
      1,
    );
    const displaySpeed = Math.round(speedFraction * DISPLAY_MAX_SPEED);
    if (displaySpeed !== shownSpeed) {
      shownSpeed = displaySpeed;
      speedText.textContent = displaySpeed;
    }

    const angle = Number(
      (SWEEP_START_DEGREES + speedFraction * SWEEP_DEGREES).toFixed(1),
    );
    if (angle !== shownAngle) {
      shownAngle = angle;
      // The SVG is centred on 0,0, so rotating around the origin spins the
      // needle around the dial's hub.
      needle.setAttribute("transform", `rotate(${angle})`);
    }

    const rpmFraction = Number(
      (
        (vehicleState.simulatedRpm - VEHICLE_CONFIG.idleRpm) /
        (VEHICLE_CONFIG.maxRpm - VEHICLE_CONFIG.idleRpm)
      ).toFixed(2),
    );
    if (rpmFraction !== shownRpm) {
      shownRpm = rpmFraction;
      rpmFill.style.transform = `scaleX(${Math.min(Math.max(rpmFraction, 0), 1)})`;
    }
  }

  return { update };
}

// Ticks and numbers are generated instead of hand-written in the HTML: one
// loop replaces 19 tick lines and 10 labels.
function buildTicks(group) {
  for (let value = 0; value <= DISPLAY_MAX_SPEED; value += TICK_STEP) {
    const angle =
      SWEEP_START_DEGREES + (value / DISPLAY_MAX_SPEED) * SWEEP_DEGREES;
    const isMajor = value % LABEL_STEP === 0;
    const isRedline = value >= REDLINE_FROM;

    const tick = document.createElementNS(SVG_NS, "line");
    tick.setAttribute("y1", isMajor ? -84 : -90);
    tick.setAttribute("y2", -98);
    tick.setAttribute("transform", `rotate(${angle})`);
    tick.setAttribute(
      "class",
      `hud-tick${isMajor ? " is-major" : ""}${isRedline ? " is-redline" : ""}`,
    );
    group.append(tick);

    if (!isMajor) continue;

    const radians = (angle * Math.PI) / 180;
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", (Math.sin(radians) * 70).toFixed(1));
    label.setAttribute("y", (-Math.cos(radians) * 70).toFixed(1));
    label.setAttribute(
      "class",
      `hud-label${isRedline ? " is-redline" : ""}`,
    );
    label.textContent = value;
    group.append(label);
  }
}
