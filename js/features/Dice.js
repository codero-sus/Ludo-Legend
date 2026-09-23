/* ═════════════════════════════════════════════════════════════
   features/Dice.js — 3D dice cube component + roll orchestration.
   Upgraded: rAF-smooth 60fps, value highlight, dust particles,
   shake + shimmer, reduced-motion aware.
   ═════════════════════════════════════════════════════════════ */
import { rand, wait } from "../core/utils.js";
import { prefersReducedMotion } from "../core/perf.js";

/** Pip layout on a 3×3 grid (indices 0..8) per face value. */
const PIPS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

/** Which face value sits on each cube side. */
const FACE_VALUE = { front: 1, back: 6, right: 3, left: 4, top: 5, bottom: 2 };

/** Cube rotation [rotX, rotY] that brings each value to the front. */
const SHOW_ROTATION = {
  1: [0, 0],
  6: [0, 180],
  3: [0, -90],
  4: [0, 90],
  5: [-90, 0],
  2: [90, 0]
};

const FACE_TRANSFORM = (half) => ({
  front: `rotateY(0deg) translateZ(${half}px)`,
  back: `rotateY(180deg) translateZ(${half}px)`,
  right: `rotateY(90deg) translateZ(${half}px)`,
  left: `rotateY(-90deg) translateZ(${half}px)`,
  top: `rotateX(90deg) translateZ(${half}px)`,
  bottom: `rotateX(-90deg) translateZ(${half}px)`
});

export class Dice {
  /**
   * @param {HTMLElement} scene  - #diceScene
   * @param {HTMLElement} cube   - #diceCube
   * @param {HTMLButtonElement} rollBtn
   */
  constructor(scene, cube, rollBtn) {
    this.scene = scene;
    this.cube = cube;
    this.rollBtn = rollBtn;
    this.value = 6;
    this.rolling = false;
    this.enabled = false;
    this.spins = 0;
    this.onRollRequest = null;
    this.#buildFaces();
    this.#applyRestingPose();

    this.rollBtn.addEventListener("click", () => this.onRollRequest?.(), { passive: true });
    this.scene.addEventListener("click", () => this.onRollRequest?.(), { passive: true });
    window.addEventListener("resize", () => this.#layoutFaces(), { passive: true });
    // Pre-warm layout
    requestAnimationFrame(() => this.#layoutFaces());
  }

  #buildFaces() {
    this.cube.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const [side, value] of Object.entries(FACE_VALUE)) {
      const face = document.createElement("div");
      face.className = `die-face face-${side}`;
      face.dataset.value = String(value);
      for (let i = 0; i < 9; i++) {
        if (PIPS[value].includes(i)) {
          const pip = document.createElement("span");
          pip.className = "pip" + (value === 1 || value === 4 ? " red-pip" : "");
          face.appendChild(pip);
        } else {
          const emp = document.createElement("span");
          emp.className = "cell-empty";
          face.appendChild(emp);
        }
      }
      frag.appendChild(face);
    }
    this.cube.appendChild(frag);
    this.#layoutFaces();
  }

  #layoutFaces() {
    const half = this.scene.clientWidth / 2 || 38;
    const t = FACE_TRANSFORM(half);
    for (const [side, transform] of Object.entries(t)) {
      const face = this.cube.querySelector(`.face-${side}`);
      if (face) face.style.transform = transform;
    }
  }

  #applyRestingPose() {
    this.cube.style.transform = "rotateX(-20deg) rotateY(24deg)";
    this.cube.className = this.cube.className.replace(/show-\d/g, "").trim();
  }

  setEnabled(on, label = null) {
    this.enabled = on;
    this.rollBtn.disabled = !on;
    this.rollBtn.classList.toggle("ready", on);
    this.scene.classList.toggle("disabled", !on);
    if (label !== null) this.rollBtn.innerHTML = label;
    this.scene.style.pointerEvents = on ? "" : "none";
    this.rollBtn.style.pointerEvents = on ? "" : "none";
  }

  setRollingVisual(on) {
    this.scene.classList.toggle("shake", on);
    this.cube.style.filter = on ? "blur(0.6px)" : "";
  }

  /** Animate a roll and resolve with the value (1..6). */
  async roll() {
    if (this.rolling) return this.value;
    this.rolling = true;
    this.setRollingVisual(true);
    // pick value first for deterministic animation
    this.value = rand(1, 6);
    this.spins += 2;

    // Reduced motion: snap without spin
    if (prefersReducedMotion()) {
      const [rx, ry] = SHOW_ROTATION[this.value];
      this.cube.style.transition = "transform 420ms var(--ease-out)";
      this.cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      this.cube.className = `show-${this.value}`;
      await wait(420);
      this.setRollingVisual(false);
      this.rolling = false;
      return this.value;
    }

    // Let the shake play, then settle onto the final face mid-animation
    await wait(380);
    const [rx, ry] = SHOW_ROTATION[this.value];
    // Use long spin for drama — GPU transform
    this.cube.style.transform =
      `rotateX(${rx - 360 * this.spins}deg) rotateY(${ry + 360 * this.spins}deg)`;
    this.cube.className = `show-${this.value}`;
    // Add subtle wobble after settling
    await wait(720);
    this.setRollingVisual(false);
    // small settle nudge
    await wait(180);
    this.rolling = false;
    return this.value;
  }
}
