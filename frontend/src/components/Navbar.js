import { Link, useNavigate } from 'react-router-dom';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { ShoppingCart, User, LogOut, LayoutDashboard, Gift, Wallet,Trophy} from 'lucide-react';
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
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10">
      <div className="w-full px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-home-link">
            <div className="text-xl sm:2xl md:text-3xl font-orbitron font-black text-primary glow-text-primary uppercase tracking-tighter">
              THRUSTER
            </div>
          </Link>

            <div className="border-l border-white/10 pl-2 sm:pl-4 flex items-center gap-2">
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

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="user-menu-trigger">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0F0F1C] border-white/10">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="nav-dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() =>
navigate('/cart')} data-testid="nav-cart">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Cart ({cartCount})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={()=>
navigate('/rewards')} data-testid="nav-rewards">
                   <Trophy className="mr-3 h-4
w-4" />
                  My Rewards
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/nfts')} data-testid="nav-nfts">
                    <Gift className="mr-2 h-4 w-4" />
                    My NFTs
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="nav-admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} data-testid="nav-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" data-testid="nav-login-link">
                <Button className="bg-primary hover:bg-primary/90 font-orbitron uppercase tracking-wider">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
    </nav>
  );
};

export default Navbar;