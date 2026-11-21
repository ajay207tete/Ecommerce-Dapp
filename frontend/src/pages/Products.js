import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Plus, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API=`${process.env.REACT_APP_BACKEND_URL}/api`;
const accents = ['#fcee0a', '#00f0ff', '#ff003c'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      item_id: product.id,
      item_type: 'product',
      name: product.name,
      price: product.price,
      quantity: 1
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold uppercase tracking-[0.3em] text-[#fcee0a] animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-3 sm:px-4" data-testid="products-page">
      <div className="container mx-auto !px-0 sm:!px-4">
        <div className="mb-8 sm:mb-12 px-1">
          <p className="font-mono text-sm text-[#00f0ff] mb-2">THRUSTER marketplace</p>
          <h1 className="text-5xl md:text-7xl font-bold uppercase mb-3 text-white">
            Prod<span className="text-[#fcee0a]">ucts</span>
          </h1>
          <p className="text-lg text-white/60">Explore our cutting-edge collection</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#262626]">
            <Package className="h-16 w-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-2xl text-white/60 mb-2">No products yet</h3>
            <p className="text-white/40">Check back soon for new items!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {products?.map((product, i) => (
              <Card
                key={product.id}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${product.id}`)}
                className="cut group relative overflow-hidden rounded-none border-0 border-l-[3px] bg-[#0d0d0d] text-white transition-colors hover:bg-[#141414] cursor-pointer flex flex-col"
                style={{ borderLeftColor: accents[i % 3] }}
                onClick={() => navigate(`/products/${product.id}`)}
                data-testid={`product-card-${product.id}`}
              >
                <div className="aspect-square overflow-hidden bg-[#050505]">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src="/logo.png" alt="" className="w-1/2 opacity-25" />
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-5 flex flex-col flex-1">
                  <h3 className="text-base sm:text-xl font-bold mb-1 text-white leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-base mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-auto">
                    <div className="text-lg sm:text-2xl font-bold text-[#fcee0a] font-mono leading-none">
                      ₹{product.price.toFixed(2)}
                    </div>
                    {product.stock > 0 ? (
                      <div className="text-[11px] sm:text-xs text-[#00f0ff] font-mono mt-1">
                        {product.stock} in stock
                      </div>
                    ) : (
                      <div className="text-[11px] sm:text-xs text-[#ff003c] font-mono mt-1">Out of stock</div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock === 0}
                      className="cp-btn w-full mt-3 !py-2 !px-2 text-xs sm:text-sm inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#fcee0a]"
                      data-testid={`add-to-cart-${product.id}`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;