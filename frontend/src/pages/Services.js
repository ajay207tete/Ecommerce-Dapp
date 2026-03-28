import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { MapPin, Star, Users, Wifi, CalendarIcon, Bed } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Services = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const { addToCart } = useCart();

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

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = (pricePerNight) => {
    const nights = calculateNights();
    return nights * pricePerNight;
  };

  const handleBookNow = (hotel) => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const nights = calculateNights();
    if (nights < 1) {
      toast.error('Check-out must be after check-in');
      return;
    }

    const total = calculateTotal(hotel.price_per_night);
    
    addToCart({
      item_id: hotel.id,
      item_type: 'hotel_booking',
      name: `${hotel.name} - ${nights} night${nights > 1 ? 's' : ''}`,
      price: total,
      quantity: 1,
      booking_details: {
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        guests: guests,
        nights: nights,
        room_type: hotel.room_type
      }
    });
    
    toast.success(`${hotel.name} added to cart!`);
    setSelectedHotel(null);
    setCheckIn(null);
    setCheckOut(null);
    setGuests(1);
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
                className="group relative overflow-hidden bg-[#0F0F1C] border-white/5 hover:border-secondary/50 transition-all duration-300"
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
                      onClick={() => setSelectedHotel(hotel)}
                      className="bg-primary hover:bg-primary/90"
                      size="sm"
                      data-testid={`book-hotel-${hotel.id}`}
                    >
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedHotel(null)}>
          <Card 
            className="bg-[#0F0F1C]/95 border-primary/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
            data-testid="booking-modal"
          >
            <div className="p-6">
              <h2 className="text-3xl font-orbitron font-bold text-white mb-4">
                Book {selectedHotel.name}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-white/80 font-rajdhani mb-2 block">Check-in Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-mono bg-input border-white/10",
                          !checkIn && "text-white/40"
                        )}
                        data-testid="check-in-picker"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#0F0F1C] border-white/10">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-white/80 font-rajdhani mb-2 block">Check-out Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-mono bg-input border-white/10",
                          !checkOut && "text-white/40"
                        )}
                        data-testid="check-out-picker"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#0F0F1C] border-white/10">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date < (checkIn || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="text-white/80 font-rajdhani mb-2 block">Number of Guests</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="bg-input border-white/10"
                  >
                    -
                  </Button>
                  <span className="text-2xl font-mono text-white w-12 text-center">{guests}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuests(Math.min(10, guests + 1))}
                    className="bg-input border-white/10"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              {checkIn && checkOut && calculateNights() > 0 && (
                <div className="bg-secondary/10 border border-secondary/30 rounded p-4 mb-6">
                  <div className="flex justify-between text-white/80 font-rajdhani mb-2">
                    <span>Duration:</span>
                    <span className="font-mono">{calculateNights()} night{calculateNights() > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-white/80 font-rajdhani mb-2">
                    <span>Price per night:</span>
                    <span className="font-mono">${selectedHotel.price_per_night.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary font-mono pt-2 border-t border-white/10">
                    <span>Total:</span>
                    <span>${calculateTotal(selectedHotel.price_per_night).toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/5"
                  onClick={() => setSelectedHotel(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleBookNow(selectedHotel)}
                  className="flex-1 bg-primary hover:bg-primary/90 font-orbitron uppercase"
                  data-testid="confirm-booking-btn"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Services;