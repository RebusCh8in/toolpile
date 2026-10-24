import Link from "next/link";

export interface AffiliateOffer {
  name: string;
  description: string;
  cta: string;
  href: string;
  icon?: string;
}

interface AffiliateCTAProps {
  headline: string;
  subtext?: string;
  offers: AffiliateOffer[];
}

export default function AffiliateCTA({ headline, subtext, offers }: AffiliateCTAProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 my-6">
      <p className="text-sm font-semibold text-zinc-200 mb-1">{headline}</p>
      {subtext && <p className="text-xs text-zinc-500 mb-3">{subtext}</p>}
      <div className={`grid gap-3 ${offers.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {offers.map((o) => (
          <a
            key={o.name}
            href={o.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="flex items-start gap-3 bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 hover:border-blue-500/50 hover:bg-zinc-800 transition-all group"
          >
            {o.icon && <span className="text-lg mt-0.5 shrink-0">{o.icon}</span>}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">{o.name}</span>
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{o.description}</p>
              <span className="text-xs text-blue-400 mt-1 inline-block">{o.cta} &rarr;</span>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-3">We may earn a commission if you sign up through these links. This does not affect our calculator results.</p>
    </div>
  );
}
