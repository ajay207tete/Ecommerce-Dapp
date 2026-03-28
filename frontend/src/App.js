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

const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

function App() {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="App min-h-screen bg-background scanline-bg noise-texture">
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
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TonConnectUIProvider>
  );
}

export default App;