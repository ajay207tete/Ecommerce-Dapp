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
    <div className="min-h-screen" data-testid="home-page">
      <section className="relative overflow-hidden py-32 px-4" style={{
        background: 'linear-gradient(135deg, #030014 0%, #1A1A2E 100%)'
      }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1688377051459-aebb99b42bff?crop=entropy&cs=srgb&fm=jpg&q=85')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)'
          }} />
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-4 relative z-10 animate-fade-in">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-block mb-6">
              <span className="text-secondary font-mono text-sm tracking-widest uppercase px-4 py-2 border border-secondary/50 rounded-sm glow-secondary">
                Web3 E-Commerce on TON
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black font-orbitron uppercase tracking-tighter mb-6 glow-text-primary animate-glitch" data-testid="hero-title">
              THRUSTER
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 font-rajdhani mb-8 leading-relaxed">
              The future of decentralized commerce. Buy products & services with TON.
              <br />
              Earn rewards. Collect exclusive NFTs. Own your digital destiny.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" data-testid="hero-shop-now-btn">
                <Button className="bg-primary hover:bg-primary/90 text-white font-orbitron uppercase tracking-wider px-8 py-6 text-lg clip-corner glow-primary">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/rewards" data-testid="hero-earn-rewards-btn">
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 font-mono uppercase tracking-widest px-8 py-6 text-lg">
                  Earn Rewards
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </section>

      <section className="py-24 px-4">
        <div className="w-full max-w-4xl mx-auto px-4 mb-12">
          <WalletConnectionTest />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold font-orbitron uppercase mb-4 text-white">
              Why THRUSTER?
            </h2>
            <p className="text-lg text-white/60 font-rajdhani">The most advanced Web3 marketplace on TON</p>
          </div>
          
          <div className="grid grid-col-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0F0F1C]/80 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300 p-8 rounded-lg group" data-testid="feature-crypto-payments">
              <div className="mb-4 text-primary">
                <Zap className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold font-orbitron mb-3 text-white">Crypto Payments</h3>
              <p className="text-white/60 font-rajdhani">Pay with TON or any cryptocurrency. Fast, secure, and decentralized.</p>
            </div>
            
            <div className="bg-[#0F0F1C]/80 backdrop-blur-md border border-white/10 hover:border-secondary/50 transition-all duration-300 p-8 rounded-lg group" data-testid="feature-nft-rewards">
              <div className="mb-4 text-secondary">
                <Trophy className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold font-orbitron mb-3 text-white">NFT Rewards</h3>
              <p className="text-white/60 font-rajdhani">Earn exclusive NFTs with every purchase. Trade, collect, or show off.</p>
            </div>
            
            <div className="bg-[#0F0F1C]/80 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300 p-8 rounded-lg group" data-testid="feature-token-system">
              <div className="mb-4 text-primary">
                <Rocket className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold font-orbitron mb-3 text-white">Token System</h3>
              <p className="text-white/60 font-rajdhani">Get rewarded with THRUSTER tokens. Use them for discounts or trade.</p>
            </div>
            
            <div className="bg-[#0F0F1C]/80 backdrop-blur-md border border-white/10 hover:border-secondary/50 transition-all duration-300 p-8 rounded-lg group" data-testid="feature-secure">
              <div className="mb-4 text-secondary">
                <Shield className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold font-orbitron mb-3 text-white">100% Secure</h3>
              <p className="text-white/60 font-rajdhani">Blockchain-verified transactions. Your assets, your control.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[#1A1A2E]">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-orbitron uppercase mb-6 text-white">
            Ready to Launch?
          </h2>
          <p className="text-xl text-white/70 font-rajdhani mb-8">
            Join thousands of users already earning rewards on THRUSTER
          </p>
          <Link to="/register" data-testid="cta-get-started-btn">
            <Button className="bg-primary hover:bg-primary/90 text-white font-orbitron uppercase tracking-wider px-12 py-6 text-lg clip-corner glow-primary">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;