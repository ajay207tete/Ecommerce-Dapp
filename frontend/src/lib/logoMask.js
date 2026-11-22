// Turns /logo.png into a clean shape mask (white on transparent).
// Works whether the file is transparent or white-on-black.
let cache = null;

export function getLogoMask() {
  if (cache) return cache;
  cache = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const s = 512;
        const c = document.createElement('canvas');
        c.width = s;
        c.height = s;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0, s, s);
        const im = g.getImageData(0, 0, s, s);
        const d = im.data;
        for (let i = 0; i < d.length; i += 4) {
          const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          const v = (lum * d[i + 3]) / 255;
          d[i] = 255;
          d[i + 1] = 255;
          d[i + 2] = 255;
          d[i + 3] = v < 90 ? 0 : v;
        }
        g.putImageData(im, 0, 0);
        resolve(c.toDataURL('image/png'));
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = '/logo.png';
  });
  return cache;
}