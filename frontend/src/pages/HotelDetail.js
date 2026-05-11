import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../components/ui/popover';

import {
  MapPin,
  Star,
  Wifi,
  CalendarIcon,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchHotel();

    // Auto detect location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }, [id]);

  const fetchHotel = async () => {
    try {
      const response = await axios.get(`${API}/services/${id}`);

      setHotel(response.data);
    } catch (error) {
      console.error(error);

      toast.error('Failed to load hotel');
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;

    const diffTime = Math.abs(checkOut - checkIn);

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    return calculateNights() * (hotel?.price_per_night || 0);
  };

  const handleBookNow = async () => {
    if (!user || !token) {
      toast.error('Please login');

      navigate('/login');

      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Select dates');

      return;
    }

    const nights = calculateNights();

    if (nights < 1) {
      toast.error('Invalid dates');

      return;
    }

    setBookingLoading(true);

    try {
      const orderResponse = await axios.post(
        `${API}/orders/hotel-booking`,
        {
          hotel_id: hotel.id,
          hotel_name: hotel.name,
          check_in: checkIn.toISOString(),
          check_out: checkOut.toISOString(),
          guests,
          nights,
          room_type: hotel.room_type,
          total: calculateTotal(),
          location: hotel.location,
          hotel_image: hotel.images?.[0]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/checkout?order_id=${orderResponse.data.id}&type=hotel`);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.detail || 'Booking failed'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const nextImage = () => {
    if (hotel?.images) {
      setCurrentImageIndex(
        (prev) => (prev + 1) % hotel.images.length
      );
    }
  };

  const prevImage = () => {
    if (hotel?.images) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + hotel.images.length) %
          hotel.images.length
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl md:text-2xl font-orbitron text-primary animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-lg">
          Hotel not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-3 sm:px-4 bg-black">

      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-5 text-white/60 hover:text-white text-sm"
          onClick={() => navigate('/services')}
        >
          ← Back to Hotels
        </Button>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">

          {/* LEFT SIDE */}
          <div>

            {/* Main Image */}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted mb-3 group border border-white/10">

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
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Wifi className="h-16 w-16 text-white/20" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {hotel.images && hotel.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">

                {hotel.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-video overflow-hidden rounded-lg border ${
                      idx === currentImageIndex
                        ? 'border-primary'
                        : 'border-white/10'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Hotel ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div>

            {/* Top */}
            <div className="flex items-start justify-between gap-3 mb-4">

              <div className="flex-1 min-w-0">

                {/* Hotel Name */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-orbitron text-white leading-tight break-words">
                  {hotel.name}
                </h1>

                {/* Location */}
                {hotel.location && (
                  <div className="flex items-center gap-2 text-white/60 mt-3">

                    <MapPin className="h-4 w-4 shrink-0" />

                    <span className="font-rajdhani text-base sm:text-lg break-words">
                      {hotel.location}
                    </span>

                  </div>
                )}

                {/* Nearby */}
                {userLocation && (
                  <div className="text-primary text-sm mt-2">
                    Nearby hotel detected based on your location
                  </div>
                )}

              </div>

              {/* Rating */}
              {hotel.rating && (
                <div className="flex items-center gap-2 bg-secondary/20 px-3 py-2 rounded-xl shrink-0">

                  <Star className="h-4 w-4 fill-secondary text-secondary" />

                  <span className="text-lg sm:text-xl font-bold text-white">
                    {hotel.rating}
                  </span>

                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-white/80 text-base sm:text-lg leading-relaxed font-rajdhani mb-6">
              {hotel.description}
            </p>

            {/* Room Type */}
            {hotel.room_type && (
              <div className="mb-5">

                <span className="text-white/40 text-sm">
                  Room Type
                </span>

                <div className="text-primary text-2xl sm:text-3xl font-mono mt-1 break-words">
                  {hotel.room_type}
                </div>

              </div>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mb-6">

                <span className="text-white/40 text-sm block mb-3">
                  Amenities
                </span>

                <div className="flex flex-wrap gap-2">

                  {hotel.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70"
                    >
                      {amenity}
                    </span>
                  ))}

                </div>

              </div>
            )}

            {/* MAP BELOW AMENITIES */}
            {hotel.location && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">

                <iframe
                  title="Hotel Location"
                  width="100%"
                  height="260"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    hotel.location
                  )}&output=embed`}
                  allowFullScreen
                  loading="lazy"
                />

              </div>
            )}

            {/* Booking Card */}
            <Card className="bg-[#0F0F1C]/90 border border-white/10 backdrop-blur-md p-4 sm:p-6 rounded-2xl">

              {/* Price */}
              <div className="mb-6">

                <div className="text-4xl sm:text-5xl font-bold text-primary font-mono">
                  ₹{hotel.price_per_night.toFixed(2)}
                </div>

                <div className="text-white/40 mt-1">
                  per night
                </div>

              </div>

              <div className="space-y-4">

                {/* Checkin */}
                <div>

                  <label className="text-white/80 block mb-2">
                    Check-in Date
                  </label>

                  <Popover>

                    <PopoverTrigger asChild>

                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start bg-input border-white/10 text-left h-12',
                          !checkIn && 'text-white/40'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />

                        {checkIn
                          ? format(checkIn, 'PPP')
                          : 'Select date'}
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

                {/* Checkout */}
                <div>

                  <label className="text-white/80 block mb-2">
                    Check-out Date
                  </label>

                  <Popover>

                    <PopoverTrigger asChild>

                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start bg-input border-white/10 text-left h-12',
                          !checkOut && 'text-white/40'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />

                        {checkOut
                          ? format(checkOut, 'PPP')
                          : 'Select date'}
                      </Button>

                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0 bg-[#0F0F1C] border-white/10">

                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) =>
                          date < (checkIn || new Date())
                        }
                        initialFocus
                      />

                    </PopoverContent>

                  </Popover>
                </div>

                {/* Guests */}
                <div>

                  <label className="text-white/80 block mb-3">
                    Guests
                  </label>

                  <div className="flex items-center justify-between gap-4">

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setGuests(Math.max(1, guests - 1))
                      }
                      className="bg-input border-white/10 h-12 w-12 shrink-0"
                    >
                      -
                    </Button>

                    <div className="flex items-center gap-2">

                      <Users className="h-5 w-5 text-white/60" />

                      <span className="text-3xl font-mono text-white">
                        {guests}
                      </span>

                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setGuests(Math.min(10, guests + 1))
                      }
                      className="bg-input border-white/10 h-12 w-12 shrink-0"
                    >
                      +
                    </Button>

                  </div>
                </div>

                {/* Total */}
                {checkIn &&
                  checkOut &&
                  calculateNights() > 0 && (
                    <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">

                      <div className="flex justify-between text-white/80 mb-2">
                        <span>Duration</span>

                        <span>
                          {calculateNights()} night
                          {calculateNights() > 1
                            ? 's'
                            : ''}
                        </span>
                      </div>

                      <div className="flex justify-between text-2xl font-bold text-primary border-t border-white/10 pt-3">

                        <span>Total</span>

                        <span>
                          ₹{calculateTotal().toFixed(2)}
                        </span>

                      </div>

                    </div>
                  )}

                {/* Book Button */}
                <Button
                  onClick={handleBookNow}
                  disabled={
                    bookingLoading ||
                    !checkIn ||
                    !checkOut
                  }
                  className="w-full bg-primary hover:bg-primary/90 h-14 text-lg font-bold uppercase mt-2"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Book Now'
                  )}
                </Button>

              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;