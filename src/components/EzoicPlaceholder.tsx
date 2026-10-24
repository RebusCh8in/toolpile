// Ezoic standalone fills any div with this id pattern when showAds() runs
// (see EzoicAds.tsx). The number must match a placeholder created in the
// Ezoic dashboard under Ezoic → Ad Positions, or nothing renders in it.
export default function EzoicPlaceholder({ id }: { id: number }) {
  return <div id={`ezoic-pub-ad-placeholder-${id}`} />;
}
