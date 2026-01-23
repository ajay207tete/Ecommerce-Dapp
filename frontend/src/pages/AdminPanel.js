import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Shield } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="admin-panel-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold font-orbitron uppercase mb-4 text-white">Admin Panel</h1>
          <p className="text-lg text-white/60 font-rajdhani">Manage your THRUSTER marketplace</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-orbitron text-white mb-2">Products</h3>
            <p className="text-white/60 font-rajdhani">Manage products and inventory</p>
          </Card>

          <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="text-xl font-orbitron text-white mb-2">Orders</h3>
            <p className="text-white/60 font-rajdhani">Process and manage orders</p>
          </Card>

          <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-orbitron text-white mb-2">Users</h3>
            <p className="text-white/60 font-rajdhani">Manage user accounts</p>
          </Card>
        </div>

        <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-8 mt-8">
          <p className="text-center text-white/60 font-rajdhani">
            Full admin features coming soon. Use backend API for now.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;