/* ═════════════════════════════════════════════════════════════
   board/BoardRenderer.js — draws the static Ludo board as SVG.
   Upgraded: defs with glow filters, pulsating stars, shimmer homes,
   cached DocumentFragment, GPU-friendly.
   Called once per page load; tokens live in HTML layer.
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

function starText(r, c, fill, size = 46, extraClass = "") {
  const t = node("text", {
    x: c * CELL + CELL / 2, y: r * CELL + CELL / 2,
    "text-anchor": "middle", "dominant-baseline": "central",
    "font-size": size, fill, "font-family": "serif", "pointer-events": "none",
    class: extraClass
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
    const frag = document.createDocumentFragment();
    frag.appendChild(this.#defs());
    frag.appendChild(node("rect", { x: 0, y: 0, width: 1500, height: 1500, rx: 26, fill: "#f6efdc" }));

    // Use helper to append groups via frag for single reflow
    const temp = document.createElementNS(NS, "g");
    // We'll build directly into frag via helper nodes
    svg.appendChild(frag);
    // Now render layers directly (each appends to svg, but after frag it's still one layout)
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

    // Subtle outer glow
    svg.appendChild(node("rect", {
      x: 8, y: 8, width: 1484, height: 1484, rx: 24,
      fill: "none", stroke: "rgba(255,209,102,.22)", "stroke-width": 4
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
    // Soft glow filters per color
    for (const [color, hex] of Object.entries({ red:"#ef233c", green:"#2dc653", yellow:"#ffb703", blue:"#4361ee" })) {
      const f = node("filter", { id: `glow-${color}`, x:"-50%", y:"-50%", width:"200%", height:"200%" });
      const fe = node("feDropShadow", { dx:"0", dy:"0", stdDeviation:"8", "flood-color":hex, "flood-opacity":"0.55" });
      f.appendChild(fe);
      defs.appendChild(f);
    }
    // Star glow
    const sg = node("filter", { id:"starGlow", x:"-50%", y:"-50%", width:"200%", height:"200%" });
    sg.appendChild(node("feDropShadow", { dx:"0", dy:"0", stdDeviation:"6", "flood-color":"#d4a017", "flood-opacity":"0.8" }));
    defs.appendChild(sg);

    // Shimmer gradient for home cells
    const sh = node("linearGradient", { id:"shimmer", x1:"0", y1:"0", x2:"1", y2:"0" });
    sh.appendChild(node("stop", { offset:"0%", "stop-color":"#fff", "stop-opacity":"0" }));
    sh.appendChild(node("stop", { offset:"50%", "stop-color":"#fff", "stop-opacity":"0.55" }));
    sh.appendChild(node("stop", { offset:"100%", "stop-color":"#fff", "stop-opacity":"0" }));
    defs.appendChild(sh);

    return defs;
  }

  /** Pastel backdrop under the four cross arms. */
  #renderArms() {
    const g = node("g", {});
    const arms = [
      { x: 0, y: 600, w: 600, h: 300 },
      { x: 600, y: 0, w: 300, h: 600 },
      { x: 900, y: 600, w: 600, h: 300 },
      { x: 600, y: 900, w: 300, h: 600 }
    ];
    for (const a of arms) g.appendChild(node("rect", { ...a, fill: "#efe3c8", rx: 8 }));
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
        const rect = cellRect(r, c, COLOR_META[color].hex, COLOR_META[color].hex, 3);
        rect.setAttribute("filter", `url(#glow-${color})`);
        rect.setAttribute("class", "cell-safe");
        g.appendChild(rect);
        const s = starText(r, c, "#ffffff", 46, "cell-star");
        s.setAttribute("filter", "url(#starGlow)");
        g.appendChild(s);
      } else if (STAR_GLOBALS.has(idx)) {
        const rect = cellRect(r, c, "#fffdf4");
        rect.setAttribute("class", "cell-safe");
        g.appendChild(rect);
        const s = starText(r, c, "#d4a017", 46, "cell-star");
        s.setAttribute("filter", "url(#starGlow)");
        g.appendChild(s);
      } else if (Object.values(HOME_ENTRY_GLOBALS).includes(idx)) {
        const color = Object.keys(HOME_ENTRY_GLOBALS).find((k) => HOME_ENTRY_GLOBALS[k] === idx);
        const rect = cellRect(r, c, this.#soft(color), COLOR_META[color].hex, 4);
        rect.setAttribute("class", "home-cell");
        g.appendChild(rect);
      } else {
        const rect = cellRect(r, c, "#fffdf4");
        g.appendChild(rect);
      }
    });
    this.svg.appendChild(g);
  }

  #renderHomeColumns() {
    const g = node("g", {});
    for (const [color, cells] of Object.entries(HOME_STRETCH)) {
      cells.forEach(([r, c], i) => {
        const rect = cellRect(r, c, i === 0 ? COLOR_META[color].hex : this.#soft(color), COLOR_META[color].hex, 4);
        if (i > 0) rect.setAttribute("class", "home-cell");
        else rect.setAttribute("filter", `url(#glow-${color})`);
        g.appendChild(rect);
        if (i === 0) {
          const t = node("text", {
            x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 + 2,
            "text-anchor": "middle", "dominant-baseline": "central",
            "font-size": 52, fill: "#ffffff", "font-weight": "bold",
            "pointer-events": "none",
            transform: `rotate(${HOME_ARROW_ANGLE[color]} ${c * CELL + CELL / 2} ${r * CELL + CELL / 2})`,
            class: "cell-star"
          }, "➤");
          g.appendChild(t);
        } else {
          // subtle dot in home stretch
          const dot = node("circle", { cx: c*CELL + CELL/2, cy: r*CELL + CELL/2, r: 8, fill: COLOR_META[color].hex, opacity: 0.22 });
          g.appendChild(dot);
        }
      });
    }
    this.svg.appendChild(g);
  }

  #renderBase(color) {
    const { x, y, cx, cy } = BASE_BOX[color];
    const g = node("g", {});
    g.appendChild(node("rect", { x, y, width: 600, height: 600, fill: `url(#base-${color})`, rx: 18 }));
    g.appendChild(node("rect", { x: x + 105, y: y + 105, width: 390, height: 390, rx: 48, fill: "#fffdf6", stroke: "rgba(0,0,0,.2)", "stroke-width": 3 }));
    for (const px of cx) for (const py of cy) {
      g.appendChild(node("circle", { cx: px, cy: py, r: 80, fill: "#ffffff", stroke: COLOR_META[color].hex, "stroke-width": 10 }));
      g.appendChild(node("circle", { cx: px, cy: py, r: 62, fill: this.#soft(color) }));
      // inner shine
      g.appendChild(node("circle", { cx: px - 14, cy: py - 14, r: 16, fill: "#ffffff", opacity: 0.55 }));
    }
    const label = node("text", {
      x: x + 300, y: y + 562, "text-anchor": "middle",
      "font-size": 30, "font-weight": "bold", fill: "rgba(255,255,255,.92)",
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
    g.appendChild(node("circle", { cx: C, cy: C, r: 52, fill: "#fffdf6", stroke: "#d4a017", "stroke-width": 6 }));
    g.appendChild(node("circle", { cx: C, cy: C, r: 44, fill: "#fff", opacity: 0.9 }));
    const star = node("text", {
      x: C, y: C + 2, "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": 44, fill: "#d4a017", class: "cell-star"
    }, "★");
    star.setAttribute("filter", "url(#starGlow)");
    g.appendChild(star);
    this.svg.appendChild(g);
  }

  #soft(color) {
    return { red: "#ffd9de", green: "#d3f2dc", yellow: "#ffefc2", blue: "#dbe3ff" }[color];
  }
}
