import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
    <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-6">
      <h3 className="text-xl font-orbitron text-white mb-4">Wallet Connection Status</h3>
      
      {walletAddress ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <div className="text-green-500 font-mono text-sm">Connected</div>
              <div className="text-white/80 font-mono text-xs">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </div>
            </div>
          </div>
          <Button 
            onClick={handleDisconnect}
            variant="outline"
            className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <div>
              <div className="text-yellow-500 font-rajdhani">Not Connected</div>
              <div className="text-white/60 text-xs font-rajdhani">
                Connect your TON wallet to proceed
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleConnect}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Connect Wallet
          </Button>

          <div className="text-xs text-white/40 font-rajdhani space-y-1">
            <p>✓ Make sure you're using the deployed URL (not localhost)</p>
            <p>✓ Use mobile wallet QR scan or browser extension</p>
            <p>✓ Check if you have Tonkeeper or MyTonWallet installed</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default WalletConnectionTest;
