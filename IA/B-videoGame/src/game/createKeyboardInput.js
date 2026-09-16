const CONTROLLED_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

export function createKeyboardInput() {
  const state = {
    forward: false,
    reverse: false,
    left: false,
    right: false,
  };

  function updateKey(event, pressed) {
    if (!CONTROLLED_KEYS.has(event.code)) return;

    event.preventDefault();

    if (event.code === "ArrowUp") state.forward = pressed;
    if (event.code === "ArrowDown") state.reverse = pressed;
    if (event.code === "ArrowLeft") state.left = pressed;
    if (event.code === "ArrowRight") state.right = pressed;
  }

  function keyDown(event) {
    updateKey(event, true);
  }

  function keyUp(event) {
    updateKey(event, false);
  }

  function reset() {
    state.forward = false;
    state.reverse = false;
    state.left = false;
    state.right = false;
  }

  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);
  window.addEventListener("blur", reset);

  return {
    state,
    dispose() {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", reset);
    },
  };
}
