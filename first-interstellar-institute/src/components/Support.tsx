import { Copy, ExternalLink, Wallet } from 'lucide-react';

interface CryptoOption {
  coin: string;
  network: string;
  address: string;
  explorerUrl: string;
}

const cryptoAddresses: CryptoOption[] = [
  {
    coin: 'USDT (BEP-20)',
    network: 'BSC',
    address: '0xefd4739afd0344f120bcffa607bbf94c164196d5',
    explorerUrl: 'https://bscscan.com/address/0xefd4739afd0344f120bcffa607bbf94c164196d5',
  },
  {
    coin: 'USDT (ERC-20)',
    network: 'ETH',
    address: '0xefd4739afd0344f120bcffa607bbf94c164196d5',
    explorerUrl: 'https://etherscan.io/address/0xefd4739afd0344f120bcffa607bbf94c164196d5',
  },
  {
    coin: 'USDT (TRC-20)',
    network: 'TRX',
    address: 'TCvGJYS6Dy1dHJ7oT8zTWLYMNEdfNjsUpG',
    explorerUrl: 'https://tronscan.org/#/address/TCvGJYS6Dy1dHJ7oT8zTWLYMNEdfNjsUpG',
  },
  {
    coin: 'USDT (Solana)',
    network: 'SOL',
    address: 'AMk6zpPBtotpFvxSRmjdivkBeagwY1HCtUVxuSfvrzS9',
    explorerUrl: 'https://solscan.io/account/AMk6zpPBtotpFvxSRmjdivkBeagwY1HCtUVxuSfvrzS9',
  },
];

export default function Support({ id }: { id: string }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied!');
  };

  return (
    <section id={id} className="py-16 md:py-24 px-6 w-full border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="part-label block mb-4">05 — Support</span>
          <h2 className="text-2xl md:text-4xl font-orbitron font-bold mb-4 text-white">
            Fund the next wave of interstellar exploration
          </h2>
          <div className="sep mb-6" />

          <div className="bg-white/[0.03] border border-white/10 rounded-md p-5 md:p-8 mb-10 text-left max-w-4xl mx-auto">
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
              </a>
              . These high-performance computing resources are incredibly expensive. Your crypto donations
              directly fund the computational time required to simulate warp drives, wormhole dynamics, and
              publish our findings.
            </p>
          </div>

          <p className="text-[#e8e4df]/60 max-w-2xl mx-auto mb-10">
            Fund the next video lecture and research paper by donating USDT on any of these networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cryptoAddresses.map((crypto) => (
            <div
              key={crypto.coin}
              className="bg-white/[0.03] border border-white/10 rounded-md p-8 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-white/60 p-3 rounded-md bg-white/5">
                  <Wallet size={24} />
                </div>
                <a
                  href={crypto.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#888] hover:text-[#e8e4df] transition-colors"
                  aria-label={`View ${crypto.coin} address on explorer`}
                >
                  <ExternalLink size={20} />
                </a>
              </div>

              <h3 className="text-xl font-bold font-orbitron mb-3 text-[#e8e4df]">{crypto.coin}</h3>

              <p className="text-xs text-[#888] font-mono break-all mb-6 bg-black/40 border border-white/10 rounded-md p-3">
                {crypto.address}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => copyToClipboard(crypto.address)}
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-[#e8e4df] px-4 py-2 rounded-md transition-colors font-medium"
                >
                  <Copy size={16} />
                  Copy Address
                </button>
                <a
                  href={crypto.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/40 hover:bg-white/5 text-[#e8e4df] px-4 py-2 rounded-md transition-all font-medium"
                >
                  Open Explorer
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
