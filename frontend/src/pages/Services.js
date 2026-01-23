import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (service) => {
    addToCart({
      item_id: service.id,
      item_type: 'service',
      name: service.name,
      price: service.price,
      quantity: 1
    });
    toast.success(`${service.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-orbitron text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="services-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold font-orbitron uppercase mb-4 text-white">
            Services
          </h1>
          <p className="text-lg text-white/60 font-rajdhani">Professional Web3 services</p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-2xl font-orbitron text-white/60 mb-2">No services yet</h3>
            <p className="text-white/40 font-rajdhani">Check back soon for new services!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 hover:border-primary/50 transition-all duration-300 p-6"
                data-testid={`service-card-${service.id}`}
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-orbitron font-bold mb-2 text-white">
                    {service.name}
                  </h3>
                  <p className="text-white/60 font-rajdhani mb-2">
                    {service.description}
                  </p>
                  {service.duration && (
                    <div className="text-sm text-secondary font-mono">
                      Duration: {service.duration}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-2xl font-bold text-primary font-mono">
                    ${service.price.toFixed(2)}
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(service)}
                    className="bg-primary hover:bg-primary/90"
                    size="sm"
                    data-testid={`add-service-to-cart-${service.id}`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;