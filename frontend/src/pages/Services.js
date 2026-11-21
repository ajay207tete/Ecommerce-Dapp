import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Card } from '../components/ui/card';

import {
  MapPin,
  Star,
  Bed,
  Search,
  Navigation
} from 'lucide-react';

import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const accents = ['#fcee0a', '#00f0ff', '#ff003c'];

const Services = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  // User Location
  const [userLocation, setUserLocation] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();

    // Auto detect user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location permission denied:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    filterHotels();
  }, [searchQuery, hotels, userLocation]);

  const fetchHotels = async () => {
    try {
      const response = await axios.get(`${API}/services`);

      setHotels(response.data);
      setFilteredHotels(response.data);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  // Distance Calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat2 || !lon2) return 9999;

    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;

    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // Filter + Nearby Sort
  const filterHotels = () => {
    let updatedHotels = [...hotels];

    // Search Filter
    if (searchQuery.trim()) {
      updatedHotels = updatedHotels.filter((hotel) =>
        hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Sort nearby hotels
    if (userLocation) {
      updatedHotels.sort((a, b) => {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.latitude,
          a.longitude
        );

        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.latitude,
          b.longitude
        );

        return distA - distB;
      });
    }

    setFilteredHotels(updatedHotels);
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

  return (
    <div
      className="min-h-screen pt-24 md:pt-32 pb-12 px-4"
      data-testid="services-page"
    >
      <div className="container mx-auto">

        {/* Header */}
        <div className="mb-12">

          <p className="font-mono text-sm text-[#00f0ff] mb-2">Hotels on THRUSTER</p>

          <h1 className="text-5xl md:text-7xl font-bold uppercase mb-3 text-white">
            Bo<span className="text-[#fcee0a]">ok</span>
          </h1>

          <p className="text-lg text-white/60 mb-6">
            Book your next stay with crypto. Earn NFTs.
          </p>

          {/* Search Bar */}
          <div className="flex gap-3 w-full">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />

              <input
                type="text"
                placeholder="Search hotels by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-black border-2 border-[#262626] rounded-none pl-12 pr-4 text-white outline-none focus:border-[#fcee0a]"
              />
            </div>

            <button type="button" className="cp-btn min-w-[120px]">
              Search
            </button>

          </div>

          {/* Nearby Badge */}
          {userLocation && (
            <div className="flex items-center gap-2 mt-4 text-[#00f0ff] text-sm font-mono">
              <Navigation className="h-4 w-4" />
              Showing nearby hotels based on your location
            </div>
          )}

        </div>

        {/* Empty */}
        {filteredHotels.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#262626]">

            <Bed className="h-16 w-16 mx-auto mb-4 text-white/30" />

            <h3 className="text-2xl text-white/60 mb-2">
              No hotels found
            </h3>

            <p className="text-white/40">
              Try another location or search term
            </p>

          </div>
        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredHotels?.map((hotel, i) => {

              const distance =
                userLocation &&
                hotel.latitude &&
                hotel.longitude
                  ? calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      hotel.latitude,
                      hotel.longitude
                    ).toFixed(1)
                  : null;

              return (
                <Card
                  key={hotel.id}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/hotels/${hotel.id}`)}
                  className="cut group relative overflow-hidden rounded-none border-0 border-l-[3px] bg-[#0d0d0d] text-white transition-colors hover:bg-[#141414] cursor-pointer"
                  style={{ borderLeftColor: accents[i % 3] }}
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                  data-testid={`hotel-card-${hotel.id}`}
                >

                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-[#050505]">

                    {hotel.images && hotel.images[0] ? (
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bed className="h-16 w-16 text-white/20" />
                      </div>
                    )}

                  </div>

                  {/* Content */}
                  <div className="p-6">

                    <div className="flex items-start justify-between mb-2 gap-3">

                      <h3 className="text-xl font-bold text-white">
                        {hotel.name}
                      </h3>

                      {hotel.rating && (
                        <div className="flex items-center gap-1 text-[#fcee0a] shrink-0">

                          <Star className="h-4 w-4 fill-current" />

                          <span className="text-sm font-mono">
                            {hotel.rating}
                          </span>

                        </div>
                      )}

                    </div>

                    {/* Location */}
                    {hotel.location && (
                      <div className="flex items-center gap-2 text-white/60 text-sm mb-3">

                        <MapPin className="h-4 w-4" />

                        <span>
                          {hotel.location}
                        </span>

                      </div>
                    )}

                    {/* Distance */}
                    {distance && (
                      <div className="flex items-center gap-1 text-[#00f0ff] text-sm font-mono mb-3">
                        <Navigation className="h-4 w-4" />
                        {distance} km away
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-white/60 mb-3 line-clamp-2">
                      {hotel.description}
                    </p>

                    {/* Room Type */}
                    {hotel.room_type && (
                      <div className="text-sm text-[#00f0ff] font-mono mb-3">
                        {hotel.room_type}
                      </div>
                    )}

                    {/* Amenities */}
                    {hotel.amenities &&
                      hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">

                          {hotel.amenities
                            .slice(0, 4)
                            .map((amenity, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-white/5 border-l-2 border-[#262626] text-white/70"
                              >
                                {amenity}
                              </span>
                            ))}

                        </div>
                      )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#262626]">

                      <div>

                        <div className="text-2xl font-bold text-[#fcee0a] font-mono">
                          ₹{Number(hotel.price_per_night || 0).toFixed(2)}
                        </div>

                        <div className="text-xs text-white/40 font-mono">
                          per night
                        </div>

                        {hotel.available_rooms && (
                          <div className="text-xs text-[#00f0ff] font-mono mt-1">
                            {hotel.available_rooms} rooms available
                          </div>
                        )}

                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hotels/${hotel.id}`);
                        }}
                        className="cp-btn !py-2 !px-4 text-sm"
                        data-testid={`view-hotel-${hotel.id}`}
                      >
                        View Details
                      </button>

                    </div>

                  </div>
                </Card>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

export default Services;