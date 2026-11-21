import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const qtyBtn =
  'h-9 w-9 grid place-items-center border-2 border-[#262626] text-white hover:border-[#fcee0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00f0ff]';

const accents = ['#fcee0a', '#00f0ff', '#ff003c'];

const Cart = () => {

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    total
  } = useCart();

  // EMPTY CART
  if (cartItems.length === 0) {
    return (
      <div
        className="min-h-screen pt-24 md:pt-32 pb-12 px-4"
        data-testid="cart-page"
      >
        <div className="text-center max-w-md mx-auto border-2 border-dashed border-[#262626] py-16 px-6">

          <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-white/20" />

          <h2 className="text-3xl text-white mb-3">
            Your cart is empty
          </h2>

          <p className="text-white/60 mb-8">
            Start shopping to add items to your cart
          </p>

          <Link
            to="/products"
            className="cp-btn"
            data-testid="cart-empty-shop-btn"
          >
            Browse Products
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 md:pt-32 pb-12 px-4"
      data-testid="cart-page"
    >

      <div className="container mx-auto max-w-4xl">

        <p className="font-mono text-sm text-[#00f0ff] mb-2">
          {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold uppercase mb-8 text-white">
          Shopping <span className="text-[#fcee0a]">Cart</span>
        </h1>

        {/* CART ITEMS */}
        <div className="space-y-4 mb-8">

          {cartItems.map((item, i) => (

            <div
              key={item.item_id}
              className="cut bg-[#0d0d0d] border-l-[3px] p-5 sm:p-6"
              style={{ borderLeftColor: accents[i % 3] }}
              data-testid={`cart-item-${item.item_id}`}
            >

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

                {/* PRODUCT INFO */}
                <div className="flex-1 min-w-0">

                  <h3 className="text-xl text-white mb-1 break-words">
                    {item.name}
                  </h3>

                  <p className="text-sm text-white/50 font-mono">
                    {item.item_type}
                  </p>

                  <p className="text-xl text-[#fcee0a] font-mono mt-2">
                    ₹{item.price.toFixed(2)}
                  </p>

                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">

                  {/* QUANTITY */}
                  <div className="flex items-center gap-3">

                    {/* DECREASE */}
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className={qtyBtn}
                      onClick={() => {

                        // PREVENT NEGATIVE QUANTITY
                        if (item.quantity > 1) {
                          updateQuantity(
                            item.item_id,
                            item.quantity - 1
                          );
                        }
                      }}
                      data-testid={`decrease-quantity-${item.item_id}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    {/* QUANTITY NUMBER */}
                    <span
                      className="text-lg font-mono text-white w-8 text-center"
                      data-testid={`quantity-${item.item_id}`}
                    >
                      {item.quantity}
                    </span>

                    {/* INCREASE */}
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className={qtyBtn}
                      onClick={() =>
                        updateQuantity(
                          item.item_id,
                          item.quantity + 1
                        )
                      }
                      data-testid={`increase-quantity-${item.item_id}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                  </div>

                  {/* ITEM TOTAL */}
                  <div className="text-right min-w-[100px]">

                    <p className="text-xl font-bold text-white font-mono">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>

                  </div>

                  {/* REMOVE */}
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeFromCart(item.item_id)}
                    className="h-9 w-9 grid place-items-center text-[#ff003c] hover:bg-[#ff003c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00f0ff]"
                    data-testid={`remove-item-${item.item_id}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>

        {/* TOTAL CARD */}
        <div className="cut border-2 border-[#fcee0a] p-6">

          <div className="flex items-center justify-between mb-6">

            <span className="text-2xl uppercase tracking-wider text-white">
              Total
            </span>

            <span
              className="text-3xl font-bold text-[#fcee0a] font-mono"
              data-testid="cart-total"
            >
              ₹{total.toFixed(2)}
            </span>

          </div>

          {/* CHECKOUT BUTTON */}
          <Link
            to="/checkout"
            state={{ fromCart: true }}
            className="cp-btn block w-full text-center !py-4 text-lg"
            data-testid="cart-checkout-btn"
          >
            Proceed to Checkout
          </Link>

        </div>

      </div>
    </div>
  );
};

export default Cart;