/* ═════════════════════════════════════════════════════════════
   board/BoardRenderer.js — draws the static Ludo board as SVG.
   Called once per page load; tokens live in the HTML token layer.
   ═════════════════════════════════════════════════════════════ */
import {
  GRID, CELL, MAIN_TRACK, START_OFFSETS,
  STAR_GLOBALS, HOME_ENTRY_GLOBALS, HOME_STRETCH, HOME_ARROW_ANGLE
} from "./BoardData.js";
import { COLOR_META } from "../config/constants.js";

const NS = "http://www.w3.org/2000/svg";

function node(tag, attrs = {}, text = null) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== null) n.textContent = text;
  return n;
}

const BASE_BOX = {
  red:    { x: 0,   y: 0,   cx: [200, 400], cy: [200, 400] },
  green:  { x: 900, y: 0,   cx: [1100, 1300], cy: [200, 400] },
  yellow: { x: 900, y: 900, cx: [1100, 1300], cy: [1100, 1300] },
  blue:   { x: 0,   y: 900, cx: [200, 400], cy: [1100, 1300] }
};

function cellRect(r, c, fill, stroke = "#c9b48a", sw = 3) {
  return node("rect", {
    x: c * CELL + 2, y: r * CELL + 2,
    width: CELL - 4, height: CELL - 4, rx: 14,
    fill, stroke, "stroke-width": sw
  });
}

function starText(r, c, fill, size = 46) {
  const t = node("text", {
    x: c * CELL + CELL / 2, y: r * CELL + CELL / 2,
    "text-anchor": "middle", "dominant-baseline": "central",
    "font-size": size, fill, "font-family": "serif", "pointer-events": "none"
  }, "★");
  return t;
}

export class BoardRenderer {
  /** @param {SVGSVGElement} svg */
  constructor(svg) {
    this.svg = svg;
  }

  render() {
    const svg = this.svg;
    svg.innerHTML = "";
    svg.appendChild(this.#defs());
    svg.appendChild(node("rect", { x: 0, y: 0, width: 1500, height: 1500, rx: 26, fill: "#f6efdc" }));

    this.#renderArms();
    this.#renderTrack();
    this.#renderHomeColumns();
    for (const color of Object.keys(BASE_BOX)) this.#renderBase(color);
    this.#renderCenter();

    // Gold inner frame
    svg.appendChild(node("rect", {
      x: 12, y: 12, width: 1476, height: 1476, rx: 22,
      fill: "none", stroke: "#d4a017", "stroke-width": 10, opacity: 0.85
    }));
  }

  #defs() {
    const defs = node("defs", {});
    const stops = {
      red: ["#ff8fa3", "#ef233c", "#a31226"],
      green: ["#95d5b2", "#2dc653", "#146c2e"],
      yellow: ["#ffe08a", "#ffb703", "#9c6b00"],
      blue: ["#9bb1ff", "#4361ee", "#22307e"]
    };
    for (const [color, [a, b, c]] of Object.entries(stops)) {
      const g = node("linearGradient", { id: `base-${color}`, x1: 0, y1: 0, x2: 1, y2: 1 });
      g.appendChild(node("stop", { offset: "0%", "stop-color": a }));
      g.appendChild(node("stop", { offset: "55%", "stop-color": b }));
      g.appendChild(node("stop", { offset: "100%", "stop-color": c }));
      defs.appendChild(g);
    }
    return defs;
  }

  /** Pastel backdrop under the four cross arms. */
  #renderArms() {
    const g = node("g", {});
    const arms = [
      { x: 0, y: 600, w: 600, h: 300 },   // left
      { x: 600, y: 0, w: 300, h: 600 },   // top
      { x: 900, y: 600, w: 600, h: 300 }, // right
      { x: 600, y: 900, w: 300, h: 600 }  // bottom
    ];
    for (const a of arms) g.appendChild(node("rect", { ...a, fill: "#efe3c8" }));
    this.svg.appendChild(g);
  }

  #renderTrack() {
    const g = node("g", {});
    const startGlobals = Object.fromEntries(
      Object.entries(START_OFFSETS).map(([color, idx]) => [idx, color])
    );
    MAIN_TRACK.forEach(([r, c], idx) => {
      if (startGlobals[idx]) {
        const color = startGlobals[idx];
        g.appendChild(cellRect(r, c, COLOR_META[color].hex, COLOR_META[color].hex, 3));
        g.appendChild(starText(r, c, "#ffffff"));
      } else if (STAR_GLOBALS.has(idx)) {
        g.appendChild(cellRect(r, c, "#fffdf4"));
        g.appendChild(starText(r, c, "#d4a017"));
      } else if (Object.values(HOME_ENTRY_GLOBALS).includes(idx)) {
        const color = Object.keys(HOME_ENTRY_GLOBALS).find((k) => HOME_ENTRY_GLOBALS[k] === idx);
        g.appendChild(cellRect(r, c, this.#soft(color), COLOR_META[color].hex, 4));
      } else {
        g.appendChild(cellRect(r, c, "#fffdf4"));
      }
    });
    this.svg.appendChild(g);
  }

  #renderHomeColumns() {
    const g = node("g", {});
    for (const [color, cells] of Object.entries(HOME_STRETCH)) {
      cells.forEach(([r, c], i) => {
        g.appendChild(cellRect(r, c, i === 0 ? COLOR_META[color].hex : this.#soft(color), COLOR_META[color].hex, 4));
        if (i === 0) {
          // Direction arrow into the home column
          const t = node("text", {
            x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 + 2,
            "text-anchor": "middle", "dominant-baseline": "central",
            "font-size": 52, fill: "#ffffff", "font-weight": "bold",
            "pointer-events": "none",
            transform: `rotate(${HOME_ARROW_ANGLE[color]} ${c * CELL + CELL / 2} ${r * CELL + CELL / 2})`
          }, "➤");
          g.appendChild(t);
        }
      });
    }
    this.svg.appendChild(g);
  }

  #renderBase(color) {
    const { x, y, cx, cy } = BASE_BOX[color];
    const g = node("g", {});
    g.appendChild(node("rect", { x, y, width: 600, height: 600, fill: `url(#base-${color})` }));
    g.appendChild(node("rect", { x: x + 105, y: y + 105, width: 390, height: 390, rx: 48, fill: "#fffdf6", stroke: "rgba(0,0,0,.2)", "stroke-width": 3 }));
    for (const px of cx) for (const py of cy) {
      g.appendChild(node("circle", { cx: px, cy: py, r: 80, fill: "#ffffff", stroke: COLOR_META[color].hex, "stroke-width": 10 }));
      g.appendChild(node("circle", { cx: px, cy: py, r: 62, fill: this.#soft(color) }));
    }
    // Colour ribbon label
    const label = node("text", {
      x: x + 300, y: y + 562, "text-anchor": "middle",
      "font-size": 30, "font-weight": "bold", fill: "rgba(255,255,255,.85)",
      "font-family": "Baloo 2, sans-serif", "letter-spacing": 6
    }, COLOR_META[color].label.toUpperCase());
    g.appendChild(label);
    this.svg.appendChild(g);
  }

  #renderCenter() {
    const g = node("g", {});
    const C = 750, a = 600, b = 900;
    const tris = {
      green: `${a},${a} ${b},${a} ${C},${C}`,
      yellow: `${b},${a} ${b},${b} ${C},${C}`,
      blue: `${b},${b} ${a},${b} ${C},${C}`,
      red: `${a},${b} ${a},${a} ${C},${C}`
    };
    for (const [color, points] of Object.entries(tris)) {
      g.appendChild(node("polygon", {
        points, fill: COLOR_META[color].hex,
        stroke: "#ffffff", "stroke-width": 6, "stroke-linejoin": "round"
      }));
    }
    g.appendChild(node("circle", { cx: C, cy: C, r: 46, fill: "#fffdf6", stroke: "#d4a017", "stroke-width": 6 }));
    g.appendChild(node("text", {
      x: C, y: C + 2, "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": 44, fill: "#d4a017"
    }, "★"));
    this.svg.appendChild(g);
  }

  #soft(color) {
    return { red: "#ffd9de", green: "#d3f2dc", yellow: "#ffefc2", blue: "#dbe3ff" }[color];
  }
}
