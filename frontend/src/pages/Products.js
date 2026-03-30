import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API='${process.env.REACT_APP_BACKEND_URL}/api`;
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
        <div className="text-2xl font-orbitron text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="products-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold font-orbitron uppercase mb-4 text-white">
            Products
          </h1>
          <p className="text-lg text-white/60 font-rajdhani">Explore our cutting-edge collection</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-orbitron text-white/60 mb-2">No products yet</h3>
            <p className="text-white/40 font-rajdhani">Check back soon for new items!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group relative overflow-hidden bg-[#0F0F1C] border-white/5 hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
                data-testid={`product-card-${product.id}`}
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <ShoppingCart className="h-20 w-20 text-white/20" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-orbitron font-bold mb-2 text-white">
                    {product.name}
                  </h3>
                  <p className="text-white/60 font-rajdhani mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary font-mono">
                        ${product.price.toFixed(2)}
                      </div>
                      {product.stock > 0 ? (
                        <div className="text-xs text-secondary font-mono">
                          {product.stock} in stock
                        </div>
                      ) : (
                        <div className="text-xs text-red-400 font-mono">Out of stock</div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-primary hover:bg-primary/90"
                      size="sm"
                      data-testid={`add-to-cart-${product.id}`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
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