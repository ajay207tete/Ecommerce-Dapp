import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
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
        <div className="text-2xl font-bold uppercase tracking-[0.3em] text-[#fcee0a] animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4" data-testid="nft-gallery-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <p className="font-mono text-sm text-[#00f0ff] mb-2">Your digital collectibles</p>
          <h1 className="text-5xl md:text-7xl font-bold uppercase mb-3 text-white">
            My <span className="text-[#fcee0a]">NFTs</span>
          </h1>
          <p className="text-lg text-white/60">Your exclusive digital collectibles</p>
          {walletAddress && (
            <p className="text-sm text-[#00f0ff] font-mono mt-2">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          )}
        </div>

        {!walletAddress ? (
          <div className="border-2 border-dashed border-[#262626] p-12 text-center">
            <Image className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-2xl text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/60">Please connect your TON wallet to view your NFTs</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="border-2 border-dashed border-[#262626] p-12 text-center">
            <Image className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-2xl text-white mb-2">No NFTs Yet</h3>
            <p className="text-white/60">Complete purchases to earn exclusive NFTs</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map((nft) => {
              const isHotel = nft.nft_type === 'hotel_booking';
              return (
                <div
                  key={nft.id}
                  className="cut bg-[#0d0d0d] border-l-[3px] overflow-hidden group transition-colors hover:bg-[#141414]"
                  style={{ borderLeftColor: isHotel ? '#00f0ff' : '#fcee0a' }}
                  data-testid={`nft-${nft.id}`}
                >
                  <div className="aspect-square overflow-hidden bg-[#050505] relative">
                    {nft.metadata?.image ? (
                      <img
                        src={nft.metadata.image}
                        alt={nft.metadata.name || 'NFT'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img src="/logo.png" alt="" className="w-1/2 opacity-25" />
                      </div>
                    )}

                    {/* NFT Type Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs px-3 py-1 font-mono font-bold ${
                          isHotel ? 'bg-[#00f0ff] text-black' : 'bg-[#fcee0a] text-black'
                        }`}
                      >
                        {isHotel ? 'HOTEL' : 'PRODUCT'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1 break-words">
                      {nft.metadata?.name || 'Unnamed NFT'}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-2 mb-3">
                      {nft.metadata?.description || 'No description'}
                    </p>

                    {/* Show booking details for hotel NFTs */}
                    {isHotel && nft.booking_details && (
                      <div className="space-y-2 mb-3 p-3 bg-black border-l-2 border-[#00f0ff]">
                        {nft.booking_details.hotel_name && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-white/40 font-mono w-20 shrink-0">Hotel:</span>
                            <span className="text-xs text-[#00f0ff] flex-1 break-words">{nft.booking_details.hotel_name}</span>
                          </div>
                        )}
                        {nft.booking_details.check_in && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-white/40 font-mono w-20 shrink-0">Check-in:</span>
                            <span className="text-xs text-white font-mono flex-1">
                              {new Date(nft.booking_details.check_in).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {nft.booking_details.check_out && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-white/40 font-mono w-20 shrink-0">Check-out:</span>
                            <span className="text-xs text-white font-mono flex-1">
                              {new Date(nft.booking_details.check_out).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {nft.booking_details.nights && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-white/40 font-mono w-20 shrink-0">Duration:</span>
                            <span className="text-xs text-[#fcee0a] font-mono flex-1">
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
                          <div key={idx} className="flex justify-between gap-3 text-xs">
                            <span className="text-white/40 font-mono">{attr.trait_type}:</span>
                            <span className="text-white/80 text-right break-words">
                              {typeof attr.value === 'string' && attr.value.length > 20
                                ? `${attr.value.substring(0, 20)}...`
                                : attr.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-[#262626]">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#00f0ff] font-mono">
                          {nft.status === 'minted' ? 'Minted' : 'Pending'}
                        </div>
                        {nft.minted_at && (
                          <div className="text-xs text-white/40 font-mono">
                            {new Date(nft.minted_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;