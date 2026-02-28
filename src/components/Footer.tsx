import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-700 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-lg">&#9670;</span>
            <span className="font-display text-zinc-300">ToolPile</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          </div>
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} ToolPile &middot; Free tools, no signup, no data stored.
          </p>
        </div>
      </div>
    </footer>
  );
}
