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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';

import { toast } from 'sonner';

import WalletConnectionHelp from '../components/WalletConnectionHelp';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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

  const [paymentMethod, setPaymentMethod] = useState('INR');

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
        if (!window.Cashfree) {

          toast.error('Cashfree SDK not loaded');

          setLoading(false);

          return;
        }

        // SANDBOX MODE
        const cashfree = window.Cashfree({
          mode: 'sandbox'
        });

        await cashfree.checkout({
          paymentSessionId:
            response.data.payment_session_id,

          redirectTarget: '_self'
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

  // =========================
  // LOGIN REQUIRED
  // =========================

  if (!user) {

    return (
      <div className="min-h-screen flex items-center justify-center px-4">

        <Card className="bg-[#0F0F1C]/80 border-white/10 p-8 text-center">

          <h2 className="text-2xl text-white mb-4">
            Login Required
          </h2>

          <Button
            onClick={() => navigate('/login')}
          >
            Login
          </Button>

        </Card>
      </div>
    );
  }

  // =========================
  // PAYMENT INFO PAGE
  // =========================

  if (paymentInfo) {

    return (
      <div className="min-h-screen py-12 px-4">

        <div className="container mx-auto max-w-2xl">

          <Card className="bg-[#0F0F1C]/80 border-white/10 p-8">

            <h2 className="text-3xl text-primary mb-6">
              Payment Details
            </h2>

            <div className="space-y-4">

              <div>
                <Label>Amount</Label>

                <p className="text-2xl text-primary">
                  ₹{paymentInfo.amount}
                </p>
              </div>

              {paymentInfo.pay_address && (

                <div>

                  <Label>
                    Send Payment To
                  </Label>

                  <div className="bg-input p-4 rounded mt-2 break-all text-sm">

                    {paymentInfo.pay_address}

                  </div>

                </div>
              )}
            </div>

            <Button
              className="w-full mt-6"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>

          </Card>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (

    <div className="min-h-screen py-12 px-4">

      <div className="container mx-auto max-w-4xl">

        <h1 className="text-5xl text-white mb-8">
          Checkout
        </h1>

        {!walletAddress && (
          <WalletConnectionHelp />
        )}

        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT */}

          <div>

            <Card className="bg-[#0F0F1C]/80 border-white/10 p-6">

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

                      <Label className="text-white">
                        Guest Name
                      </Label>

                      <Input
                        name="full_name"
                        value={shippingInfo.full_name}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                    <div>

                      <Label className="text-white">
                        Phone
                      </Label>

                      <Input
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

                      <Label className="text-white">
                        Full Name
                      </Label>

                      <Input
                        name="full_name"
                        value={shippingInfo.full_name}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                    <div>

                      <Label className="text-white">
                        Address
                      </Label>

                      <Input
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <Label className="text-white">
                          City
                        </Label>

                        <Input
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          required
                        />

                      </div>

                      <div>

                        <Label className="text-white">
                          Postal Code
                        </Label>

                        <Input
                          name="postal_code"
                          value={shippingInfo.postal_code}
                          onChange={handleInputChange}
                          required
                        />

                      </div>
                    </div>

                    <div>

                      <Label className="text-white">
                        Country
                      </Label>

                      <Input
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        required
                      />

                    </div>

                    <div>

                      <Label className="text-white">
                        Phone
                      </Label>

                      <Input
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                      />

                    </div>

                  </>
                )}

                {/* PAYMENT */}

                <div className="pt-4">

                  <Label className="text-white block mb-3">
                    Payment Method
                  </Label>

                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >

                    <SelectTrigger>

                      <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="INR">
                        Pay with INR
                      </SelectItem>

                      <SelectItem value="ton">
                        TON
                      </SelectItem>

                    </SelectContent>

                  </Select>

                </div>

                <Button
                  type="submit"
                  className="w-full py-6 mt-6"
                  disabled={loading}
                >

                  {loading
                    ? 'Processing...'
                    : orderType === 'hotel'
                    ? 'Confirm Booking'
                    : 'Place Order'}

                </Button>

              </form>

            </Card>
          </div>

          {/* RIGHT */}

          <div>

            <Card className="bg-[#0F0F1C]/80 border-white/10 p-6 sticky top-24">

              <h2 className="text-2xl text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">

                {existingOrder ? (

                  existingOrder.items?.map((item) => (

                    <div
                      key={item.item_id}
                      className="flex justify-between text-white"
                    >

                      <span>
                        {item.name}
                      </span>

                      <span>
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
                      className="flex justify-between text-white"
                    >

                      <span>
                        {item.name} x {item.quantity}
                      </span>

                      <span>
                        ₹{(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </span>

                    </div>
                  ))
                )}

              </div>

              <div className="border-t border-white/10 pt-4">

                <div className="flex justify-between items-center">

                  <span className="text-xl text-white">
                    Total
                  </span>

                  <span className="text-3xl text-primary">

                    ₹{(
                      existingOrder
                        ? orderTotal
                        : total
                    ).toFixed(2)}

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