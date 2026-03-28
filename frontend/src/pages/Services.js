import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { MapPin, Star, Bed } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Services = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setHotels(response.data);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen py-12 px-4" data-testid="services-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold font-orbitron uppercase mb-4 text-white">
            Hotel Bookings
          </h1>
          <p className="text-lg text-white/60 font-rajdhani">Book your next stay with crypto. Earn NFTs.</p>
        </div>

        {hotels.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-2xl font-orbitron text-white/60 mb-2">No hotels yet</h3>
            <p className="text-white/40 font-rajdhani">Check back soon for new properties!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Card
                key={hotel.id}
                className="group relative overflow-hidden bg-[#0F0F1C] border-white/5 hover:border-secondary/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                data-testid={`hotel-card-${hotel.id}`}
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  {hotel.images && hotel.images[0] ? (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Bed className="h-20 w-20 text-white/20" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-orbitron font-bold text-white">
                      {hotel.name}
                    </h3>
                    {hotel.rating && (
                      <div className="flex items-center gap-1 text-secondary">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-mono">{hotel.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {hotel.location && (
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="font-rajdhani">{hotel.location}</span>
                    </div>
                  )}
                  
                  <p className="text-white/60 font-rajdhani mb-3 line-clamp-2">
                    {hotel.description}
                  </p>
                  
                  {hotel.room_type && (
                    <div className="text-sm text-secondary font-mono mb-3">
                      {hotel.room_type}
                    </div>
                  )}
                  
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded text-white/70 font-rajdhani"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <div className="text-2xl font-bold text-primary font-mono">
                        ${hotel.price_per_night.toFixed(2)}
                      </div>
                      <div className="text-xs text-white/40 font-mono">per night</div>
                      {hotel.available_rooms && (
                        <div className="text-xs text-secondary font-mono mt-1">
                          {hotel.available_rooms} rooms available
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hotels/${hotel.id}`);
                      }}
                      className="bg-primary hover:bg-primary/90"
                      size="sm"
                      data-testid={`view-hotel-${hotel.id}`}
                    >
                      View Details
                    </Button>
                  </div>
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
