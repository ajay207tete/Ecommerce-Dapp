import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { MapPin, Star, Wifi, CalendarIcon, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HotelDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/services/${id}`);
      setHotel(response.data);
    } catch (error) {
      console.error('Failed to fetch hotel:', error);
      toast.error('Failed to load hotel details');
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

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * (hotel?.price_per_night || 0);
  };

  const handleBookNow = async () => {
    if (!user || !token) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const nights = calculateNights();
    if (nights < 1) {
      toast.error('Check-out must be after check-in');
      return;
    }

    setBookingLoading(true);

    try {
      // Create order directly (no cart)
      const orderResponse = await axios.post(
        `${API}/orders/hotel-booking`,
        {
          hotel_id: hotel.id,
          hotel_name: hotel.name,
          check_in: checkIn.toISOString(),
          check_out: checkOut.toISOString(),
          guests: guests,
          nights: nights,
          room_type: hotel.room_type,
          total: calculateTotal(),
          location: hotel.location,
          hotel_image: hotel.images[0]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to checkout with order ID
      navigate(`/checkout?order_id=${orderResponse.data.id}&type=hotel`);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const nextImage = () => {
    if (hotel?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
    }
  };

  const prevImage = () => {
    if (hotel?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-orbitron text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white/60">Hotel not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="hotel-detail-page">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6 text-white/60 hover:text-white"
          onClick={() => navigate('/services')}
        >
          ← Back to Hotels
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted mb-4 group">
              {hotel.images && hotel.images.length > 0 ? (
                <>
                  <img
                    src={hotel.images[currentImageIndex]}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  {hotel.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Wifi className="h-20 w-20 text-white/20" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {hotel.images && hotel.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {hotel.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-video rounded overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-primary' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hotel Info & Booking */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold font-orbitron text-white mb-2">
                  {hotel.name}
                </h1>
                {hotel.location && (
                  <div className="flex items-center gap-2 text-white/60 mb-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-rajdhani text-lg">{hotel.location}</span>
                  </div>
                )}
              </div>
              {hotel.rating && (
                <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-lg">
                  <Star className="h-5 w-5 fill-secondary text-secondary" />
                  <span className="text-xl font-bold font-mono text-white">{hotel.rating}</span>
                </div>
              )}
            </div>

            <p className="text-white/80 font-rajdhani text-lg mb-6">
              {hotel.description}
            </p>

            {hotel.room_type && (
              <div className="mb-4">
                <span className="text-sm text-white/40">Room Type</span>
                <div className="text-lg text-secondary font-mono">{hotel.room_type}</div>
              </div>
            )}

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mb-6">
                <span className="text-sm text-white/40 mb-2 block">Amenities</span>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-white/70 font-rajdhani"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-primary font-mono mb-1">
                  ${hotel.price_per_night.toFixed(2)}
                </div>
                <div className="text-sm text-white/40">per night</div>
              </div>

              <div className="space-y-4 mb-6">
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

                <div>
                  <label className="text-white/80 font-rajdhani mb-2 block">Guests</label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="bg-input border-white/10"
                    >
                      -
                    </Button>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                      <Users className="h-5 w-5 text-white/60" />
                      <span className="text-2xl font-mono text-white">{guests}</span>
                    </div>
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
              </div>

              {checkIn && checkOut && calculateNights() > 0 && (
                <div className="bg-secondary/10 border border-secondary/30 rounded p-4 mb-4">
                  <div className="flex justify-between text-white/80 font-rajdhani mb-2">
                    <span>Duration:</span>
                    <span className="font-mono">{calculateNights()} night{calculateNights() > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary font-mono pt-2 border-t border-white/10">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBookNow}
                disabled={bookingLoading || !checkIn || !checkOut}
                className="w-full bg-primary hover:bg-primary/90 font-orbitron uppercase py-6 text-lg"
              >
                {bookingLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  'Book Now'
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;