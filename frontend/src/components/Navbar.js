import { Link, useNavigate } from 'react-router-dom';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { ShoppingCart, User, LogOut, LayoutDashboard, Gift, Wallet, Trophy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 
      glass-panel border-b border-white/10 
      bg-black/40 backdrop-blur-lg">

      <div className="w-full px-3 sm:px-4">
        <div className="flex items-center justify-between h-14">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-xl sm:text-2xl md:text-3xl font-orbitron font-black text-primary glow-text-primary uppercase tracking-tighter">
              THRUSTER
            </div>
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* TON CONNECT */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-2 sm:pl-4">
              <div className="scale-75 sm:scale-90 md:scale-100 origin-right">
                <TonConnectButton />
              </div>

              {walletAddress && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-lg">
                  <Wallet className="h-4 w-4 text-secondary" />
                  <span className="text-xs font-mono text-secondary">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              )}
            </div>

            {/* USER MENU */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="bg-[#0F0F1C] border-white/10">

                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/cart')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart ({cartCount})
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/rewards')}>
                    <Trophy className="mr-2 h-4 w-4" />
                    My Rewards
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/nfts')}>
                    <Gift className="mr-2 h-4 w-4" />
                    My NFTs
                  </DropdownMenuItem>

                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className="px-3 py-1 text-xs sm:text-sm h-8 sm:h-9 
                  bg-primary hover:bg-primary/90 
                  font-orbitron uppercase tracking-wider">
                  Sign In
                </Button>
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;