import { useEffect, useRef } from "react";

// Falling hex "blockchain code" background. Used at the top of RewardCenter.
export default function CodeRain() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const cx = cv.getContext("2d");
    const fs = 14;
    const HX = "0123456789abcdef";
    let cols = [];
    let raf = 0;
    let last = 0;

    const size = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      cols = [];
      for (let i = 0; i < Math.ceil(cv.width / fs); i++) cols.push((Math.random() * cv.height) / fs);
    };
    const step = () => {
      cx.fillStyle = "rgba(0,0,0,.09)";
      cx.fillRect(0, 0, cv.width, cv.height);
      cx.font = fs + "px 'JetBrains Mono', monospace";
      for (let i = 0; i < cols.length; i++) {
        const y = cols[i] * fs;
        cx.fillStyle = Math.random() < 0.05 ? "#fcee0a" : "#00f0ff";
        cx.fillText(HX.charAt(Math.floor(Math.random() * 16)), i * fs, y);
        if (y > cv.height && Math.random() > 0.975) cols[i] = 0;
        else cols[i] += 1;
      }
    };
    const loop = (t) => {
      if (t - last > 45) {
        last = t;
        step();
      }
      raf = requestAnimationFrame(loop);
    };

    size();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let k = 0; k < 90; k++) step();
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
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: -1, opacity: 0.4, pointerEvents: "none" }}
    />
  );
}