'use client'

import { useState, useRef } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

interface LineItem {
  id: number
  description: string
  quantity: number
  rate: number
}

let nextId = 1

const faqs: FAQ[] = [
  { question: "Is this invoice generator free?", answer: "Yes, completely free. Generate unlimited invoices with no signup, no watermark, and no data stored. Everything runs in your browser." },
  { question: "Are these invoices legally valid?", answer: "These invoices contain all the standard fields needed for business invoicing. However, legal requirements vary by jurisdiction. Consult your accountant for specific compliance requirements in your area." },
  { question: "Can I save invoices as PDF?", answer: "Yes. Click 'Print / Save PDF' and use your browser's print dialog to save as PDF. This works on all modern browsers and preserves the invoice layout." },
]

const relatedTools: RelatedTool[] = [
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
  { name: "Word Counter", href: "/tools/word-counter" },
  { name: "JSON Formatter", href: "/tools/json-formatter" },
]

export default function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [fromName, setFromName] = useState('')
  const [fromAddress, setFromAddress] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [toName, setToName] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ id: nextId++, description: '', quantity: 1, rate: 0 }])
  const [taxRate, setTaxRate] = useState(0)
  const [notes, setNotes] = useState('')
  const [currency, setCurrency] = useState('$')
  const previewRef = useRef<HTMLDivElement>(null)

  const addItem = () => setItems([...items, { id: nextId++, description: '', quantity: 1, rate: 0 }])
  const removeItem = (id: number) => items.length > 1 && setItems(items.filter(i => i.id !== id))
  const updateItem = (id: number, update: Partial<LineItem>) => setItems(items.map(i => i.id === id ? { ...i, ...update } : i))

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  const fmt = (n: number) => `${currency}${n.toFixed(2)}`

  const handlePrint = () => {
    const content = previewRef.current
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoiceNumber}</title><style>
      body { font-family: -apple-system, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: auto; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
      th { background: #f5f5f5; font-weight: 600; font-size: 13px; text-transform: uppercase; color: #666; }
      .total-row td { font-weight: bold; border-top: 2px solid #333; }
      .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
      .label { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
      .value { font-size: 14px; }
      h1 { font-size: 28px; margin: 0; }
      .notes { margin-top: 30px; font-size: 13px; color: #666; }
      @media print { body { padding: 0; } }
    </style></head><body>${content.innerHTML}</body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <ToolLayout
      title="Invoice Generator"
      description="Create professional invoices for free. No signup, no watermark. Print or save as PDF directly from your browser."
      category="Utility"
      slug="invoice-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["invoice generator", "free invoice maker", "create invoice online", "invoice template", "freelance invoice"]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-5">
          {/* Invoice details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Invoice #</label>
              <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Date</label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-zinc-400 uppercase">From</h4>
              <input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Your name / company" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
              <textarea value={fromAddress} onChange={e => setFromAddress(e.target.value)} placeholder="Address" rows={2} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 resize-none" />
              <input value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-zinc-400 uppercase">Bill To</h4>
              <input value={toName} onChange={e => setToName(e.target.value)} placeholder="Client name / company" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
              <textarea value={toAddress} onChange={e => setToAddress(e.target.value)} placeholder="Address" rows={2} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 resize-none" />
              <input value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase mb-2">Line Items</h4>
            {items.map(item => (
              <div key={item.id} className="flex gap-2 mb-2">
                <input value={item.description} onChange={e => updateItem(item.id, { description: e.target.value })} placeholder="Description" className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
                <input type="number" value={item.quantity} onChange={e => updateItem(item.id, { quantity: +e.target.value })} min={1} className="w-16 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 text-center" />
                <input type="number" value={item.rate} onChange={e => updateItem(item.id, { rate: +e.target.value })} min={0} step={0.01} className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
                <span className="flex items-center text-sm text-zinc-400 w-20 justify-end">{fmt(item.quantity * item.rate)}</span>
                {items.length > 1 && <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-red-400">✕</button>}
              </div>
            ))}
            <button onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300 mt-1">+ Add Item</button>
          </div>

          {/* Tax, Currency, Notes */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Currency Symbol</label>
              <input value={currency} onChange={e => setCurrency(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Tax Rate (%)</label>
              <input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} min={0} max={100} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-end">
              <button onClick={handlePrint} className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
                Print / Save PDF
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, bank details, thank you note..." rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Preview</h3>
          <div ref={previewRef} className="bg-white text-gray-900 rounded-xl p-8 text-sm" style={{ fontFamily: '-apple-system, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>INVOICE</h1>
                <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>{invoiceNumber}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13 }}>
                <div><strong>Date:</strong> {invoiceDate}</div>
                {dueDate && <div><strong>Due:</strong> {dueDate}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
              <div>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>From</div>
                <div style={{ fontWeight: 600 }}>{fromName || 'Your Name'}</div>
                <div style={{ whiteSpace: 'pre-wrap', color: '#666' }}>{fromAddress}</div>
                {fromEmail && <div style={{ color: '#666' }}>{fromEmail}</div>}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Bill To</div>
                <div style={{ fontWeight: 600 }}>{toName || 'Client Name'}</div>
                <div style={{ whiteSpace: 'pre-wrap', color: '#666' }}>{toAddress}</div>
                {toEmail && <div style={{ color: '#666' }}>{toEmail}</div>}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: '#666', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 11, color: '#666', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 11, color: '#666', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Rate</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 11, color: '#666', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>{item.description || '—'}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{fmt(item.rate)}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{fmt(item.quantity * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: 16, fontSize: 14 }}>
              <div>Subtotal: {fmt(subtotal)}</div>
              {taxRate > 0 && <div>Tax ({taxRate}%): {fmt(tax)}</div>}
              <div style={{ fontWeight: 'bold', fontSize: 18, marginTop: 8, borderTop: '2px solid #333', paddingTop: 8 }}>
                Total: {fmt(total)}
              </div>
            </div>

            {notes && <div style={{ marginTop: 30, fontSize: 13, color: '#666', borderTop: '1px solid #eee', paddingTop: 12 }}>{notes}</div>}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
