import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Trophy, Rocket } from 'lucide-react';
import WalletConnectionTest from '../components/WalletConnectionTest';
import HomeFaq from '../components/HomeFaq';

const mask = {
  WebkitMaskImage: 'url(/logo.png)',
  maskImage: 'url(/logo.png)',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
};

const css = `
@keyframes th-gl{0%,100%{transform:translate(0)}20%{transform:translate(-14px,3px)}40%{transform:translate(10px,-4px)}60%{transform:translate(-6px,6px)}80%{transform:translate(4px,0)}}
.th-glitch-a{animation:th-gl 1.1s steps(2) 1 both}
.th-glitch-b{animation:th-gl 1.1s steps(2) 1 .08s both}
@media (prefers-reduced-motion: reduce){.th-glitch-a,.th-glitch-b{animation:none}}
`;

const features = [
  {
    icon: Zap,
    color: '#fcee0a',
    title: 'Crypto Payments',
    text: 'Pay with TON, USDT, BNB, Bitcoin, ETH or Solana. Fast, secure, decentralized.',
  },
  {
    icon: Trophy,
    color: '#00f0ff',
    title: 'NFT Rewards',
    text: 'Earn NFTs on every purchase. Trade or collect.',
  },
  {
    icon: Rocket,
    color: '#ff003c',
    title: 'Token System',
    text: 'Earn THRUSTER tokens for rewards & discounts.',
  },
  {
    icon: Shield,
    color: '#ffffff',
    title: '100% Secure',
    text: 'Blockchain verified. Full control of assets.',
  },
];

const Home = () => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <div className="min-h-screen text-white">
      <style>{css}</style>

      {/* HERO */}
      <section className="relative py-24 sm:py-28 px-1">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] items-center max-w-6xl mx-auto">

          <div>
            <span className="inline-block mb-5 text-[#00f0ff] border-l-2 border-[#00f0ff] pl-3 text-xs tracking-widest font-mono">
              WEB3 E-COMMERCE ON TON
            </span>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-[.92] mb-6">
              <span className="block">Shop.</span>
              <span className="block text-[#fcee0a]">Book.</span>
              <span className="block">Earn.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-xl mb-9">
              The future of decentralized commerce. Buy products & services with crypto.
              <br />
              Earn rewards. Collect NFTs. Own your digital destiny.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="cp-btn inline-flex items-center justify-center">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/services" className="cp-btn cp-btn-outline inline-flex items-center justify-center">
                Book Now
              </Link>
            </div>
          </div>

          {/* LOGO with one-time glitch */}
          <div
            className="relative aspect-square w-full max-w-[360px] mx-auto lg:ml-auto"
            role="img"
            aria-label="THRUSTER ram logo"
          >
            <i className="absolute inset-0 th-glitch-b" style={{ ...mask, background: '#ff003c' }} />
            <i className="absolute inset-0 th-glitch-a" style={{ ...mask, background: '#00f0ff' }} />
            <i className="absolute inset-0" style={{ ...mask, background: '#ffffff' }} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#fcee0a]" />
      </section>

      {/* WALLET SECTION */}
      <section className="py-14 px-1">
        <div className="max-w-4xl mx-auto">
          <WalletConnectionTest />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-1">
        <div className="max-w-7xl mx-auto">

          <div className="mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-3">Why <span className="text-[#fcee0a]">Thruster?</span></h2>
            <p className="text-white/60">The most advanced Web3 marketplace on TON</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, color, title, text }) => (
              <div
                key={title}
                className="cut bg-[#0d0d0d] border-l-[3px] p-6 transition-colors hover:bg-[#141414]"
                style={{ borderLeftColor: color }}
              >
                <Icon className="mb-4 h-10 w-10" style={{ color }} />
                <h3 className="text-xl mb-2">{title}</h3>
                <p className="text-white/60 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <HomeFaq />

      {/* CTA */}
      <section className="py-20 px-1">
        <div className="max-w-4xl mx-auto cut border-2 border-[#fcee0a] p-8 sm:p-12 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-5">Ready to launch?</h2>
          <p className="text-white/70 mb-8 text-lg">Join thousands earning rewards on THRUSTER</p>
          <Link to="/register" className="cp-btn inline-flex items-center justify-center">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;