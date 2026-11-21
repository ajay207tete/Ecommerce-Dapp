import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Check, X, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const errText = (error, fallback) => {
  const d = error?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (d && typeof d.message === "string") return d.message;
  return fallback;
};

export default function PaymentSuccess() {
  // state: "loading" | "success" | "error"
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {

    const fail = (msg) => {
      setState("error");
      setMessage(msg);
    };

    const verifyPayment = async () => {
      try {

        // GET ORDER ID FROM URL
        const params = new URLSearchParams(window.location.search);

        let orderId =
          params.get("order_id") ||
          params.get("orderId");

        const paymentId = params.get("payment_id");

        const token = localStorage.getItem("token");

        if (!orderId && !paymentId) {
          fail("Invalid payment link");
          return;
        }

        if (!token) {
          fail("Please login again");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // TON PAYMENTS RETURN WITH A PAYMENT ID: LOOK UP THE ORDER
        if (!orderId && paymentId) {
          const payment = await axios.get(
            `${API}/payments/${paymentId}/status`,
            { headers }
          );
          orderId = payment.data?.order_id;

          if (!orderId) {
            fail("Invalid payment link");
            return;
          }
        }

        // VERIFY PAYMENT
        const response = await axios.post(
          `${API}/payments/verify?order_id=${orderId}`,
          {},
          { headers }
        );

        if (response.data.success) {

          setState("success");
          setMessage("Payment Successful!");

          // OPTIONAL SMALL DELAY
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2500);

        } else {

          fail("Payment verification failed");

        }

      } catch (error) {

        console.error(error);

        fail(errText(error, "Payment verification failed"));
      }
    };

    verifyPayment();

  }, []);

  const accent =
    state === "success" ? "#fcee0a" : state === "error" ? "#ff003c" : "#00f0ff";

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4">
      <div
        className="cut bg-[#0d0d0d] border-l-[3px] p-8 sm:p-10 text-center max-w-md w-full"
        style={{ borderLeftColor: accent }}
        role="status"
        aria-live="polite"
      >

        <div
          className="cut mx-auto mb-6 h-24 w-24 grid place-items-center border-4"
          style={{ borderColor: accent, color: accent }}
        >
          {state === "loading" && <Loader2 className="h-12 w-12 animate-spin" />}
          {state === "success" && <Check className="h-14 w-14" />}
          {state === "error" && <X className="h-14 w-14" />}
        </div>

        <p className="font-mono text-sm text-white/50 mb-2">Payment status</p>

        <h1 className="text-4xl font-bold mb-4" style={{ color: accent }}>
          {state === "success" ? "Confirmed" : state === "error" ? "Problem" : "Checking"}
        </h1>

        <p className="text-xl text-white/80 mb-2">
          {message}
        </p>

        {state === "success" && (
          <p className="text-sm text-white/50 font-mono">Taking you to your dashboard...</p>
        )}

        {state !== "loading" && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard" className="cp-btn">View orders</Link>
            <Link to="/products" className="cp-btn cp-btn-outline">Keep shopping</Link>
          </div>
        )}

      </div>
    </div>
  );
}