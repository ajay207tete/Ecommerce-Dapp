import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const [status, setStatus] = useState("Checking payment...");
  const params = new URLSearchParams(window.location.search);

const paymentId =
  params.get("payment_id") ||   // NOWPayments
  params.get("paymentId") ||    // fallback
  params.get("order_id");       // Cashfree

  useEffect(() => {
  if (paymentId === null) return; // wait

    if (!paymentId) {
    setStatus("❌ Invalid payment link");
    return;
  }

    const checkPayment = async () => {
      try {
        const res = await axios.get(`${API}/payments/status`, {
  params: { id: paymentId }
});
        
        if (res.data.status === "finished" || res.data.status === "completed") {
          
          await axios.post(`${API}/payments/confirm`, {
            payment_id: paymentId
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });

          setStatus("✅ Payment Successful & Order Confirmed!");
setTimeout(() => {
    window.location.href = "/dashboard"; // or /orders
  }, 3000);
        } else {
          setStatus("⏳ Waiting for confirmation...");
        }
      } catch (err) {
        setStatus("❌ Error verifying payment");
      }
    };

    checkPayment();
    const interval = setInterval(checkPayment, 5000);

    return () => clearInterval(interval);
  }, [paymentId]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">Payment Status</h1>
        <p className="text-xl">{status}</p>
      </div>
    </div>
  );
}
