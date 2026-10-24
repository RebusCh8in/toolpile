'use client'

import { useEffect } from 'react'

// The Buy Me a Coffee widget injects its floating button on the page's
// DOMContentLoaded/load event. When loaded through next/script that event has
// already fired, so the button never appears. We inject the script ourselves
// and re-dispatch DOMContentLoaded once it loads so the widget initializes.
export default function BuyMeCoffee() {
  useEffect(() => {
    if (document.querySelector('script[data-name="BMC-Widget"]')) return

    const script = document.createElement('script')
    const attrs: Record<string, string> = {
      'data-name': 'BMC-Widget',
      'data-cfasync': 'false',
      'data-id': 'toolpile',
      'data-description': 'Support me on Buy me a coffee!',
      // Short message so the auto-popup bubble isn't intrusive; the full pitch
      // lives on the tool's after-download card instead.
      'data-message': 'Enjoying the free tools? A coffee keeps them coming ☕',
      'data-color': '#5F7FFF',
      'data-position': 'Right',
      'data-x_margin': '18',
      'data-y_margin': '18',
    }
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v))
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js'
    script.async = true
    script.onload = () => {
      window.dispatchEvent(new Event('DOMContentLoaded'))
    }
    document.body.appendChild(script)
  }, [])

  return null
}
