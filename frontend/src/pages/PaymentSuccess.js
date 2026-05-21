import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {

    const verifyPayment = async () => {
      try {

        // GET ORDER ID FROM URL
        const params = new URLSearchParams(window.location.search);

        const orderId =
          params.get("order_id") ||
          params.get("orderId");

        if (!orderId) {
          setStatus("❌ Invalid payment link");
          return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
          setStatus("❌ Please login again");
          return;
        }

        // VERIFY PAYMENT
        const response = await axios.post(
          `${API}/payments/verify?order_id=${orderId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {

          setStatus("✅ Payment Successful!");

          // OPTIONAL SMALL DELAY
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2500);

        } else {

          setStatus("❌ Payment verification failed");

        }

      } catch (error) {

        console.error(error);

        setStatus(
          error.response?.data?.detail ||
          "❌ Payment verification failed"
        );
      }
    };

    verifyPayment();

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="bg-[#0F0F1C] border border-white/10 rounded-2xl p-10 text-center max-w-md w-full">

        <h1 className="text-4xl font-bold mb-6 font-orbitron">
          Payment Status
        </h1>

        <p className="text-xl text-primary">
          {status}
        </p>

      </div>
    </div>
  );
}