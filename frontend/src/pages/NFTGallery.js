import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Image } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NFTGallery = () => {
  const { user, token, walletAddress } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    fetchNFTs();
  }, [user, token, navigate]);

  const fetchNFTs = async () => {
    try {
      const response = await axios.get(`${API}/nfts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNfts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
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
    <div className="min-h-screen py-12 px-4" data-testid="nft-gallery-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold font-orbitron uppercase mb-4 text-white">My NFTs</h1>
          <p className="text-lg text-white/60 font-rajdhani">Your exclusive digital collectibles</p>
          {walletAddress && (
            <p className="text-sm text-secondary font-mono mt-2">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          )}
        </div>

        {!walletAddress ? (
          <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-12 text-center">
            <Image className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-2xl font-orbitron text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/60 font-rajdhani">Please connect your TON wallet to view your NFTs</p>
          </Card>
        ) : nfts.length === 0 ? (
          <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-12 text-center">
            <Image className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-2xl font-orbitron text-white mb-2">No NFTs Yet</h3>
            <p className="text-white/60 font-rajdhani">Complete purchases to earn exclusive NFTs</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <Card
                key={nft.id}
                className="bg-gradient-to-b from-[#1A1A2E] to-[#030014] border-primary/20 hover:border-primary/50 transition-all overflow-hidden group"
                data-testid={`nft-${nft.id}`}
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {nft.metadata?.image ? (
                    <img
                      src={nft.metadata.image}
                      alt={nft.metadata.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30">
                      <Image className="h-20 w-20 text-white/20" />
                    </div>
                  )}
                  
                  {/* NFT Type Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-mono ${
                      nft.nft_type === 'hotel_booking' 
                        ? 'bg-secondary text-black' 
                        : 'bg-primary text-white'
                    }`}>
                      {nft.nft_type === 'hotel_booking' ? 'HOTEL' : 'PRODUCT'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-orbitron font-bold text-white mb-1">
                    {nft.metadata?.name || 'Unnamed NFT'}
                  </h3>
                  <p className="text-sm text-white/60 font-rajdhani line-clamp-2 mb-3">
                    {nft.metadata?.description || 'No description'}
                  </p>
                  
                  {/* Show booking details for hotel NFTs */}
                  {nft.nft_type === 'hotel_booking' && nft.booking_details && (
                    <div className="space-y-2 mb-3 p-3 bg-secondary/10 rounded border border-secondary/20">
                      {nft.booking_details.hotel_name && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-white/40 font-mono w-20">Hotel:</span>
                          <span className="text-xs text-secondary font-rajdhani flex-1">{nft.booking_details.hotel_name}</span>
                        </div>
                      )}
                      {nft.booking_details.check_in && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-white/40 font-mono w-20">Check-in:</span>
                          <span className="text-xs text-white font-mono flex-1">
                            {new Date(nft.booking_details.check_in).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {nft.booking_details.check_out && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-white/40 font-mono w-20">Check-out:</span>
                          <span className="text-xs text-white font-mono flex-1">
                            {new Date(nft.booking_details.check_out).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {nft.booking_details.nights && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-white/40 font-mono w-20">Duration:</span>
                          <span className="text-xs text-primary font-mono flex-1">
                            {nft.booking_details.nights} night{nft.booking_details.nights > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Show key attributes */}
                  {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {nft.metadata.attributes.slice(0, 3).map((attr, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-white/40 font-mono">{attr.trait_type}:</span>
                          <span className="text-white/80 font-rajdhani">
                            {typeof attr.value === 'string' && attr.value.length > 20
                              ? `${attr.value.substring(0, 20)}...`
                              : attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-secondary font-mono">
                        {nft.status === 'minted' ? '✓ Minted' : 'Pending'}
                      </div>
                      {nft.minted_at && (
                        <div className="text-xs text-white/40 font-mono">
                          {new Date(nft.minted_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
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

export default NFTGallery;