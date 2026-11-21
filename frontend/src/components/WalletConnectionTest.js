import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { CheckCircle, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

const tips = [
  "Make sure you're using the deployed URL (not localhost)",
  'Use mobile wallet QR scan or browser extension',
  'Check if you have Tonkeeper or MyTonWallet installed',
];

const WalletConnectionTest = () => {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();

  const handleConnect = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to open wallet modal');
    }
  };

  const handleDisconnect = async () => {
    try {
      await tonConnectUI.disconnect();
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  return (
    <div
      className="cut bg-[#0d0d0d] border-l-[3px] p-6"
      style={{ borderLeftColor: walletAddress ? '#00f0ff' : '#fcee0a' }}
    >
      <h3 className="text-xl text-white mb-4">Wallet Connection Status</h3>

      {walletAddress ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-[#00f0ff]/10 border-l-2 border-[#00f0ff]">
            <CheckCircle className="h-6 w-6 text-[#00f0ff]" />
            <div>
              <div className="text-[#00f0ff] font-mono text-sm">Connected</div>
              <div className="text-white/80 font-mono text-xs">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            className="w-full h-12 border-2 border-[#ff003c] text-[#ff003c] uppercase tracking-[0.14em] font-bold hover:bg-[#ff003c] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00f0ff]"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-[#fcee0a]/10 border-l-2 border-[#fcee0a]">
            <AlertCircle className="h-6 w-6 text-[#fcee0a]" />
            <div>
              <div className="text-[#fcee0a]">Not Connected</div>
              <div className="text-white/60 text-xs">
                Connect your TON wallet to proceed
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnect}
            className="cp-btn w-full text-center !py-4"
          >
            Connect Wallet
          </button>

          <ul className="text-xs text-white/50 space-y-1">
            {tips.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-[#00f0ff] mt-0.5 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WalletConnectionTest;