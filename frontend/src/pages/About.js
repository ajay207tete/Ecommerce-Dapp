import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Bed, Gift, ExternalLink } from 'lucide-react';
import CoinIcon from '../components/CoinIcon';

const offers = [
  {
    icon: ShoppingBag,
    color: '#fcee0a',
    title: 'Shop clothing',
    text: 'Browse products and pay with crypto or INR. Your order, your wallet, no middlemen.',
  },
  {
    icon: Bed,
    color: '#00f0ff',
    title: 'Book hotels',
    text: 'Search stays by name or location, pick your dates and pay the same way.',
  },
  {
    icon: Gift,
    color: '#ff003c',
    title: 'Earn rewards',
    text: 'Purchases and bookings can earn NFTs, and social tasks earn tokens in the Reward Center.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Create your account',
    text: 'Sign up with your email. Connect a TON wallet such as Tonkeeper or MyTonWallet if you want to pay in TON or see your NFTs.',
  },
  {
    n: '02',
    title: 'Pick what you want',
    text: 'Add clothing to your cart, or choose a hotel with your dates and guests.',
  },
  {
    n: '03',
    title: 'Pay your way',
    text: 'Choose INR (cards, UPI, netbanking) or crypto, then pick your coin and network.',
  },
  {
    n: '04',
    title: 'Collect your rewards',
    text: 'NFTs appear in your gallery. Hotel NFTs carry your booking details.',
  },
];

const coins = [
  { id: 'ton', label: 'TON' },
  { id: 'usdt', label: 'USDT' },
  { id: 'bnb', label: 'BNB' },
  { id: 'btc', label: 'Bitcoin' },
  { id: 'eth', label: 'Ethereum' },
  { id: 'sol', label: 'Solana' },
];

const community = [
  { label: 'Telegram', url: 'https://t.me/thrustercommunity' },
  { label: 'Instagram', url: 'https://www.instagram.com/thruster.co.in' },
  { label: 'YouTube', url: 'https://youtube.com/@thruster-yt' },
];

const About = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'About THRUSTER: Web3 marketplace on TON';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-16 px-1" data-testid="about-page">
      <div className="max-w-6xl mx-auto">

        {/* HERO */}
        <section className="grid gap-8 md:grid-cols-[1fr_auto] items-center mb-16">
          <div>
            <p className="font-mono text-sm text-[#00f0ff] mb-2">About us</p>
            <h1 className="text-5xl md:text-7xl font-bold uppercase mb-5">
              About <span className="text-[#fcee0a]">Thruster</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl">
              THRUSTER is a Web3 marketplace on the TON blockchain. We let people buy clothing and book hotels
              with crypto or INR, and reward them with NFTs and tokens along the way.
            </p>
          </div>
          <img src="/logo.png" alt="THRUSTER logo" className="h-28 w-28 md:h-40 md:w-40" />
        </section>

        {/* MISSION */}
        <section className="cut bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-6 sm:p-10 mb-16">
          <h2 className="text-3xl md:text-4xl mb-3">Our mission</h2>
          <p className="text-white/70 text-lg max-w-3xl">
            We are building India&apos;s blockchain-powered commerce platform: everyday shopping and travel that you
            can pay for in the money you choose, with rewards that you truly own in your wallet.
          </p>
        </section>

        {/* WHAT WE DO */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl mb-6">What <span className="text-[#fcee0a]">we do</span></h2>
          <div className="grid gap-5 md:grid-cols-3">
            {offers.map(({ icon: Icon, color, title, text }) => (
              <div
                key={title}
                className="cut bg-[#0d0d0d] border-l-[3px] p-6"
                style={{ borderLeftColor: color }}
              >
                <Icon className="h-10 w-10 mb-4" style={{ color }} />
                <h3 className="text-xl mb-2">{title}</h3>
                <p className="text-white/60 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl mb-6">How it <span className="text-[#fcee0a]">works</span></h2>
          <div className="grid gap-[2px] bg-[#262626] sm:grid-cols-2">
            {steps.map((s) => (
              <div key={s.n} className="bg-[#0d0d0d] p-6">
                <div className="text-4xl font-bold text-[#fcee0a] font-mono leading-none mb-3">{s.n}</div>
                <h3 className="text-xl mb-1">{s.title}</h3>
                <p className="text-white/60 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PAYMENTS */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl mb-3">Pay with <span className="text-[#fcee0a]">crypto or INR</span></h2>
          <p className="text-white/60 mb-6 max-w-2xl">
            INR payments run through Cashfree. For crypto you can pay with any of these, and USDT works on TON, TRON
            or BNB Chain.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {coins.map((c) => (
              <div key={c.id} className="cut bg-[#0d0d0d] border-l-4 border-white/10 p-3 flex items-center gap-3">
                <CoinIcon coin={c.id} size={32} />
                <span className="font-bold uppercase tracking-wide">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* COMMUNITY */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl mb-3">Join the <span className="text-[#fcee0a]">community</span></h2>
          <p className="text-white/60 mb-6">Follow us for updates, and earn tokens for it in the Reward Center.</p>
          <div className="flex flex-wrap gap-3">
            {community.map((c) => (
              <a
                key={c.label}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cp-btn cp-btn-outline inline-flex items-center"
              >
                {c.label}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-6 text-white/60">
            Questions? Email us at{' '}
            <a href="mailto:info@thruster.in" className="text-[#00f0ff] underline underline-offset-4 hover:text-[#fcee0a]">
              info@thruster.in
            </a>
            .
          </p>
        </section>

        {/* CTA */}
        <section className="cut border-2 border-[#fcee0a] p-8 sm:p-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5">Ready to try it?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="cp-btn inline-flex items-center justify-center">
              Shop now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/services" className="cp-btn cp-btn-outline inline-flex items-center justify-center">
              Book a hotel
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;