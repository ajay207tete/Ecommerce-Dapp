// Runs after "craco build". Writes one static HTML file per route into build/,
// each with its own title, description, canonical, JSON-LD and readable content
// inside #root. React replaces the #root content when the app loads.
const fs = require('fs');
const path = require('path');

const SITE = 'https://www.thruster.in';
const BUILD = path.join(__dirname, '..', 'build');
const BACKEND = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const clip = (s, n) => {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
};
const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const rupees = (n) => '₹' + Number(n || 0).toFixed(2);
const isUrl = (u) => typeof u === 'string' && /^https?:\/\//.test(u);
const rx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function getJson(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Remove an existing tag, e.g. <meta name="description" ...>, whatever the quoting
function dropTag(html, tag, attr, key) {
  const re = new RegExp(
    `<${tag}\\b[^>]*\\b${attr}=["']?${rx(key)}["']?(?=[\\s>/])[^>]*>`,
    'gi'
  );
  return html.replace(re, '');
}

const NAV =
  '<p><a href="/" style="color:#fcee0a">Home</a> | <a href="/products" style="color:#fcee0a">Shop clothing</a> | <a href="/services" style="color:#fcee0a">Book hotels</a></p>';

function applyRoute(base, r) {
  let html = base;
  const url = SITE + r.path;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${esc(r.title)}</title>`);
  html = dropTag(html, 'meta', 'name', 'description');
  html = dropTag(html, 'link', 'rel', 'canonical');
  ['og:title', 'og:description', 'og:url', 'og:type'].forEach((k) => {
    html = dropTag(html, 'meta', 'property', k);
  });
  ['twitter:title', 'twitter:description'].forEach((k) => {
    html = dropTag(html, 'meta', 'name', k);
  });
  if (r.image) {
    html = dropTag(html, 'meta', 'property', 'og:image');
    html = dropTag(html, 'meta', 'name', 'twitter:image');
  }

  const head = [
    `<meta name="description" content="${esc(r.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="${r.ogType || 'website'}">`,
    `<meta property="og:title" content="${esc(r.title)}">`,
    `<meta property="og:description" content="${esc(r.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta name="twitter:title" content="${esc(r.title)}">`,
    `<meta name="twitter:description" content="${esc(r.description)}">`,
    r.image ? `<meta property="og:image" content="${esc(r.image)}">` : '',
    r.image ? `<meta name="twitter:image" content="${esc(r.image)}">` : '',
    ...(r.ld || []).map(jsonLd),
  ].join('');
  html = html.replace('</head>', () => head + '</head>');

  const content = `<div id="seo-content">${r.body}${NAV}</div>`;
  const withSeo = /<div id=["']?root["']?>\s*<div id=["']?seo-content["']?>[\s\S]*?<\/div>\s*<\/div>/i;
  const empty = /<div id=["']?root["']?>\s*<\/div>/i;
  if (withSeo.test(html)) {
    html = html.replace(withSeo, () => `<div id="root">${content}</div>`);
  } else if (empty.test(html)) {
    html = html.replace(empty, () => `<div id="root">${content}</div>`);
  } else {
    console.warn('prerender: could not find #root for', r.path);
  }
  return html;
}

(async () => {
  const baseFile = path.join(BUILD, 'index.html');
  if (!fs.existsSync(baseFile)) {
    console.error('prerender: build/index.html not found. Run the build first.');
    process.exit(1);
  }
  const base = fs.readFileSync(baseFile, 'utf8');

  let products = [];
  let hotels = [];
  if (BACKEND) {
    try {
      products = await getJson(`${BACKEND}/api/products`);
    } catch (e) {
      console.warn('prerender: products skipped:', e.message);
    }
    try {
      hotels = await getJson(`${BACKEND}/api/services`);
    } catch (e) {
      console.warn('prerender: hotels skipped:', e.message);
    }
  } else {
    console.warn('prerender: REACT_APP_BACKEND_URL not set, skipping products and hotels');
  }
  if (!Array.isArray(products)) products = [];
  if (!Array.isArray(hotels)) hotels = [];

  const routes = [];

  routes.push({
    path: '/',
    title: 'THRUSTER: Crypto Clothing & Hotel Marketplace with NFT Rewards',
    description:
      'THRUSTER is a Web3 marketplace on TON where you can buy clothing and book hotels, pay with TON, USDT, BNB, Bitcoin, ETH, Solana or INR, and earn NFT rewards.',
    body:
      '<h1>THRUSTER: Shop, Book and Earn with Crypto</h1>' +
      '<p>THRUSTER is a Web3 marketplace on the TON blockchain. Buy clothing, book hotels, and pay with TON, USDT, BNB, Bitcoin, Ethereum, Solana or INR. Earn NFT rewards on purchases and hotel bookings.</p>',
  });

  routes.push({
    path: '/products',
    title: 'Buy Clothing with Crypto | THRUSTER',
    description: clip(
      `Browse ${products.length || ''} clothing and products on THRUSTER. Pay with TON, USDT, BNB, Bitcoin, ETH, Solana or INR and earn NFT rewards.`,
      158
    ),
    body:
      '<h1>Clothing and products on THRUSTER</h1>' +
      '<p>Pay with TON, USDT, BNB, Bitcoin, Ethereum, Solana or INR. Every purchase earns NFT rewards.</p>' +
      (products.length
        ? '<ul style="list-style:none;padding:0">' +
          products
            .slice(0, 200)
            .map(
              (p) =>
                `<li><a href="/products/${encodeURIComponent(p.id)}" style="color:#fcee0a">${esc(p.name)}</a> ${rupees(p.price)}</li>`
            )
            .join('') +
          '</ul>'
        : ''),
    ld: products.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: products.slice(0, 50).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE}/products/${encodeURIComponent(p.id)}`,
              name: p.name,
            })),
          },
        ]
      : [],
  });

  routes.push({
    path: '/services',
    title: 'Book Hotels with Crypto | THRUSTER',
    description: clip(
      `Search and book hotels on THRUSTER. Pay with TON, USDT, BNB, Bitcoin, ETH, Solana or INR and earn NFT rewards on every booking.`,
      158
    ),
    body:
      '<h1>Book hotels with crypto on THRUSTER</h1>' +
      '<p>Search hotels by name or location, choose your dates and pay with crypto or INR. Hotel bookings earn NFT rewards.</p>' +
      (hotels.length
        ? '<ul style="list-style:none;padding:0">' +
          hotels
            .slice(0, 200)
            .map(
              (h) =>
                `<li><a href="/hotels/${encodeURIComponent(h.id)}" style="color:#fcee0a">${esc(h.name)}</a>${h.location ? ', ' + esc(h.location) : ''}</li>`
            )
            .join('') +
          '</ul>'
        : ''),
  });

  products.forEach((p) => {
    if (!p || !p.id || !p.name) return;
    const img = Array.isArray(p.images) ? p.images.filter(isUrl) : [];
    const pagePath = `/products/${encodeURIComponent(p.id)}`;
    routes.push({
      path: pagePath,
      title: `${clip(p.name, 60)} | THRUSTER`,
      description: clip(
        `${p.description || p.name} Price ${rupees(p.price)}. Pay with crypto or INR on THRUSTER.`,
        158
      ),
      ogType: 'product',
      image: img[0],
      body:
        `<h1>${esc(p.name)}</h1>` +
        `<p>${esc(p.description)}</p>` +
        `<p>Price: ${rupees(p.price)}${p.stock > 0 ? ' (in stock)' : ' (out of stock)'}</p>` +
        (img[0] ? `<p><img src="${esc(img[0])}" alt="${esc(p.name)}" width="320"></p>` : ''),
      ld: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: p.description || p.name,
          sku: String(p.id),
          ...(img.length ? { image: img } : {}),
          ...(p.category ? { category: p.category } : {}),
          offers: {
            '@type': 'Offer',
            url: SITE + pagePath,
            priceCurrency: 'INR',
            price: Number(p.price || 0).toFixed(2),
            availability:
              p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        },
      ],
    });
  });

  hotels.forEach((h) => {
    if (!h || !h.id || !h.name) return;
    const img = Array.isArray(h.images) ? h.images.filter(isUrl) : [];
    const price = h.price_per_night != null ? h.price_per_night : h.price;
    const pagePath = `/hotels/${encodeURIComponent(h.id)}`;
    routes.push({
      path: pagePath,
      title: `${clip(h.name, 55)}: Book with Crypto | THRUSTER`,
      description: clip(
        `${h.description || h.name} From ${rupees(price)} per night. Book with crypto or INR and earn an NFT.`,
        158
      ),
      image: img[0],
      body:
        `<h1>${esc(h.name)}</h1>` +
        (h.location ? `<p>Location: ${esc(h.location)}</p>` : '') +
        `<p>${esc(h.description)}</p>` +
        `<p>From ${rupees(price)} per night</p>` +
        (img[0] ? `<p><img src="${esc(img[0])}" alt="${esc(h.name)}" width="320"></p>` : ''),
      ld: [
        {
          '@context': 'https://schema.org',
          '@type': 'Hotel',
          name: h.name,
          description: h.description || h.name,
          url: SITE + pagePath,
          ...(img.length ? { image: img } : {}),
          ...(h.location
            ? { address: { '@type': 'PostalAddress', streetAddress: h.location } }
            : {}),
          priceRange: `${rupees(price)} per night`,
        },
      ],
    });
  });

  // Write one index.html per route
  routes.forEach((r) => {
    const dir =
      r.path === '/' ? BUILD : path.join(BUILD, ...r.path.split('/').filter(Boolean));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), applyRoute(base, r));
  });

  // Sitemap with every page
  const today = new Date().toISOString().slice(0, 10);
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    routes
      .map((r) => `  <url><loc>${SITE}${r.path === '/' ? '/' : r.path}</loc><lastmod>${today}</lastmod></url>`)
      .join('\n') +
    '\n</urlset>\n';
  fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemap);

  console.log(`prerender: wrote ${routes.length} pages and sitemap.xml`);
})();