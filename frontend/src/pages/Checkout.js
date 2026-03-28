import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const { cartItems, total, clearCart } = useCart();
  const { user, token, walletAddress } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get('order_id');
  const orderType = searchParams.get('type');
  
  const [existingOrder, setExistingOrder] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  
  const [shippingInfo, setShippingInfo] = useState({
    full_name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'US',
    phone: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    // If order_id is provided, fetch the existing order
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const order = response.data.find(o => o.id === orderId);
      if (order) {
        setExistingOrder(order);
        setOrderTotal(order.total);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !token) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    // For hotel bookings, order already exists
    if (orderId && existingOrder) {
      processPayment(orderId);
      return;
    }

    // For cart-based checkout
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    
    try {
      const orderResponse = await axios.post(
        `${API}/orders`,
        shippingInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newOrderId = orderResponse.data.id;
      await processPayment(newOrderId);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Checkout failed');
      setLoading(false);
    }
  };

  const processPayment = async (orderIdToProcess) => {
    setLoading(true);
    
    try {
      let paymentResponse;
      if (paymentMethod === 'INR') {
        // Cashfree INR payment
        paymentResponse = await axios.post(
          `${API}/payments/create-inr?order_id=${orderIdToProcess}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Redirect to Cashfree payment page
        if (paymentResponse.data.payment_session_id) {
          const cashfree = window.Cashfree({
            mode: 'production'
          });
          
          cashfree.checkout({
            paymentSessionId: paymentResponse.data.payment_session_id,
            returnUrl: `${window.location.origin}/payment-success?order_id=${orderIdToProcess}`
          });
          
          toast.success('Redirecting to payment gateway...');
          return;
        }
      } else {
        // Check if wallet is connected for crypto payments
        if (!walletAddress) {
          toast.error('Please connect your TON wallet first');
          setLoading(false);
          return;
        }

        // Create NOWPayments payment or TON transaction
        paymentResponse = await axios.post(
          `${API}/payments/create-crypto?order_id=${orderIdToProcess}&pay_currency=${paymentMethod}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // If TON payment, initiate transaction via wallet
        if (paymentMethod === 'ton') {
          try {
            const transaction = {
              validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
              messages: [
                {
                  address: paymentResponse.data.pay_address,
                  amount: String(Math.floor(paymentResponse.data.pay_amount * 1000000000)), // Convert to nanotons
                }
              ]
            };

            // Send transaction via connected wallet
            const result = await tonConnectUI.sendTransaction(transaction);
            
            if (result) {
              toast.success('Payment sent! Waiting for confirmation...');
              // Update payment with transaction hash
              await axios.patch(
                `${API}/payments/${paymentResponse.data.id}/update-tx`,
                { tx_hash: result.boc },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (!orderId) clearCart();
              navigate('/dashboard');
              toast.success('Order placed! Payment is being processed.');
              return;
            }
          } catch (txError) {
            console.error('Transaction error:', txError);
            toast.error('Transaction cancelled or failed');
            setLoading(false);
            return;
          }
        }
      }
      
      setPaymentInfo(paymentResponse.data);
      clearCart();
      toast.success('Order created! Please complete payment.');
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-8 text-center">
          <h2 className="text-2xl font-orbitron text-white mb-4">Login Required</h2>
          <p className="text-white/60 font-rajdhani mb-6">Please login to continue with checkout</p>
          <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary/90">
            Login
          </Button>
        </Card>
      </div>
    );
  }

  if (paymentInfo) {
    return (
      <div className="min-h-screen py-12 px-4" data-testid="payment-info-page">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-8">
            <h2 className="text-3xl font-orbitron text-primary mb-6">Payment Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-white/60">Payment Method</Label>
                <p className="text-xl font-mono text-white">{paymentMethod}</p>
              </div>
              
              <div>
                <Label className="text-white/60">Amount</Label>
                <p className="text-2xl font-bold text-primary font-mono">${paymentInfo.amount.toFixed(2)}</p>
              </div>
              
              {paymentInfo.pay_address && (
                <div>
                  <Label className="text-white/60">Send Payment To</Label>
                  <div className="bg-input p-4 rounded mt-2 break-all font-mono text-sm text-secondary">
                    {paymentInfo.pay_address}
                  </div>
                  {paymentInfo.pay_amount && (
                    <p className="text-lg mt-2 text-white">
                      Amount: <span className="font-bold text-secondary">{paymentInfo.pay_amount} {paymentInfo.currency}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-secondary/10 border border-secondary/30 p-4 rounded mb-6">
              <p className="text-sm text-white/80 font-rajdhani">
                Please send the exact amount to the address above. Your order will be confirmed once payment is received.
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="go-to-dashboard-btn"
            >
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="checkout-page">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold font-orbitron uppercase mb-8 text-white">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6">
              <h2 className="text-2xl font-orbitron text-white mb-6">Shipping Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name" className="text-white/80">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={shippingInfo.full_name}
                    onChange={handleInputChange}
                    required
                    className="bg-input border-white/10 text-white"
                    data-testid="checkout-full-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-white/80">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="bg-input border-white/10 text-white"
                    data-testid="checkout-address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-white/80">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="bg-input border-white/10 text-white"
                      data-testid="checkout-city"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="postal_code" className="text-white/80">Postal Code</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={shippingInfo.postal_code}
                      onChange={handleInputChange}
                      required
                      className="bg-input border-white/10 text-white"
                      data-testid="checkout-postal-code"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="country" className="text-white/80">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    required
                    className="bg-input border-white/10 text-white"
                    data-testid="checkout-country"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-white/80">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="bg-input border-white/10 text-white"
                    data-testid="checkout-phone"
                  />
                </div>
                
                <div className="pt-4">
                  <Label className="text-white/80 mb-3 block">Payment Method</Label>
                  
                  {!walletAddress && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-3">
                      <p className="text-xs text-yellow-500 font-rajdhani">
                        ⚠️ Connect your TON wallet to enable crypto payments
                      </p>
                    </div>
                  )}
                  
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-input border-white/10 text-white" data-testid="payment-method-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F0F1C] border-white/10">
                      <SelectItem value="INR">Pay with INR (Cashfree)</SelectItem>
                      <SelectItem value="ton" disabled={!walletAddress}>TON (via Connected Wallet)</SelectItem>
                      <SelectItem value="btc" disabled={!walletAddress}>Bitcoin (BTC)</SelectItem>
                      <SelectItem value="eth" disabled={!walletAddress}>Ethereum (ETH)</SelectItem>
                      <SelectItem value="usdc" disabled={!walletAddress}>USDC</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/40 mt-2 font-rajdhani">
                    {paymentMethod === 'INR' 
                      ? 'Secure payment via Cashfree - UPI, Cards, Net Banking' 
                      : paymentMethod === 'ton'
                      ? '✓ Pay directly from your connected TON wallet'
                      : 'Crypto payment via NOWPayments'}
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 font-orbitron uppercase tracking-wider py-6 mt-6"
                  disabled={loading}
                  data-testid="place-order-btn"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </form>
            </Card>
          </div>

          <div>
            <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6 sticky top-24">
              <h2 className="text-2xl font-orbitron text-white mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.item_id} className="flex justify-between text-white/80 font-rajdhani">
                    <span>{item.name} x {item.quantity}</span>
                    <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-orbitron text-white">Total</span>
                  <span className="text-3xl font-bold text-primary font-mono" data-testid="checkout-total">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;