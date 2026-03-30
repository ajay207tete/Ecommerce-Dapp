import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const [status, setStatus] = useState("Checking payment...");
  const paymentId = new URLSearchParams(window.location.search).get("payment_id");

  useEffect(() => {
    if (!paymentId) return;

    const checkPayment = async () => {
      try {
        const res = await axios.get(`${API}/payments/${paymentId}/status`);
        
        if (res.data.status === "finished" || res.data.status === "completed") {
          
          await axios.post(`${API}/payments/confirm`, {
            payment_id: paymentId
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });

          setStatus("✅ Payment Successful & Order Confirmed!");
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