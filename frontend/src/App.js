import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import HotelDetail from './pages/HotelDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import RewardCenter from './pages/RewardCenter';
import NFTGallery from './pages/NFTGallery';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// Use environment variable or deployed URL for manifest
const manifestUrl = process.env.REACT_APP_TON_MANIFEST_URL || 'https://ecommerce-dapp-i9u9.vercel.app/tonconnect-manifest.json';

function App() {
  return (
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      walletsListConfiguration={{
        includeWallets: [
          {
            appName: "tonkeeper",
            name: "Tonkeeper",
            imageUrl: "https://tonkeeper.com/assets/tonconnect-icon.png",
            aboutUrl: "https://tonkeeper.com",
            universalLink: "https://app.tonkeeper.com/ton-connect",
            bridgeUrl: "https://bridge.tonapi.io/bridge",
            platforms: ["ios", "android", "chrome", "firefox"]
          },
          {
            appName: "mytonwallet",
            name: "MyTonWallet",
            imageUrl: "https://static.mytonwallet.io/icon-256.png",
            aboutUrl: "https://mytonwallet.io",
            universalLink: "https://connect.mytonwallet.org",
            platforms: ["chrome", "firefox", "safari"]
          }
        ]
      }}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/ThrusterBot'
      }}
    >
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="w-full overflow-x-hidden bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/hotels/:id" element={<HotelDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/rewards" element={<RewardCenter />} />
                <Route path="/nfts" element={<NFTGallery />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
              <Toaster position="top-right" />
            </div>
           </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TonConnectUIProvider>
  );
}

export default App;