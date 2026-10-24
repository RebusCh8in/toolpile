"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Ezstandalone = {
  cmd: Array<() => void>;
  showAds: (...ids: number[]) => void;
};

declare global {
  interface Window {
    ezstandalone?: Ezstandalone;
  }
}

/**
 * Fills Ezoic placeholders on every pageview, including the first.
 *
 * Placeholders (see EzoicPlaceholder) are empty divs; nothing renders in
 * them until ezstandalone.showAds() runs. Calling showAds() with no
 * arguments fills every placeholder currently in the DOM. ToolPile is a
 * Next.js App Router SPA, so per Ezoic's "Dynamic Content > Changing Pages"
 * docs the same call must also re-fire on each client-side navigation to
 * count the new pageview and refresh the units.
 */
export default function EzoicAds() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ez = (window.ezstandalone =
      window.ezstandalone || ({ cmd: [] } as unknown as Ezstandalone));
    ez.cmd.push(function () {
      window.ezstandalone!.showAds();
    });
  }, [pathname]);

  return null;
}
