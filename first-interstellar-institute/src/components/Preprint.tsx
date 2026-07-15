import { BookOpen, ExternalLink, Smartphone } from 'lucide-react';

const PREPRINT_URL = 'https://preprint.academy/';
const APP_URL = 'https://www.rustore.ru/catalog/app/com.preprint.mobile';

export default function Preprint({ id }: { id: string }) {
  return (
    <section id={id} className="py-16 md:py-24 px-6 border-y border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="part-label block mb-4">04 — Advancing Access to Science</span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-white">PREPRINT</h2>
          <div className="sep mb-6" />
          <p className="text-[#e8e4df]/60 max-w-2xl mx-auto">
            A cleaner, faster way to discover research papers from arXiv across multiple scientific fields —
            built to make browsing, reading, saving, and discussing papers feel easier on desktop and mobile.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12 text-[#e8e4df]/80 leading-relaxed space-y-4">
          <p>
            PREPRINT is a research discovery interface built around the public arXiv ecosystem. It helps
            researchers, students, and curious readers explore fresh papers without the heavier feel of a
            traditional archive interface.
          </p>
          <p>
            Browse by category, search by title or keywords, open abstracts, jump to arXiv, and save papers
            to your personal Library.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <a
            href={PREPRINT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white/[0.03] border border-white/10 rounded-md p-8 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-white/60 p-3 rounded-md bg-white/5">
                <BookOpen size={24} />
              </div>
              <ExternalLink size={20} className="text-[#888] group-hover:text-[#e8e4df] transition-colors" />
            </div>
            <h3 className="text-xl font-bold font-serif font-semibold mb-3 group-hover:text-white transition-colors text-[#e8e4df]">
              Open PREPRINT
            </h3>
            <p className="text-sm text-[#e8e4df]/60 mb-4">
              Discover papers on the web at preprint.academy
            </p>
            <span className="text-xs text-[#888] font-mono">preprint.academy</span>
          </a>

          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white/[0.03] border border-white/10 rounded-md p-8 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-white/60 p-3 rounded-md bg-white/5">
                <Smartphone size={24} />
              </div>
              <ExternalLink size={20} className="text-[#888] group-hover:text-[#e8e4df] transition-colors" />
            </div>
            <h3 className="text-xl font-bold font-serif font-semibold mb-3 group-hover:text-white transition-colors text-[#e8e4df]">
              Mobile App
            </h3>
            <p className="text-sm text-[#e8e4df]/60 mb-4">
              Find and read arXiv papers in a convenient mobile format
            </p>
            <span className="text-xs text-[#888] font-mono">RuStore · com.preprint.mobile</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6 text-[#e8e4df]">How to use the website</h3>
            <ol className="space-y-4 text-[#e8e4df]/70">
              <li>
                <span className="text-white font-medium">1. Browse or search.</span> Use the Home feed,
                category filters, or the Search page to find papers relevant to your interests.
              </li>
              <li>
                <span className="text-white font-medium">2. Open the abstract.</span> Tap or click Abstract
                to read the summary quickly before deciding whether to go deeper.
              </li>
              <li>
                <span className="text-white font-medium">3. Save what matters.</span> Log in with Google if
                you want to like papers and keep them in your Library for later reading.
              </li>
              <li>
                <span className="text-white font-medium">4. Continue on arXiv.</span> Use the arXiv or PDF
                links whenever you want the original paper page or full document.
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-serif font-semibold mb-6 text-[#e8e4df]">What&apos;s in the app</h3>
            <ul className="space-y-3 text-[#e8e4df]/70">
              <li>
                <span className="text-white font-medium">arXiv feed:</span> fresh, random, and top papers
              </li>
              <li>
                <span className="text-white font-medium">Filters</span> by section and specific topics
              </li>
              <li>
                <span className="text-white font-medium">Search</span> by title, authors, and abstract
              </li>
              <li>
                <span className="text-white font-medium">Paper page:</span> abstract, categories, PDF, and
                &quot;Read on website&quot;
              </li>
              <li>
                <span className="text-white font-medium">Likes &amp; Library</span> synced via Google and
                preprint.academy
              </li>
              <li>
                <span className="text-white font-medium">Offline mode:</span> previously opened papers stay
                available without internet
              </li>
            </ul>
            <p className="mt-6 text-sm text-[#888]">
              Google sign-in is required for likes and sync. Offline mode only shows saved data.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto border border-white/10 rounded-md p-6 bg-white/[0.02]">
          <h4 className="font-serif font-semibold text-[#e8e4df] mb-2">Important to know</h4>
          <p className="text-sm text-[#e8e4df]/60 leading-relaxed">
            PREPRINT is for discovery and discussion, not direct paper submission. You cannot publish papers
            directly on PREPRINT. To publish research, submit it to arXiv first. After it appears on arXiv, it
            can show up here for browsing and discussion.
          </p>
        </div>
      </div>
    </section>
  );
}
