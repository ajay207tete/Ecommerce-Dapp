import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

import { useTonConnectUI } from '@tonconnect/ui-react';

import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import CoinIcon from '../components/CoinIcon';
import WalletConnectionHelp from '../components/WalletConnectionHelp';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Coins shown when the customer picks Crypto.
// "code" is the pay_currency sent to /payments/create-crypto (NOWPayments).
// Make sure each code is enabled in your NOWPayments account.
const COINS = [
  { id: 'ton', label: 'TON', sub: 'Toncoin', code: 'ton', network: 'TON' },
  { id: 'bnb', label: 'BNB', sub: 'BNB Chain', code: 'bnbbsc', network: 'BNB Chain' },
  { id: 'usdt', label: 'USDT', sub: 'Tether', code: null, network: null },
  { id: 'btc', label: 'Bitcoin', sub: 'BTC', code: 'btc', network: 'Bitcoin' },
  { id: 'eth', label: 'Ethereum', sub: 'ETH', code: 'eth', network: 'Ethereum' },
  { id: 'sol', label: 'Solana', sub: 'SOL', code: 'sol', network: 'Solana' },
];

// USDT exists on several networks, so the customer picks one
const USDT_NETS = [
  { code: 'usdtton', label: 'TON', tag: 'Jetton', network: 'TON' },
  { code: 'usdttrc20', label: 'TRON', tag: 'TRC20', network: 'TRON (TRC20)' },
  { code: 'usdtbsc', label: 'BNB Chain', tag: 'BEP20', network: 'BNB Chain (BEP20)' },
];

// Label and network for a payment code (used on the payment details page)
const coinInfo = (code) => {
  const c = COINS.find((x) => x.code === code);
  if (c) return { label: c.label, network: c.network };
  const n = USDT_NETS.find((x) => x.code === code);
  if (n) return { label: 'USDT', network: n.network };
  return null;
};

const inputCls =
  'w-full h-12 bg-black border-2 border-[#262626] rounded-none px-3 text-white outline-none focus:border-[#fcee0a]';
const labelCls = 'block mb-2 text-sm uppercase tracking-wider text-white/70';
const tileCls = (on) =>
  `cut text-left p-3 border-l-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00f0ff] ${
    on ? 'border-[#fcee0a] bg-[#fcee0a]/10' : 'border-white/10 bg-[#0d0d0d] hover:border-[#00f0ff]'
  }`;

const Checkout = () => {

  const { cartItems, total, clearCart } = useCart();

  const {
    user,
    token,
    walletAddress
  } = useAuth();

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
    country: 'India',
    phone: ''
  });

  // PAYMENT CHOICE
  // payType: 'inr' (Cashfree) or 'crypto'
  const [payType, setPayType] = useState('inr');
  const [coin, setCoin] = useState('ton');
  const [usdtNet, setUsdtNet] = useState('usdtton');

  // 'INR' or a crypto code; the rest of this file uses this value
  const selectedCoin = COINS.find((c) => c.id === coin);
  const paymentMethod =
    payType === 'inr'
      ? 'INR'
      : coin === 'usdt'
      ? usdtNet
      : selectedCoin.code;

  const [loading, setLoading] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState(null);

  // =========================
  // FETCH ORDER
  // =========================

  useEffect(() => {

    if (orderId) {
      fetchOrder();
    }

  }, [orderId]);

  const fetchOrder = async () => {

    try {

      const response = await axios.get(
        `${API}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const order = response.data.find(
        o => o.id === orderId
      );

      if (order) {
        setExistingOrder(order);
        setOrderTotal(order.total);
      }

    } catch (error) {

      console.error(error);

    }
  };

  // =========================
  // INPUT CHANGE
  // =========================

  const handleInputChange = (e) => {

    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!user || !token) {

      toast.error('Please login first');

      navigate('/login');

      return;
    }

    setLoading(true);

    try {

      // =========================
      // HOTEL BOOKING
      // =========================

      if (orderType === 'hotel') {

        const bookingPayload = {

          hotel_id:
            existingOrder?.items?.[0]?.item_id ||
            orderId,

          hotel_name:
            existingOrder?.booking_details?.hotel_name ||
            existingOrder?.items?.[0]?.name ||
            'Hotel Booking',

          check_in:
            existingOrder?.booking_details?.check_in || '',

          check_out:
            existingOrder?.booking_details?.check_out || '',

          guests:
            existingOrder?.booking_details?.guests || 1,

          nights:
            existingOrder?.booking_details?.nights || 1,

          room_type:
            existingOrder?.booking_details?.room_type ||
            'Standard',

          total:
            existingOrder?.total || orderTotal,

          full_name:
            shippingInfo.full_name,

          phone:
            shippingInfo.phone,

          location:
            existingOrder?.booking_details?.location || '',

          hotel_image:
            existingOrder?.booking_details?.hotel_image || ''
        };

        // CREATE HOTEL BOOKING ORDER
        const bookingResponse = await axios.post(

          `${API}/orders/hotel-booking`,

          bookingPayload,

          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const bookingOrderId =
          bookingResponse.data.id;

        // PROCESS PAYMENT
        await processPayment(
          bookingOrderId
        );

        return;
      }

      // =========================
      // NORMAL PRODUCT ORDER
      // =========================

      if (cartItems.length === 0) {

        toast.error('Cart is empty');

        setLoading(false);

        return;
      }

      // CREATE NORMAL ORDER
      const orderResponse = await axios.post(

        `${API}/orders`,

        shippingInfo,

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const newOrderId =
        orderResponse.data.id;

      // PAYMENT
      await processPayment(
        newOrderId
      );

    } catch (error) {

      console.error(error);

      toast.error(

        error?.response?.data?.detail ||
        'Checkout failed'
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // PAYMENT
  // =========================

  const processPayment = async (orderIdToProcess) => {

    setLoading(true);

    try {

      // =========================
      // INR CASHFREE
      // =========================

      if (paymentMethod === 'INR') {

        const response = await axios.post(
          `${API}/payments/create-inr`,
          null,
          {
            params: {
              order_id: orderIdToProcess
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log('Cashfree:', response.data);

        if (!response.data.payment_session_id) {

          toast.error('Cashfree session failed');

          setLoading(false);

          return;
        }

        // CASHFREE SDK CHECK
        if (
          typeof window.Cashfree !== "function"
        ) {
          toast.error(
            "Cashfree SDK not loaded"
          );

          return;
        }

        // PRODUCTION MODE
        const cashfree = window.Cashfree({
          mode: 'production'
        });

        const checkoutOptions = {
          paymentSessionId:
            response.data.payment_session_id,

          redirectTarget: "_self",
        };

        cashfree.checkout(checkoutOptions)
          .then((result) => {

            console.log("Cashfree Result:", result);

          })
          .catch((err) => {

            console.error("Cashfree Error:", err);

            toast.error("Cashfree checkout failed");
          });

        return;
      }

      // =========================
      // TON WALLET CHECK
      // =========================

      if (
        paymentMethod === 'ton' &&
        !walletAddress
      ) {

        toast.error('Connect TON wallet');

        setLoading(false);

        return;
      }

      // =========================
      // CREATE CRYPTO PAYMENT
      // =========================

      const response = await axios.post(
        `${API}/payments/create-crypto`,
        null,
        {
          params: {
            order_id: orderIdToProcess,
            pay_currency: paymentMethod
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const paymentData = response.data;

      console.log(paymentData);

      // =========================
      // TON DIRECT PAYMENT
      // =========================

      if (paymentMethod === 'ton') {

        const transaction = {

          validUntil:
            Math.floor(Date.now() / 1000) + 600,

          messages: [
            {
              address: paymentData.pay_address,

              amount: String(
                Math.floor(
                  paymentData.pay_amount * 1000000000
                )
              )
            }
          ]
        };

        await tonConnectUI.sendTransaction(
          transaction
        );

        toast.success('TON Payment Sent');

        if (!orderId) {
          clearCart();
        }

        navigate(
          `/payment-success?payment_id=${paymentData.payment_id}`
        );

        return;
      }

      // =========================
      // NOWPAYMENTS REDIRECT
      // =========================

      if (paymentData.payment_url) {

        window.location.href =
          paymentData.payment_url;

        return;
      }

      // SHOW PAYMENT INFO
      setPaymentInfo(paymentData);

      toast.success('Payment Created');

    } catch (error) {

      console.error(error);

      toast.error(
        error?.response?.data?.detail?.message ||
        error?.response?.data?.detail ||
        'Payment failed'
      );

    } finally {

      setLoading(false);
    }
  };

  const copyText = async (text, what) => {
    try {
      await navigator.clipboard.writeText(String(text));
      toast.success(`${what} copied`);
    } catch (e) {
      toast.error('Could not copy');
    }
  };

  // =========================
  // LOGIN REQUIRED
  // =========================

  if (!user) {

    return (
      <div className="min-h-screen flex items-center justify-center px-4">

        <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-8 text-center">

          <h2 className="text-2xl text-white mb-5">
            Login Required
          </h2>

          <button
            type="button"
            className="cp-btn"
            onClick={() => navigate('/login')}
          >
            Login
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // PAYMENT INFO PAGE
  // =========================

  if (paymentInfo) {

    const info = coinInfo(paymentMethod);

    return (
      <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4">

        <div className="container mx-auto max-w-2xl">

          <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-6 sm:p-8">

            <h2 className="text-3xl text-[#fcee0a] mb-6">
              Payment Details
            </h2>

            <div className="space-y-5">

              {paymentInfo.pay_amount && (
                <div>
                  <span className={labelCls}>Send exactly</span>

                  <p className="text-3xl font-bold text-[#fcee0a] font-mono">
                    {paymentInfo.pay_amount} {info?.label}
                  </p>

                  {info && (
                    <p className="text-sm text-white/60 font-mono">
                      Network: {info.network}
                    </p>
                  )}
                </div>
              )}

              {paymentInfo.pay_address && (

                <div>

                  <span className={labelCls}>
                    Send Payment To
                  </span>

                  <div className="bg-black border-l-2 border-[#00f0ff] p-4 mt-2 break-all text-sm font-mono text-[#00f0ff]">

                    {paymentInfo.pay_address}

                  </div>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <button
                      type="button"
                      className="cp-btn cp-btn-outline !py-2 !px-4 text-sm"
                      onClick={() => copyText(paymentInfo.pay_address, 'Address')}
                    >
                      Copy address
                    </button>
                    {paymentInfo.pay_amount && (
                      <button
                        type="button"
                        className="cp-btn cp-btn-outline !py-2 !px-4 text-sm"
                        onClick={() => copyText(paymentInfo.pay_amount, 'Amount')}
                      >
                        Copy amount
                      </button>
                    )}
                  </div>

                </div>
              )}

              {info && (
                <p className="text-sm text-white/60">
                  Only send {info.label} on {info.network}. Funds sent on another network can be lost.
                </p>
              )}

              <p className="text-sm text-white/50 font-mono">
                Order total: ₹{paymentInfo.amount}
              </p>
            </div>

            <button
              type="button"
              className="cp-btn w-full text-center mt-8 !py-4"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>

          </div>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (

    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4">

      <div className="container mx-auto max-w-4xl">

        <p className="font-mono text-sm text-[#00f0ff] mb-2">Secure payment</p>
        <h1 className="text-5xl md:text-6xl font-bold uppercase text-white mb-8">
          Check<span className="text-[#fcee0a]">out</span>
        </h1>

        {!walletAddress && (
          <WalletConnectionHelp />
        )}

        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT */}

          <div>

            <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-5 sm:p-6">

              <h2 className="text-2xl text-white mb-6">

                {orderType === 'hotel'
                  ? 'Booking Details'
                  : 'Shipping Information'}

              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* HOTEL */}

                {orderType === 'hotel' ? (

                  <>

                    <div>

                      <label className={labelCls} htmlFor="full_name">
                        Guest Name
                      </label>

                      <input
                        id="full_name"
                        className={inputCls}
                        name="full_name"
                        value={shippingInfo.full_name}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                    <div>

                      <label className={labelCls} htmlFor="phone">
                        Phone
                      </label>

                      <input
                        id="phone"
                        className={inputCls}
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                  </>

                ) : (

                  <>
                    <div>

                      <label className={labelCls} htmlFor="full_name">
                        Full Name
                      </label>

                      <input
                        id="full_name"
                        className={inputCls}
                        name="full_name"
                        value={shippingInfo.full_name}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                    <div>

                      <label className={labelCls} htmlFor="address">
                        Address
                      </label>

                      <input
                        id="address"
                        className={inputCls}
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <label className={labelCls} htmlFor="city">
                          City
                        </label>

                        <input
                          id="city"
                          className={inputCls}
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          required
                        />

                      </div>

                      <div>

                        <label className={labelCls} htmlFor="postal_code">
                          Postal Code
                        </label>

                        <input
                          id="postal_code"
                          className={inputCls}
                          name="postal_code"
                          value={shippingInfo.postal_code}
                          onChange={handleInputChange}
                          required
                        />

                      </div>
                    </div>

                    <div>

                      <label className={labelCls} htmlFor="country">
                        Country
                      </label>

                      <input
                        id="country"
                        className={inputCls}
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                    <div>

                      <label className={labelCls} htmlFor="phone">
                        Phone
                      </label>

                      <input
                        id="phone"
                        className={inputCls}
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                      />

                    </div>

                  </>
                )}

                {/* PAYMENT */}

                <div className="pt-4">

                  <span className={labelCls}>
                    Payment Method
                  </span>

                  {/* Step 1: INR or Crypto */}
                  <div
                    className="grid grid-cols-2 gap-3"
                    role="radiogroup"
                    aria-label="Payment type"
                  >

                    <button
                      type="button"
                      role="radio"
                      aria-checked={payType === 'inr'}
                      onClick={() => setPayType('inr')}
                      className={tileCls(payType === 'inr')}
                    >
                      <div className="text-lg font-bold uppercase tracking-wide">INR</div>
                      <div className="font-mono text-xs text-white/60">Cards, UPI, netbanking</div>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={payType === 'crypto'}
                      aria-expanded={payType === 'crypto'}
                      onClick={() => setPayType('crypto')}
                      className={tileCls(payType === 'crypto')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold uppercase tracking-wide">Crypto</div>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            payType === 'crypto' ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      <div className="font-mono text-xs text-white/60">TON, USDT, BNB, BTC, ETH, SOL</div>
                    </button>

                  </div>

                  {/* Step 2: coin list (opens when Crypto is chosen) */}
                  {payType === 'crypto' && (
                    <div className="mt-3">

                      <div
                        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                        role="radiogroup"
                        aria-label="Cryptocurrency"
                      >
                        {COINS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            role="radio"
                            aria-checked={coin === c.id}
                            onClick={() => setCoin(c.id)}
                            className={`${tileCls(coin === c.id)} flex items-center gap-3`}
                          >
                            <CoinIcon coin={c.id} size={32} />
                            <div className="min-w-0">
                              <div className="font-bold uppercase tracking-wide leading-tight">{c.label}</div>
                              <div className="font-mono text-[11px] text-white/60">{c.sub}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* USDT network */}
                      {coin === 'usdt' && (
                        <div className="mt-4">
                          <span className={labelCls}>USDT network</span>
                          <div
                            className="grid grid-cols-3 gap-2"
                            role="radiogroup"
                            aria-label="USDT network"
                          >
                            {USDT_NETS.map((n) => (
                              <button
                                key={n.code}
                                type="button"
                                role="radio"
                                aria-checked={usdtNet === n.code}
                                onClick={() => setUsdtNet(n.code)}
                                className={tileCls(usdtNet === n.code)}
                              >
                                <div className="text-sm font-bold uppercase leading-tight">{n.label}</div>
                                <div className="font-mono text-[11px] text-white/60">{n.tag}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="mt-3 font-mono text-xs text-white/50">
                        You will pay in {coinInfo(paymentMethod)?.label} on {coinInfo(paymentMethod)?.network}.
                      </p>

                    </div>
                  )}

                </div>

                <button
                  type="submit"
                  className="cp-btn w-full text-center !py-4 text-lg mt-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#fcee0a]"
                  disabled={loading}
                >

                  {loading
                    ? 'Processing...'
                    : orderType === 'hotel'
                    ? 'Confirm Booking'
                    : 'Place Order'}

                </button>

              </form>

            </div>
          </div>

          {/* RIGHT */}

          <div>

            <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#00f0ff] p-5 sm:p-6 md:sticky md:top-24">

              <h2 className="text-2xl text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">

                {existingOrder ? (

                  existingOrder.items?.map((item) => (

                    <div
                      key={item.item_id}
                      className="flex justify-between gap-3 text-white"
                    >

                      <span>
                        {item.name}
                      </span>

                      <span className="font-mono">
                        ₹{(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </span>

                    </div>
                  ))

                ) : (

                  cartItems.map((item) => (

                    <div
                      key={item.item_id}
                      className="flex justify-between gap-3 text-white"
                    >

                      <span>
                        {item.name} x {item.quantity}
                      </span>

                      <span className="font-mono">
                        ₹{(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </span>

                    </div>
                  ))
                )}

              </div>

              <div className="border-t border-[#262626] pt-4">

                <div className="flex justify-between items-center">

                  <span className="text-xl text-white uppercase tracking-wider">
                    Total
                  </span>

                  <span className="text-3xl font-bold text-[#fcee0a] font-mono">

                    ₹{(
                      existingOrder
                        ? orderTotal
                        : total
                    ).toFixed(2)}

                  </span>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;