import { Link, useNavigate } from 'react-router-dom';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { ShoppingCart, User, LogOut, LayoutDashboard, Gift, Wallet, Trophy, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const menuContent =
  'bg-[#0d0d0d] border border-[#262626] border-l-[3px] border-l-[#fcee0a] rounded-none';
const itemClass =
  'rounded-none cursor-pointer uppercase tracking-wider focus:bg-[#fcee0a] focus:text-black';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/95 border-b-2 border-[#fcee0a]">
      <div className="w-full px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 gap-2">

          {/* LOGO ONLY */}
          <Link to="/" className="shrink-0" aria-label="THRUSTER home">
            <img src="/logo.png" alt="THRUSTER" className="h-9 w-9" />
          </Link>

          {/* RIGHT SIDE: wallet, cart, sign in / account */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">

            {/* TON CONNECT WALLET BUTTON */}
            <div className="scale-75 sm:scale-90 md:scale-100 origin-right">
              <TonConnectButton />
            </div>

            {walletAddress && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#00f0ff]/10 border-l-2 border-[#00f0ff]">
                <Wallet className="h-4 w-4 text-[#00f0ff]" />
                <span className="text-xs font-mono text-[#00f0ff]">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}

            {/* CART */}
            <Link to="/cart" className="relative p-2 text-white/80 hover:text-[#fcee0a]" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center bg-[#fcee0a] text-black text-[11px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* SIGN IN, or ACCOUNT MENU when signed in */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className={menuContent}>
                  <DropdownMenuItem className={itemClass} onClick={() => navigate('/dashboard')}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>

                  <DropdownMenuItem className={itemClass} onClick={() => navigate('/rewards')}>
                    <Trophy className="mr-2 h-4 w-4" />
                    My Rewards
                  </DropdownMenuItem>

                  <DropdownMenuItem className={itemClass} onClick={() => navigate('/nfts')}>
                    <Gift className="mr-2 h-4 w-4" />
                    My NFTs
                  </DropdownMenuItem>

                  {user.role === 'admin' && (
                    <DropdownMenuItem className={itemClass} onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}

                  {walletAddress && (
                    <DropdownMenuItem className={itemClass} onClick={() => tonConnectUI.disconnect()}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Disconnect wallet
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem className={itemClass} onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="cp-btn !py-2 !px-4 text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;