import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? String(d) : date.toLocaleDateString();
};

const Dashboard = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [hoveredOrder, setHoveredOrder] = useState(null);

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
      case 'pending': return <Clock className="h-5 w-5 text-[#fcee0a]" />;
      case 'paid': return <CheckCircle className="h-5 w-5 text-[#00f0ff]" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-[#00f0ff]" />;
      default: return <XCircle className="h-5 w-5 text-[#ff003c]" />;
    }
  };

  const accentFor = (status) => {
    if (status === 'pending') return '#fcee0a';
    if (status === 'paid' || status === 'completed') return '#00f0ff';
    return '#ff003c';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold uppercase tracking-[0.3em] text-[#fcee0a] animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4" data-testid="dashboard-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <p className="font-mono text-sm text-[#00f0ff] mb-2">Welcome back, {user?.email}</p>
          <h1 className="text-5xl md:text-7xl font-bold uppercase mb-2 text-white">
            Dash<span className="text-[#fcee0a]">board</span>
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 uppercase tracking-wider text-sm">Total Orders</span>
              <Package className="h-5 w-5 text-[#fcee0a]" />
            </div>
            <div className="text-4xl font-bold text-white font-mono">{orders.length}</div>
          </div>

          <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#00f0ff] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 uppercase tracking-wider text-sm">Pending</span>
              <Clock className="h-5 w-5 text-[#fcee0a]" />
            </div>
            <div className="text-4xl font-bold text-white font-mono">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>

          <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#ff003c] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 uppercase tracking-wider text-sm">Completed</span>
              <CheckCircle className="h-5 w-5 text-[#00f0ff]" />
            </div>
            <div className="text-4xl font-bold text-white font-mono">
              {orders.filter(o => o.status === 'completed' || o.status === 'paid').length}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl text-white mb-6">Recent Orders</h2>

          {orders.length === 0 ? (
            <div className="border-2 border-dashed border-[#262626] p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <p className="text-xl text-white/60">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...orders]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 10)
                .map((order) => {
                  const hotel = order.booking_details || order.hotel;
                  const hotelName = hotel?.hotel_name || hotel?.name;
                  const open = hoveredOrder === order.id;

                  return (
                    <div
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      aria-expanded={open}
                      onMouseEnter={() => setHoveredOrder(order.id)}
                      onMouseLeave={() => setHoveredOrder(null)}
                      onClick={() => setHoveredOrder(open ? null : order.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setHoveredOrder(open ? null : order.id);
                        }
                      }}
                      className="cut relative bg-[#0d0d0d] border-l-[3px] p-6 cursor-pointer transition-colors hover:bg-[#141414] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00f0ff]"
                      style={{ borderLeftColor: accentFor(order.status) }}
                      data-testid={`order-${order.id}`}
                    >

                      {/* Main Order Row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-white/60">
                              Order #{order.id.slice(0, 8)}
                            </span>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <span className="text-sm font-mono text-white capitalize">
                                {order.status}
                              </span>
                            </div>
                          </div>

                          <p className="text-white/60 text-sm">
                            {order.items.length} item(s)
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#fcee0a] font-mono">
                            ₹{order.total.toFixed(2)}
                          </div>
                          <p className="text-xs text-white/40 font-mono mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      {open && (
                        <div className="mt-4 p-4 bg-black border-l-2 border-[#262626]">

                          <div>
                            <p className="text-sm text-white/60 mb-2">Items:</p>
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm text-white">
                                <span>{item.name}</span>
                                <span className="font-mono">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {hotel && (
                            <div className="mt-3 pt-3 border-t border-[#262626]">
                              <p className="text-sm text-white/60 mb-1">Hotel:</p>
                              <p className="text-sm text-white">{hotelName}</p>
                              <p className="text-xs text-white/50 font-mono">
                                {fmtDate(hotel.check_in)} → {fmtDate(hotel.check_out)}
                              </p>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;