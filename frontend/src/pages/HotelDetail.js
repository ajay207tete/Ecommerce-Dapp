import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';

import { Calendar } from '../components/ui/calendar';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../components/ui/popover';

import {
  MapPin,
  Star,
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

const arrow =
  'absolute top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#fcee0a] hover:text-black text-white p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00f0ff] transition';

const dateBtn =
  'w-full flex items-center h-12 px-3 bg-black border-2 border-[#262626] text-left hover:border-[#fcee0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00f0ff]';

const stepBtn =
  'h-12 w-12 shrink-0 grid place-items-center border-2 border-[#262626] text-2xl text-white hover:border-[#fcee0a]';

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
        <div className="text-2xl font-bold uppercase tracking-[0.3em] text-[#fcee0a] animate-pulse">
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
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-3 sm:px-4">

      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <button
          type="button"
          className="mb-5 text-white/60 hover:text-[#fcee0a] uppercase tracking-[0.14em] text-sm font-semibold"
          onClick={() => navigate('/services')}
        >
          ← Back to Hotels
        </button>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">

          {/* LEFT SIDE */}
          <div>

            {/* Main Image */}
            <div className="cut relative aspect-video overflow-hidden bg-[#050505] mb-3 group border-l-[3px] border-[#fcee0a]">

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
                        aria-label="Previous image"
                        className={`${arrow} left-2 md:left-4`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <button
                        onClick={nextImage}
                        aria-label="Next image"
                        className={`${arrow} right-2 md:right-4`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img src="/logo.png" alt="" className="h-1/2 opacity-25" />
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
                    aria-label={`Show image ${idx + 1}`}
                    className={`aspect-video overflow-hidden border-2 ${
                      idx === currentImageIndex
                        ? 'border-[#fcee0a]'
                        : 'border-[#262626] hover:border-white/40'
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
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight break-words">
                  {hotel.name}
                </h1>

                {/* Location */}
                {hotel.location && (
                  <div className="flex items-center gap-2 text-white/60 mt-3">

                    <MapPin className="h-4 w-4 shrink-0" />

                    <span className="text-base sm:text-lg break-words">
                      {hotel.location}
                    </span>

                  </div>
                )}

                {/* Nearby */}
                {userLocation && (
                  <div className="text-[#00f0ff] text-sm font-mono mt-2">
                    Nearby hotel detected based on your location
                  </div>
                )}

              </div>

              {/* Rating */}
              {hotel.rating && (
                <div className="flex items-center gap-2 bg-[#fcee0a]/10 border-l-2 border-[#fcee0a] px-3 py-2 shrink-0">

                  <Star className="h-4 w-4 fill-[#fcee0a] text-[#fcee0a]" />

                  <span className="text-lg sm:text-xl font-bold text-white">
                    {hotel.rating}
                  </span>

                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6">
              {hotel.description}
            </p>

            {/* Room Type */}
            {hotel.room_type && (
              <div className="mb-5">

                <span className="text-white/40 text-sm font-mono">
                  Room Type
                </span>

                <div className="text-[#00f0ff] text-2xl sm:text-3xl font-mono mt-1 break-words">
                  {hotel.room_type}
                </div>

              </div>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mb-6">

                <span className="text-white/40 text-sm font-mono block mb-3">
                  Amenities
                </span>

                <div className="flex flex-wrap gap-2">

                  {hotel.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-white/5 border-l-2 border-[#262626] text-sm text-white/70"
                    >
                      {amenity}
                    </span>
                  ))}

                </div>

              </div>
            )}

            {/* MAP BELOW AMENITIES */}
            {hotel.location && (
              <div className="mb-6 overflow-hidden border border-[#262626]">

                <iframe
                  title="Hotel Location"
                  width="100%"
                  height="140"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={
                    hotel.latitude && hotel.longitude
                      ? `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=17&output=embed`
                      : `https://www.google.com/maps?q=${encodeURIComponent(
                          hotel.location
                        )}&output=embed`
                  }
                  allowFullScreen
                  loading="lazy"
                />

              </div>
            )}

            {/* Booking Card */}
            <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-4 sm:p-6">

              {/* Price */}
              <div className="mb-6">

                <div className="text-4xl sm:text-5xl font-bold text-[#fcee0a] font-mono">
                  ₹{Number(hotel.price_per_night || 0).toFixed(2)}
                </div>

                <div className="text-white/40 mt-1 font-mono text-sm">
                  per night
                </div>

              </div>

              <div className="space-y-4">

                {/* Checkin */}
                <div>

                  <label className="text-white/70 block mb-2 uppercase tracking-wider text-sm">
                    Check-in Date
                  </label>

                  <Popover>

                    <PopoverTrigger asChild>

                      <button
                        type="button"
                        className={cn(dateBtn, !checkIn && 'text-white/40')}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />

                        {checkIn
                          ? format(checkIn, 'PPP')
                          : 'Select date'}
                      </button>

                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0 bg-[#0d0d0d] border-[#262626] rounded-none">

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

                  <label className="text-white/70 block mb-2 uppercase tracking-wider text-sm">
                    Check-out Date
                  </label>

                  <Popover>

                    <PopoverTrigger asChild>

                      <button
                        type="button"
                        className={cn(dateBtn, !checkOut && 'text-white/40')}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />

                        {checkOut
                          ? format(checkOut, 'PPP')
                          : 'Select date'}
                      </button>

                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0 bg-[#0d0d0d] border-[#262626] rounded-none">

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

                  <label className="text-white/70 block mb-3 uppercase tracking-wider text-sm">
                    Guests
                  </label>

                  <div className="flex items-center justify-between gap-4">

                    <button
                      type="button"
                      aria-label="Fewer guests"
                      onClick={() =>
                        setGuests(Math.max(1, guests - 1))
                      }
                      className={stepBtn}
                    >
                      -
                    </button>

                    <div className="flex items-center gap-2">

                      <Users className="h-5 w-5 text-white/60" />

                      <span className="text-3xl font-mono text-white">
                        {guests}
                      </span>

                    </div>

                    <button
                      type="button"
                      aria-label="More guests"
                      onClick={() =>
                        setGuests(Math.min(10, guests + 1))
                      }
                      className={stepBtn}
                    >
                      +
                    </button>

                  </div>
                </div>

                {/* Total */}
                {checkIn &&
                  checkOut &&
                  calculateNights() > 0 && (
                    <div className="bg-[#00f0ff]/10 border-l-[3px] border-[#00f0ff] p-4">

                      <div className="flex justify-between text-white/80 mb-2">
                        <span>Duration</span>

                        <span>
                          {calculateNights()} night
                          {calculateNights() > 1
                            ? 's'
                            : ''}
                        </span>
                      </div>

                      <div className="flex justify-between text-2xl font-bold text-[#fcee0a] border-t border-[#262626] pt-3">

                        <span>Total</span>

                        <span>
                          ₹{calculateTotal().toFixed(2)}
                        </span>

                      </div>

                    </div>
                  )}

                {/* Book Button */}
                <button
                  type="button"
                  onClick={handleBookNow}
                  disabled={
                    bookingLoading ||
                    !checkIn ||
                    !checkOut
                  }
                  className="cp-btn w-full inline-flex items-center justify-center !py-4 text-lg mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#fcee0a]"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;