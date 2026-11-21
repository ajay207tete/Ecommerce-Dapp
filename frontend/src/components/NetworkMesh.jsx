import { useEffect, useRef } from "react";

// Glowing 3D node network with drifting digits, drawn on a canvas.
// Used behind the NFT gallery. The page content needs to be "relative z-10".

// small seeded random generator so the mesh looks the same on every visit
function makeRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const clamp = (x) => Math.max(0, Math.min(1, x));

export default function NetworkMesh() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv.getContext("2d");
    const rnd = makeRand(7);
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let nodes = [];
    let edges = [];
    let rows = [];

    const build = () => {
      nodes = [];
      edges = [];
      rows = [];
      const small = W < 640;
      const cols = small ? 8 : 13;
      const layers = 9;
      const gx = small ? 1.35 : 1.5;
      const gz = 1.4;
      const ys = Math.max(5, Math.min(10, 4 + (H / W) * 2.5));

      for (let j = 0; j < layers; j++) {
        for (let i = 0; i < cols; i++) {
          nodes.push({
            x: (i - (cols - 1) / 2) * gx + (rnd() - 0.5) * 0.8,
            z: 1.8 + j * gz + (rnd() - 0.5) * 0.8,
            y: (rnd() - 0.5) * ys,
            ph: rnd() * 6.283,
            hub: rnd() < 0.12,
          });
        }
      }
      for (let j = 0; j < layers; j++) {
        for (let i = 0; i < cols; i++) {
          const a = j * cols + i;
          if (i < cols - 1) edges.push([a, a + 1]);
          if (j < layers - 1) edges.push([a, a + cols]);
          if (i < cols - 1 && j < layers - 1 && rnd() < 0.35) edges.push([a, a + cols + 1]);
        }
      }

      for (let k = 0; k < 9; k++) {
        const start = Math.floor(rnd() * 10);
        let str = "";
        for (let q = 0; q < 150; q++) str += "0123456789".charAt((start + q) % 10);
        const hl = [];
        for (let q = 0; q < 150; q++) if ((q * 7 + k) % 11 === 0) hl.push(q);
        rows.push({
          z: 2.2 + rnd() * 9,
          y: (rnd() - 0.5) * ys * 0.8,
          sp: 0.0006 + rnd() * 0.0008,
          s: rnd() * 8,
          str,
          hl,
        });
      }
    };

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      build();
    };

    const draw = (t) => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#00060d";
      g.fillRect(0, 0, W, H);

      const f = Math.max(W, H) * 0.9;
      const ang = Math.sin(t * 0.0002) * 0.3;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const cx = W / 2;
      const cy = H / 2;

      // project every node
      const pts = nodes.map((n) => {
        const y = n.y + Math.sin(t * 0.0007 + n.ph) * 0.35;
        const xr = n.x * ca - (n.z - 6) * sa;
        const zr = n.x * sa + (n.z - 6) * ca + 6;
        if (zr < 0.4) return null;
        const p = f / zr;
        return { sx: cx + xr * p, sy: cy + y * p, p, z: zr, hub: n.hub };
      });

      // lines
      for (let e = 0; e < edges.length; e++) {
        const a = pts[edges[e][0]];
        const b = pts[edges[e][1]];
        if (!a || !b) continue;
        const al = clamp(1 - ((a.z + b.z) / 2 - 1.5) / 14) * 0.75;
        if (al < 0.03) continue;
        g.strokeStyle = "rgba(40,160,255," + al + ")";
        g.lineWidth = Math.max(0.6, Math.min(2.2, ((a.p + b.p) / 2) * 0.012));
        g.beginPath();
        g.moveTo(a.sx, a.sy);
        g.lineTo(b.sx, b.sy);
        g.stroke();
      }

      // drifting digits
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const p = f / row.z;
        const sz = Math.max(9, 0.2 * p);
        const al = clamp(1 - (row.z - 1) / 12) * 0.55;
        const xw = -12 + ((t * row.sp + row.s) % 8);
        const sx = cx + xw * p;
        const sy = cy + row.y * p;
        g.font = sz + "px 'JetBrains Mono', monospace";
        g.textAlign = "left";
        g.fillStyle = "rgba(110,190,255," + al + ")";
        g.fillText(row.str, sx, sy);
        g.fillStyle = "rgba(255,255,255," + Math.min(1, al * 1.5) + ")";
        for (let h = 0; h < row.hl.length; h++) {
          const idx = row.hl[h];
          g.fillText(row.str.charAt(idx), sx + idx * sz * 0.6, sy);
        }
      }

      // nodes, far to near
      const order = pts.filter(Boolean).sort((a, b) => b.z - a.z);
      for (let k = 0; k < order.length; k++) {
        const n = order[k];
        const al = clamp(1 - (n.z - 1.5) / 14);
        if (al < 0.04) continue;
        const r = Math.max(1.6, Math.min(16, n.p * 0.045 * (n.hub ? 1.9 : 1)));
        const gr = g.createRadialGradient(n.sx, n.sy, 0, n.sx, n.sy, r * 3.2);
        gr.addColorStop(0, "rgba(190,235,255," + al + ")");
        gr.addColorStop(0.25, "rgba(60,170,255," + 0.55 * al + ")");
        gr.addColorStop(1, "rgba(30,120,255,0)");
        g.fillStyle = gr;
        g.beginPath();
        g.arc(n.sx, n.sy, r * 3.2, 0, 6.283);
        g.fill();
        g.fillStyle = "rgba(230,247,255," + al + ")";
        g.beginPath();
        g.arc(n.sx, n.sy, r * 0.55, 0, 6.283);
        g.fill();
      }
    };

    const loop = (now) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    size();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}