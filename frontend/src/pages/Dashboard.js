import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const API =`${process.env.REACT_APP_BACKEND_URL}/api`;

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
headers: { Authorization:`Bearer ${token}`}
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

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-2xl font-orbitron text-primary animate-pulse">Loading...</div>
</div>
);
}

return (
<div className="min-h-screen py-12 px-4" data-testid="dashboard-page">
<div className="container mx-auto">
<div className="mb-12">
<h1 className="text-5xl font-bold font-orbitron uppercase mb-2 text-white">Dashboard</h1>
<p className="text-lg text-white/60 font-rajdhani">Welcome back, {user?.email}</p>
</div>

<div className="grid md:grid-cols-3 gap-6 mb-12">  
      <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6">  
        <div className="flex items-center justify-between mb-2">  
          <span className="text-white/60 font-rajdhani">Total Orders</span>  
          <Package className="h-5 w-5 text-primary" />  
        </div>  
        <div className="text-3xl font-bold text-white font-mono">{orders.length}</div>  
      </Card>  

      <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6">  
        <div className="flex items-center justify-between mb-2">  
          <span className="text-white/60 font-rajdhani">Pending</span>  
          <Clock className="h-5 w-5 text-yellow-400" />  
        </div>  
        <div className="text-3xl font-bold text-white font-mono">  
          {orders.filter(o => o.status === 'pending').length}  
        </div>  
      </Card>  

      <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6">  
        <div className="flex items-center justify-between mb-2">  
          <span className="text-white/60 font-rajdhani">Completed</span>  
          <CheckCircle className="h-5 w-5 text-secondary" />  
        </div>  
        <div className="text-3xl font-bold text-white font-mono">  
          {orders.filter(o => o.status === 'completed' || o.status === 'paid').length}  
        </div>  
      </Card>  
    </div>  

    <div>  
      <h2 className="text-3xl font-orbitron text-white mb-6">Recent Orders</h2>  

      {orders.length === 0 ? (  
        <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-12 text-center">  
          <Package className="h-16 w-16 mx-auto mb-4 text-white/20" />  
          <p className="text-xl text-white/60 font-rajdhani">No orders yet</p>  
        </Card>  
      ) : (  
        <div className="space-y-4">  
          {[...orders]
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .slice(0, 10)
  .map((order) => (
              <Card
  key={order.id}
  onMouseEnter={() => setHoveredOrder(order.id)}
  onMouseLeave={() => setHoveredOrder(null)}
  className="relative bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
>
  
  {/* 🔹 Main Order Row */}
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
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

      <p className="text-white/60 font-rajdhani text-sm">
        {order.items.length} item(s)
      </p>
    </div>

    <div className="text-right">
      <div className="text-2xl font-bold text-primary font-mono">
        ₹{order.total.toFixed(2)}
      </div>
      <p className="text-xs text-white/40 font-mono mt-1">
        {new Date(order.created_at).toLocaleDateString()}
      </p>
    </div>
  </div>

  {/* 🔥 HOVER DETAILS (PASTE HERE) */}
  {hoveredOrder === order.id && (
    <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 animate-fade-in">

      <div>
        <p className="text-sm text-white/60 mb-2">Items:</p>
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm text-white">
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
          </div>
        ))}
      </div>

      {order.hotel && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-sm text-white/60 mb-1">Hotel:</p>
          <p className="text-sm text-white">{order.hotel.name}</p>
          <p className="text-xs text-white/50">
            {order.hotel.check_in} → {order.hotel.check_out}
          </p>
        </div>
      )}

    </div>
  )}

</Card>
          ))}  
        </div>  
      )}  
    </div>  
  </div>  
</div>

);
};

export default Dashboard;