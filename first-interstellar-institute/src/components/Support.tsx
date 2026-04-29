import { Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CryptoOption {
  coin: string;
  network: string;
  address: string;
}

const cryptoAddresses: CryptoOption[] = [
  { coin: 'Ethereum / ERC-20', network: 'ETH', address: '0xYourEthAddressHere...' },
  { coin: 'Bitcoin', network: 'BTC', address: 'bc1YourBtcAddressHere...' },
];

export default function Support({ id }: { id: string }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied!'); // Can be replaced with a toast later
  };

  return (
    <section id={id} className="py-24 px-6 max-w-4xl mx-auto text-center bg-slate-950">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">Support the Mission</h2>
        <div className="h-1 w-24 bg-slate-700 mx-auto rounded mb-6"></div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Fund the next video lecture and research paper by donating crypto.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cryptoAddresses.map((crypto) => (
          <div key={crypto.coin} className="bg-slate-900 p-8 rounded-xl border border-slate-800 flex flex-col items-center hover:border-slate-600 transition-colors">
            <h3 className="text-xl font-bold mb-6 font-orbitron">{crypto.coin}</h3>
            
            <div className="bg-white p-3 rounded-xl mb-6 shadow-lg">
               <QRCodeSVG value={crypto.address} size={160} level="H" />
            </div>

            <p className="text-xs text-slate-400 mb-6 font-mono break-all w-full bg-black/50 p-3 rounded-lg border border-slate-800">
              {crypto.address}
            </p>
            
            <button 
              onClick={() => copyToClipboard(crypto.address)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors w-full font-medium shadow-md shadow-blue-900/20"
            >
              <Copy size={18} />
              Copy Address
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
