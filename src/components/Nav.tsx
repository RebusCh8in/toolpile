"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-700 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl text-zinc-100 hover:text-blue-500 transition-colors"
        >
          <span className="text-blue-500 text-2xl leading-none">&#9670;</span>
          <span className="tracking-tight">ToolPile</span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          All Tools &rarr;
        </Link>
      </div>
    </nav>
  );
}
