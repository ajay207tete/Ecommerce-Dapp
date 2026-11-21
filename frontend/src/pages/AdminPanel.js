import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, ClipboardList, Users } from 'lucide-react';

const sections = [
  { icon: Package, title: 'Products', text: 'Manage products and inventory', color: '#fcee0a' },
  { icon: ClipboardList, title: 'Orders', text: 'Process and manage orders', color: '#00f0ff' },
  { icon: Users, title: 'Users', text: 'Manage user accounts', color: '#ff003c' },
];

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
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4" data-testid="admin-panel-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <p className="font-mono text-sm text-[#ff003c] mb-2">Restricted area</p>
          <h1 className="text-5xl md:text-7xl font-bold uppercase mb-3 text-white">
            Admin <span className="text-[#fcee0a]">Panel</span>
          </h1>
          <p className="text-lg text-white/60">Manage your THRUSTER marketplace</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(({ icon: Icon, title, text, color }) => (
            <div
              key={title}
              className="cut bg-[#0d0d0d] border-l-[3px] p-8"
              style={{ borderLeftColor: color }}
            >
              <Icon className="h-12 w-12 mb-4" style={{ color }} />
              <h3 className="text-2xl text-white mb-2">{title}</h3>
              <p className="text-white/60">{text}</p>
            </div>
          ))}
        </div>

        <div className="border-2 border-dashed border-[#262626] p-8 mt-8">
          <p className="text-center text-white/60 font-mono text-sm">
            Full admin features coming soon. Use backend API for now.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;