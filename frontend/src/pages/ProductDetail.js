import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ShoppingCart, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api
/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      item_id: product.id,
      item_type: 'product',
      name: product.name,
      price: product.price,
      quantity: quantity
    });
    toast.success(`${product.name} added to cart!`);
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-orbitron text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white/60">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="product-detail-page">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6 text-white/60 hover:text-white"
          onClick={() => navigate('/products')}
        >
          ← Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted mb-4 group">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <ShoppingCart className="h-20 w-20 text-white/20" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-primary' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold font-orbitron text-white mb-4">
              {product.name}
            </h1>

            <div className="mb-6">
              <div className="text-4xl font-bold text-primary font-mono mb-2">
                ${product.price.toFixed(2)}
              </div>
              {product.stock > 0 ? (
                <div className="text-secondary font-mono">
                  {product.stock} in stock
                </div>
              ) : (
                <div className="text-red-400 font-mono">Out of stock</div>
              )}
            </div>

            <p className="text-white/80 font-rajdhani text-lg mb-8">
              {product.description}
            </p>

            {product.category && (
              <div className="mb-6">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-white/70 font-rajdhani">
                  {product.category}
                </span>
              </div>
            )}

            <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6 mb-6">
              <div className="mb-4">
                <label className="text-white/80 font-rajdhani mb-2 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-input border-white/10"
                  >
                    -
                  </Button>
                  <span className="text-2xl font-mono text-white w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="bg-input border-white/10"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 pt-4 border-t border-white/10">
                <span className="text-white/60 font-rajdhani">Subtotal:</span>
                <span className="text-2xl font-bold text-primary font-mono">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-primary hover:bg-primary/90 font-orbitron uppercase py-6 text-lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </Card>

            <div className="bg-secondary/10 border border-secondary/20 rounded p-4">
              <p className="text-sm text-white/70 font-rajdhani">
                ✓ Secure checkout with crypto payments<br />
                ✓ Earn NFT with your purchase<br />
                ✓ Fast worldwide shipping
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;