import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, X, Send } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
// Optional: a backend endpoint that takes { message } and returns { reply }
const AI_URL = process.env.REACT_APP_ASSISTANT_URL;

const CHIPS = [
  'Pay with crypto',
  'NFT benefits',
  'Find clothing',
  'Book a hotel',
  'My orders',
  'Rewards',
];

const STOP = new Set([
  'the', 'for', 'and', 'with', 'want', 'need', 'looking', 'find', 'show', 'get', 'buy',
  'please', 'can', 'you', 'any', 'some', 'have', 'what', 'how', 'best', 'cheap', 'near',
  'clothing', 'clothes', 'product', 'products', 'hotel', 'hotels', 'room', 'rooms',
]);

const words = (t) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

const rupees = (n) => '₹' + Number(n || 0).toFixed(2);

function search(list, tokens, fields) {
  if (!tokens.length) return [];
  return list
    .map((item) => {
      const hay = fields.map((f) => String(item[f] || '')).join(' ').toLowerCase();
      return { item, score: tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.item);
}

const productItems = (list) =>
  list.map((p) => ({
    to: `/products/${p.id}`,
    title: p.name,
    sub: p.stock > 0 ? 'In stock' : 'Out of stock',
    price: rupees(p.price),
  }));

const hotelItems = (list) =>
  list.map((h) => ({
    to: `/hotels/${h.id}`,
    title: h.name,
    sub: h.location || 'Hotel',
    price: `${rupees(h.price_per_night != null ? h.price_per_night : h.price)} / night`,
  }));

// Rule-based answers built from your own site content
function answer(text, data) {
  const t = text.toLowerCase();
  const tokens = words(text);

  if (/\b(hi|hello|hey|namaste)\b/.test(t) && t.length < 25) {
    return { text: 'Hi! I can help with products, hotels, payments, NFTs and rewards. What are you looking for?', chips: CHIPS };
  }

  if (/crypto|pay|payment|usdt|tether|\bton\b|bnb|bitcoin|btc|ethereum|\beth\b|solana|\bsol\b|inr|upi|cashfree|card/.test(t)) {
    return {
      text:
        'You can pay with INR (cards, UPI or netbanking) or with crypto: TON, USDT (on TON, TRON or BNB Chain), BNB, Bitcoin, Ethereum and Solana. At checkout choose INR or Crypto, then pick your coin.',
      links: [{ to: '/products', label: 'Start shopping' }],
    };
  }

  if (/nft/.test(t)) {
    return {
      text:
        'Purchases and hotel bookings earn NFT rewards. They appear in My NFTs, and hotel NFTs include your booking details. Connect a TON wallet to view them.',
      links: [{ to: '/nfts', label: 'Open My NFTs' }],
    };
  }

  if (/reward|token|earn|task|telegram|instagram|youtube/.test(t)) {
    return {
      text:
        'You earn rewards on your orders and by completing social tasks (Telegram, Instagram and YouTube) in the Reward Center.',
      links: [{ to: '/rewards', label: 'Open Rewards' }],
    };
  }

  if (/wallet|connect|tonkeeper|mytonwallet/.test(t)) {
    return {
      text:
        'Use the wallet button at the top of the page to connect Tonkeeper or MyTonWallet. A wallet is needed for TON payments and to view your NFTs. INR payments do not need one.',
    };
  }

  if (/order|track|status|booking history/.test(t)) {
    return {
      text: 'Open My Orders to see your orders and their status. You need to be signed in.',
      links: [{ to: '/dashboard', label: 'Open My Orders' }],
    };
  }

  if (/hotel|stay|room|book|resort|night/.test(t)) {
    const found = search(data.hotels, tokens, ['name', 'location', 'description']);
    const list = found.length ? found : data.hotels.slice(0, 3);
    return {
      text: list.length
        ? `${found.length ? 'These hotels match' : 'Here are some hotels'}. Pick dates and guests on the hotel page and pay with crypto or INR.`
        : 'Search hotels by name or location, pick your dates and guests, and pay with crypto or INR.',
      items: hotelItems(list),
      links: [{ to: '/services', label: 'See all hotels' }],
    };
  }

  if (/cloth|shirt|hoodie|jacket|wear|shop|product|buy|jeans|shoe|cap|tee/.test(t)) {
    const found = search(data.products, tokens, ['name', 'description', 'category']);
    const list = found.length ? found : data.products.slice(0, 3);
    return {
      text: list.length
        ? `${found.length ? 'These products match' : 'Here are some products'}. You can pay with crypto or INR at checkout.`
        : 'Browse the shop to see all products. You can pay with crypto or INR at checkout.',
      items: productItems(list),
      links: [{ to: '/products', label: 'See all products' }],
    };
  }

  // anything else: try both catalogs
  const p = search(data.products, tokens, ['name', 'description', 'category']);
  const h = search(data.hotels, tokens, ['name', 'location', 'description']);
  if (p.length || h.length) {
    return {
      text: 'Here is what I found:',
      items: [...productItems(p), ...hotelItems(h)].slice(0, 4),
    };
  }

  return {
    text: 'I can help with products, hotels, payments, NFTs and rewards. Try one of these:',
    chips: CHIPS,
  };
}

const Assistant = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [data, setData] = useState({ products: [], hotels: [], loaded: false });
  const endRef = useRef(null);

  // Load products and hotels the first time the panel opens
  useEffect(() => {
    if (!open || data.loaded) return;
    const load = async () => {
      const [p, h] = await Promise.allSettled([
        axios.get(`${API}/products`),
        axios.get(`${API}/services`),
      ]);
      setData({
        products: p.status === 'fulfilled' && Array.isArray(p.value.data) ? p.value.data : [],
        hotels: h.status === 'fulfilled' && Array.isArray(h.value.data) ? h.value.data : [],
        loaded: true,
      });
    };
    load();
    if (msgs.length === 0) {
      setMsgs([
        {
          from: 'bot',
          text: 'Hi! I am the THRUSTER assistant. Ask me about clothing, hotels, crypto payments, NFTs or rewards.',
          chips: CHIPS,
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ block: 'end' });
  }, [msgs, open]);

  const ask = async (raw) => {
    const text = raw.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: 'user', text }]);
    setInput('');

    let reply = null;
    if (AI_URL) {
      try {
        const res = await axios.post(AI_URL, { message: text });
        if (res.data && res.data.reply) reply = { text: res.data.reply };
      } catch (e) {
        reply = null;
      }
    }
    if (!reply) reply = answer(text, data);

    setTimeout(() => setMsgs((m) => [...m, { from: 'bot', ...reply }]), 250);
  };

  // Hide on checkout and payment pages so it never covers the Pay button
  if (pathname.startsWith('/checkout') || pathname.startsWith('/payment-success')) {
    return null;
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="THRUSTER assistant"
          className="cut fixed bottom-20 right-3 sm:right-5 z-[60] w-[calc(100vw-1.5rem)] max-w-sm h-[70vh] max-h-[34rem] flex flex-col bg-black border-2 border-[#262626] border-l-[3px] border-l-[#fcee0a]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#fcee0a]">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-6 w-6" />
              <span className="font-bold uppercase tracking-[0.14em] text-sm text-white">Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="p-1 text-white/70 hover:text-[#fcee0a]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'user' ? 'flex justify-end' : ''}>
                <div
                  className={
                    m.from === 'user'
                      ? 'max-w-[85%] bg-[#fcee0a] text-black px-3 py-2 font-semibold'
                      : 'max-w-[92%] bg-[#0d0d0d] border-l-2 border-[#00f0ff] px-3 py-2 text-white/90'
                  }
                >
                  <p className="text-sm whitespace-pre-line">{m.text}</p>

                  {m.items && m.items.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.items.map((it) => (
                        <Link
                          key={it.to}
                          to={it.to}
                          onClick={() => setOpen(false)}
                          className="block bg-black border-l-[3px] border-[#fcee0a] p-2 hover:bg-[#141414]"
                        >
                          <div className="text-sm font-bold text-white leading-tight">{it.title}</div>
                          <div className="flex justify-between gap-2 text-xs font-mono">
                            <span className="text-white/50">{it.sub}</span>
                            <span className="text-[#fcee0a]">{it.price}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {m.links && m.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.links.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={() => setOpen(false)}
                          className="text-xs font-bold uppercase tracking-wider text-[#00f0ff] underline underline-offset-4 hover:text-[#fcee0a]"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {m.chips && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.chips.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => ask(c)}
                          className="text-xs px-2 py-1 border border-[#fcee0a] text-[#fcee0a] hover:bg-[#fcee0a] hover:text-black"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2 p-3 border-t border-[#262626]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Ask a question"
              placeholder="Ask about clothing, hotels, crypto..."
              className="flex-1 min-w-0 h-11 bg-black border-2 border-[#262626] px-3 text-white placeholder:text-white/30 outline-none focus:border-[#fcee0a]"
            />
            <button
              type="submit"
              aria-label="Send"
              className="cp-btn !p-0 h-11 w-11"
              style={{ display: 'grid', placeItems: 'center' }}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        aria-expanded={open}
        className="cp-btn !p-0 h-14 w-14 fixed bottom-4 right-3 sm:right-5 z-[60]"
        style={{ display: 'grid', placeItems: 'center' }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </>
  );
};

export default Assistant;