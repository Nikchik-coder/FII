import { useState } from 'react';
import { Copy, X, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CryptoOption {
  coin: string;
  network: string;
  address: string;
}

const cryptoAddresses: CryptoOption[] = [
  { coin: 'USDT (BEP-20)', network: 'BSC', address: '0xefd4739afd0344f120bcffa607bbf94c164196d5' },
  { coin: 'USDT (ERC-20)', network: 'ETH', address: '0xefd4739afd0344f120bcffa607bbf94c164196d5' },
  { coin: 'USDT (TRC-20)', network: 'TRX', address: 'TCvGJYS6Dy1dHJ7oT8zTWLYMNEdfNjsUpG' },
  { coin: 'USDT (Solana)', network: 'SOL', address: 'AMk6zpPBtotpFvxSRmjdivkBeagwY1HCtUVxuSfvrzS9' },
];

export default function Support({ id }: { id: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied!'); // Can be replaced with a toast later
  };

  return (
    <section id={id} className="py-24 px-6 w-full bg-slate-950">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">Fund the next wave of interstellar exploration</h2>
          <div className="h-1 w-24 bg-slate-700 mx-auto rounded mb-6"></div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Fund the next video lecture and research paper by donating crypto.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl transition-all duration-300 font-bold text-lg shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-1 font-orbitron"
        >
          <Wallet size={24} />
          Donate USDT
        </button>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Modal Content */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <h3 className="text-2xl font-orbitron font-bold mb-8 text-center text-white">Select Network</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cryptoAddresses.map((crypto) => (
                  <div key={crypto.coin} className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center hover:border-slate-600 transition-colors">
                    <h4 className="text-lg font-bold mb-4 font-orbitron text-slate-200">{crypto.coin}</h4>
                    
                    <div className="bg-white p-2 rounded-xl mb-4 shadow-lg">
                       <QRCodeSVG value={crypto.address} size={120} level="H" />
                    </div>

                    <p className="text-[10px] sm:text-xs text-slate-400 mb-4 font-mono break-all w-full bg-black/50 p-2 rounded-lg border border-slate-800">
                      {crypto.address}
                    </p>
                    
                    <button 
                      onClick={() => copyToClipboard(crypto.address)}
                      className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors w-full font-medium"
                    >
                      <Copy size={16} />
                      Copy Address
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
