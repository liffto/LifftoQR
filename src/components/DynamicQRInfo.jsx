import { useState } from 'react'
import { Info, X, Zap, Lock } from 'lucide-react'

// Small info icon that opens a plain-language explainer of Dynamic vs Static
// QR codes — placed next to the Dynamic QR toggle so non-technical users
// understand what the switch actually does before they flip it.
export default function DynamicQRInfo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="inline-flex h-4 w-4 items-center justify-center align-middle text-ink-faint hover:text-primary transition-colors"
        aria-label="How Dynamic and Static QR codes work"
      >
        <Info size={14} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h3 className="font-semibold text-ink text-sm">
                How QR types work
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-[10px] flex items-center justify-center text-ink-soft hover:bg-canvas"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Zap size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Dynamic QR</p>
                  <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                    Scanning it opens a short Liffto link that takes people
                    to your content. You can change the destination anytime and
                    see how many times it's scanned — all without reprinting the
                    code.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-[10px] bg-canvas text-ink-muted flex items-center justify-center shrink-0">
                  <Lock size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Static QR</p>
                  <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                    Your information is built directly into the code itself. It
                    works forever with no internet dependency, but it can't be
                    edited or tracked once it's created.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
