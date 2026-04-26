import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Zap, Shield, Trophy, Rocket } from 'lucide-react';
import WalletConnectionTest from '../components/WalletConnectionTest';

const Home = () => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] text-white">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-28 px-4">
        
        {/* Background Blur Image */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1688377051459-aebb99b42bff')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(12px)'
            }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#030014]/90 via-[#0a0a1f]/80 to-[#1A1A2E]/90" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">

          <span className="inline-block mb-6 text-secondary border border-secondary/40 px-4 py-2 text-xs tracking-widest font-mono rounded glow-secondary">
            WEB3 E-COMMERCE ON TON
          </span>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-black mb-6 tracking-tight text-white glow-text-primary">
            THRUSTER
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            The future of decentralized commerce. Buy products & services with TON.
            <br />
            Earn rewards. Collect NFTs. Own your digital destiny.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Link to="/products">
              <Button className="bg-primary hover:bg-primary/80 px-8 py-5 text-lg uppercase font-orbitron tracking-wide shadow-lg shadow-primary/40">
                Shop Now <ArrowRight className="ml-2" />
              </Button>
            </Link>

            <Link to="/services">
              <Button variant="outline" className="border-secondary text-secondary px-8 py-5 text-lg uppercase hover:bg-secondary/10">
                Book Now
              </Button>
            </Link>

          </div>
        </div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </section>

      {/* WALLET SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <WalletConnectionTest />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4">
              WHY THRUSTER?
            </h2>
            <p className="text-white/60">
              The most advanced Web3 marketplace on TON
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* CARD */}
            <div className="bg-[#0F0F1C]/80 border border-white/10 p-6 rounded-xl hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition duration-300 backdrop-blur-md">
              <Zap className="text-primary mb-4 h-10 w-10" />
              <h3 className="text-xl font-bold mb-2">Crypto Payments</h3>
              <p className="text-white/60 text-sm">
                Pay with TON or any crypto. Fast, secure, decentralized.
              </p>
            </div>

            <div className="bg-[#0F0F1C]/80 border border-white/10 p-6 rounded-xl hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/20 transition duration-300 backdrop-blur-md">
              <Trophy className="text-secondary mb-4 h-10 w-10" />
              <h3 className="text-xl font-bold mb-2">NFT Rewards</h3>
              <p className="text-white/60 text-sm">
                Earn NFTs on every purchase. Trade or collect.
              </p>
            </div>

            <div className="bg-[#0F0F1C]/80 border border-white/10 p-6 rounded-xl hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition duration-300 backdrop-blur-md">
              <Rocket className="text-primary mb-4 h-10 w-10" />
              <h3 className="text-xl font-bold mb-2">Token System</h3>
              <p className="text-white/60 text-sm">
                Earn THRUSTER tokens for rewards & discounts.
              </p>
            </div>

            <div className="bg-[#0F0F1C]/80 border border-white/10 p-6 rounded-xl hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/20 transition duration-300 backdrop-blur-md">
              <Shield className="text-secondary mb-4 h-10 w-10" />
              <h3 className="text-xl font-bold mb-2">100% Secure</h3>
              <p className="text-white/60 text-sm">
                Blockchain verified. Full control of assets.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[#1A1A2E]">
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
            READY TO LAUNCH?
          </h2>

          <p className="text-white/70 mb-8 text-lg">
            Join thousands earning rewards on THRUSTER
          </p>

          <Link to="/register">
            <Button className="bg-primary hover:bg-primary/80 px-10 py-5 text-lg uppercase font-orbitron shadow-lg shadow-primary/40">
              Get Started <ArrowRight className="ml-2" />
            </Button>
          </Link>

        </div>
      </section>

    </div>
  );
};

export default Home;