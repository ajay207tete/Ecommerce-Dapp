import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, token, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-secondary" />;
      default: return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-orbitron text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">

        <h1 className="text-5xl font-bold text-white mb-10">Dashboard</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6 bg-[#0F0F1C]/80 border-white/10">

              {/* TOP SECTION */}
              <div
                className="flex justify-between cursor-pointer"
                onClick={() => toggleExpand(order.id)}
              >
                <div>
                  <div className="flex gap-3 items-center">
                    <span className="text-white/60">#{order.id.slice(0, 8)}</span>
                    {getStatusIcon(order.status)}
                    <span className="text-white capitalize">{order.status}</span>
                  </div>

                  <p className="text-sm text-white/60 mt-1">
                    {order.items.length} item(s)
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-primary text-xl font-bold">
                    ${order.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              {expandedOrder === order.id && (
                <div className="mt-6 border-t border-white/10 pt-4 space-y-4">

                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 items-center">

                      {/* IMAGE */}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}

                      {/* DETAILS */}
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {item.name || item.productName}
                        </p>

                        <p className="text-sm text-white/60">
                          Qty: {item.quantity}
                        </p>

                        <p className="text-sm text-white/60">
                          Price: ${item.price}
                        </p>

                        {/* SERVICE / BOOKING DETAILS */}
                        {item.booking && (
                          <div className="text-xs text-blue-400 mt-1">
                            📅 {item.booking.date}
                            <br />
                            📍 {item.booking.location}
                          </div>
                        )}
                      </div>

                      {/* ITEM TOTAL */}
                      <div className="text-primary font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;