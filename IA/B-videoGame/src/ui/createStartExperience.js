export function createStartExperience() {
  const overlay = document.querySelector("#start-screen");
  const button = document.querySelector("#start-drive");
  const status = document.querySelector("#start-status");
  const driveHint = document.querySelector("#drive-hint");
  const state = { ready: false, started: false };
  let starting = false;

  function setReady(startAction) {
    state.ready = true;
    button.disabled = false;
    button.textContent = "Start Drive";
    status.textContent = "Arrow keys to drive";

    button.addEventListener("click", async () => {
      if (starting || state.started) return;
      starting = true;
      button.disabled = true;
      button.textContent = "Starting…";
      status.textContent = "Opening the night road";

      try {
        await startAction();
        state.started = true;
        starting = false;
        document.body.dataset.experience = "running";
        overlay.setAttribute("aria-hidden", "true");
        driveHint.classList.add("is-visible");
        window.setTimeout(() => driveHint.classList.remove("is-visible"), 5000);
      } catch (error) {
        starting = false;
        console.error("Could not start TurboDust audio.", error);
        button.disabled = false;
        button.textContent = "Try Again";
        status.textContent = "Audio could not start — try once more";
      }
    });
  }

  function setError(message) {
    document.body.dataset.appStatus = "error";
    button.disabled = true;
    button.textContent = "Unavailable";
    status.textContent = message;
  }

  return { setReady, setError, state };
}
