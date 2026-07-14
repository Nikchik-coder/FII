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
    alert('Address copied!');
  };

  return (
    <section id={id} className="py-24 px-6 w-full border-t border-white/10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-center mb-12">
          <span className="part-label block mb-4">04 — Support</span>
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4 text-white">Fund the next wave of interstellar exploration</h2>
          <div className="sep mb-6" />

          <div className="bg-white/[0.03] border border-white/10 rounded-md p-8 mb-10 text-left">
            <h3 className="text-xl font-orbitron font-bold mb-3 text-[#e8e4df]">Why do we need your support?</h3>
            <p className="text-[#e8e4df]/70 leading-relaxed">
              We are running complex numerical relativity research on GPU supercomputers using the open-source{' '}
              <a
                href="https://grtlcollaboration.github.io/GRTeclyn/building_gpus/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-4 hover:text-[#e8e4df] transition-colors"
              >
                GRTeclyn code base
              </a>. 
              These high-performance computing resources are incredibly expensive. Your crypto donations directly fund the computational time required to simulate warp drives, wormhole dynamics, and publish our findings.
            </p>
          </div>

          <p className="text-[#e8e4df]/60 max-w-2xl mx-auto mb-8">
            Fund the next video lecture and research paper by donating crypto.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-[#e8e4df] px-8 py-4 rounded-md transition-all duration-300 font-bold text-lg font-orbitron"
        >
          <Wallet size={24} />
          Donate USDT
        </button>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Modal Content */}
          <div className="bg-[#222] border border-white/10 rounded-md w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <h3 className="text-2xl font-orbitron font-bold mb-8 text-center text-white">Select Network</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cryptoAddresses.map((crypto) => (
                  <div key={crypto.coin} className="bg-[#1a1a1a] p-6 rounded-md border border-white/10 flex flex-col items-center hover:border-white/30 transition-colors">
                    <h4 className="text-lg font-bold mb-4 font-orbitron text-[#e8e4df]">{crypto.coin}</h4>

                    <div className="bg-white p-2 rounded-md mb-4 shadow-lg">
                       <QRCodeSVG value={crypto.address} size={120} level="H" />
                    </div>

                    <p className="text-[10px] sm:text-xs text-[#888] mb-4 font-mono break-all w-full bg-black/50 p-2 rounded-md border border-white/10">
                      {crypto.address}
                    </p>

                    <button
                      onClick={() => copyToClipboard(crypto.address)}
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-[#e8e4df] px-4 py-2 rounded-md transition-colors w-full font-medium"
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
