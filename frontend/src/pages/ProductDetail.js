import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const arrow =
  'absolute top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#fcee0a] hover:text-black text-white p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00f0ff] transition';

const qtyBtn =
  'h-10 w-10 grid place-items-center border-2 border-[#262626] text-xl text-white hover:border-[#fcee0a] disabled:opacity-40 disabled:hover:border-[#262626] disabled:cursor-not-allowed';

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
      const response = await axios.get(`${API}/products/${id}`);
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
        <div className="text-2xl font-bold uppercase tracking-[0.3em] text-[#fcee0a] animate-pulse">Loading...</div>
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
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4" data-testid="product-detail-page">
      <div className="container mx-auto max-w-6xl">
        <button
          type="button"
          className="mb-6 text-white/60 hover:text-[#fcee0a] uppercase tracking-[0.14em] text-sm font-semibold"
          onClick={() => navigate('/products')}
        >
          ← Back to Products
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="cut relative aspect-square overflow-hidden bg-[#050505] mb-4 group border-l-[3px] border-[#fcee0a]">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button onClick={prevImage} aria-label="Previous image" className={`${arrow} left-3`}>
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button onClick={nextImage} aria-label="Next image" className={`${arrow} right-3`}>
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img src="/logo.png" alt="" className="w-1/2 opacity-25" />
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
                    aria-label={`Show image ${idx + 1}`}
                    className={`aspect-square overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-[#fcee0a]' : 'border-[#262626] hover:border-white/40'
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
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {product.name}
            </h1>

            <div className="mb-6">
              <div className="text-4xl font-bold text-[#fcee0a] font-mono mb-2">
                ₹{product.price.toFixed(2)}
              </div>
              {product.stock > 0 ? (
                <div className="text-[#00f0ff] font-mono">
                  {product.stock} in stock
                </div>
              ) : (
                <div className="text-[#ff003c] font-mono">Out of stock</div>
              )}
            </div>

            <p className="text-white/70 text-lg mb-8">
              {product.description}
            </p>

            {product.category && (
              <div className="mb-6">
                <span className="px-3 py-1 bg-white/5 border-l-2 border-[#00f0ff] text-sm text-white/70 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
            )}

            <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#00f0ff] p-6 mb-6">
              <div className="mb-4">
                <label className="text-white/70 mb-2 block uppercase tracking-wider text-sm">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={qtyBtn}
                  >
                    -
                  </button>
                  <span className="text-2xl font-mono text-white w-12 text-center">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className={qtyBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 pt-4 border-t border-[#262626]">
                <span className="text-white/60 uppercase tracking-wider text-sm">Subtotal:</span>
                <span className="text-2xl font-bold text-[#fcee0a] font-mono">
                  ₹{(product.price * quantity).toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="cp-btn w-full inline-flex items-center justify-center !py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#fcee0a]"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </button>
            </div>

            <ul className="space-y-2 text-sm text-white/70">
              {[
                'Secure checkout with crypto payments',
                'Earn NFT with your purchase',
                'Fast worldwide shipping',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00f0ff]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;