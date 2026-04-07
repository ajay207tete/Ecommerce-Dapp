import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, total } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" data-testid="cart-page">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-white/20" />
          <h2 className="text-3xl font-orbitron text-white mb-4">Your cart is empty</h2>
          <p className="text-white/60 font-rajdhani mb-6">Start shopping to add items to your cart</p>
          <Link to="/products" data-testid="cart-empty-shop-btn">
            <Button className="bg-primary hover:bg-primary/90 font-orbitron uppercase">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="cart-page">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold font-orbitron uppercase mb-8 text-white">Shopping Cart</h1>

        <div className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <Card
              key={item.item_id}
              className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6"
              data-testid={`cart-item-${item.item_id}`}
            >
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-orbitron text-white mb-1">{item.name}</h3>
                  <p className="text-sm text-white/60 font-mono">{item.item_type}</p>
                  <p className="text-xl text-primary font-mono mt-2">₹{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                    data-testid={`decrease-quantity-${item.item_id}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-mono text-white w-8 text-center" data-testid={`quantity-${item.item_id}`}>
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                    data-testid={`increase-quantity-${item.item_id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-right min-w-[100px]">
                  <p className="text-xl font-bold text-white font-mono">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.item_id)}
                  className="text-red-400 hover:text-red-300"
                  data-testid={`remove-item-${item.item_id}`}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-orbitron text-white">Total</span>
            <span className="text-3xl font-bold text-primary font-mono" data-testid="cart-total">
              ₹{total.toFixed(2)}
            </span>
          </div>
          
          <Link to="/checkout" data-testid="cart-checkout-btn">
            <Button className="w-full bg-primary hover:bg-primary/90 font-orbitron uppercase tracking-wider py-6 text-lg clip-corner glow-primary">
              Proceed to Checkout
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Cart;