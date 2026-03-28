import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, Smartphone, Chrome } from 'lucide-react';

const WalletConnectionHelp = () => {
  return (
    <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-yellow-500/30 p-6 max-w-2xl mx-auto my-4">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-orbitron text-white mb-3">
            Having Trouble Connecting Your Wallet?
          </h3>
          
          <div className="space-y-4 text-white/80 font-rajdhani">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-secondary" />
                <strong className="text-white">Option 1: Use Mobile Wallet (Recommended)</strong>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-7">
                <li>Open Tonkeeper or MyTonWallet app on your phone</li>
                <li>Click "Connect Wallet" button above</li>
                <li>Scan the QR code with your wallet app</li>
                <li>Approve the connection</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Chrome className="h-5 w-5 text-secondary" />
                <strong className="text-white">Option 2: Browser Extension</strong>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-7">
                <li>Install Tonkeeper or MyTonWallet browser extension</li>
                <li>Click "Connect Wallet" button</li>
                <li>Select your wallet from the list</li>
                <li>Approve in the extension popup</li>
              </ol>
            </div>

            <div className="bg-secondary/10 border border-secondary/30 rounded p-3 mt-4">
              <p className="text-xs text-secondary">
                💡 <strong>Note:</strong> If the connection modal shows "Failed to load", this is normal for 
                localhost development. Use one of the methods above - they work perfectly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WalletConnectionHelp;
