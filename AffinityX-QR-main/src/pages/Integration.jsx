import { useState } from 'react'
import {
  Copy,
  RefreshCw,
  ExternalLink,
  Webhook,
  Key,
  Globe,
  Zap,
  MessageSquare,
  Table2,
  Users,
  Mail,
  Link2,
  Plus,
  Check,
} from 'lucide-react'
import Layout from '../components/Layout'

const PLATFORMS = [
  { name: 'Zapier', desc: 'Automate workflows with 5,000+ apps', icon: Zap },
  {
    name: 'Slack',
    desc: 'Get QR scan notifications in Slack',
    icon: MessageSquare,
  },
  { name: 'Google Sheets', desc: 'Sync QR data to spreadsheets', icon: Table2 },
  { name: 'HubSpot', desc: 'Track QR scans in your CRM', icon: Users },
  { name: 'Mailchimp', desc: 'Trigger email campaigns on QR scan', icon: Mail },
  { name: 'Webhooks', desc: 'Custom HTTP callbacks on any event', icon: Link2 },
]

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)
  const doCopy = () => {
    navigator.clipboard?.writeText(value) ||
      (() => {
        const el = document.createElement('textarea')
        el.value = value
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      })()
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div>
      <p className="text-xs text-ink-muted mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-canvas rounded-[10px] px-4 py-2.5 text-sm text-ink-soft font-mono truncate border border-line">
          {value}
        </div>
        <button
          type="button"
          onClick={doCopy}
          className={`h-10 px-4 rounded-[10px] border text-sm flex items-center gap-1.5 shrink-0 transition-colors ${
            copied
              ? 'border-success text-success bg-success/5'
              : 'border-line text-ink-soft hover:bg-canvas'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function PlatformCard({ name, desc, icon: Icon, connected, onToggle }) {
  return (
    <div className="bg-white border border-line rounded-[10px] p-4 flex items-center justify-between gap-3 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{name}</p>
          <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-medium border transition-colors ${
          connected
            ? 'bg-success/10 border-success/30 text-success'
            : 'border-primary text-primary hover:bg-primary/5'
        }`}
      >
        {connected ? (
          <>
            <Check size={13} /> Connected
          </>
        ) : (
          <>
            <Plus size={13} /> Connect
          </>
        )}
      </button>
    </div>
  )
}

export default function Integration() {
  const [webhook, setWebhook] = useState('')
  const [connected, setConnected] = useState({})

  const toggle = (name) =>
    setConnected((prev) => ({ ...prev, [name]: !prev[name] }))

  return (
    <Layout breadcrumb="Integration">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys */}
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Key size={18} className="text-primary" />
            <h3 className="font-semibold text-ink">API Keys</h3>
          </div>
          <div className="space-y-4">
            <CopyField
              label="API Key"
              value="ak_live_affinityx_••••••••••••••••3F9A"
            />
            <CopyField
              label="Secret Key"
              value="sk_live_••••••••••••••••••••••••••••••••"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-primary border border-line rounded-[10px] px-4 py-2 transition-colors"
              >
                <RefreshCw size={14} /> Regenerate
              </button>
              <a
                href="#"
                className="flex items-center gap-1.5 text-sm text-primary border border-primary/30 rounded-[10px] px-4 py-2 hover:bg-primary/5 transition-colors"
              >
                <ExternalLink size={14} /> API Docs
              </a>
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Webhook size={18} className="text-primary" />
            <h3 className="font-semibold text-ink">Webhooks</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-ink-muted mb-1.5">Endpoint URL</p>
              <input
                type="url"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                placeholder="https://your-app.com/webhook"
                className="w-full bg-canvas rounded-[10px] px-4 py-2.5 text-sm text-ink border border-line focus:border-primary outline-none"
              />
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-2">Events</p>
              <div className="space-y-2">
                {['qr.scanned', 'qr.created', 'qr.deleted'].map((evt) => (
                  <label
                    key={evt}
                    className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-primary"
                    />
                    <code className="text-xs bg-canvas px-2 py-0.5 rounded border border-line">
                      {evt}
                    </code>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="w-full h-10 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Save Webhook
            </button>
          </div>
        </div>

        {/* Connect Platforms */}
        <div className="bg-white rounded-[10px] shadow-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} className="text-primary" />
            <h3 className="font-semibold text-ink">Connect Platforms</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLATFORMS.map((p) => (
              <PlatformCard
                key={p.name}
                {...p}
                connected={!!connected[p.name]}
                onToggle={() => toggle(p.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
