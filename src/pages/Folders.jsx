import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, FolderPlus, Loader2, Plus, X } from 'lucide-react'
import Layout from '../components/Layout'
import { useCreateFolder, useFolders } from '../hooks/useFolders'

/**
 * The folders grid.
 *
 * "New folder" is a tile in the grid rather than a button in the header: it
 * belongs with the things it makes, and in the header it would compete with
 * the page's primary action. An account with no folders therefore still has
 * something to press, which is why there is no separate empty state fighting
 * for the same job.
 */

function NewFolderTile({ onCreated }) {
  const create = useCreateFolder()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const reset = () => {
    setOpen(false)
    setName('')
    setError('')
  }

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setError('')
    try {
      const folder = await create.mutateAsync(trimmed)
      reset()
      onCreated?.(folder)
    } catch (err) {
      setError(
        err?.response?.status === 409
          ? `You already have a folder called ${trimmed}`
          : 'Could not create that folder. Please try again.',
      )
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-full min-h-[92px] flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-line bg-surface p-4 text-ink-muted transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Plus size={20} strokeWidth={2.4} aria-hidden="true" />
        <span className="text-[13px] font-semibold">New folder</span>
      </button>
    )
  }

  return (
    <div className="flex h-full min-h-[92px] flex-col justify-center gap-2 rounded-[10px] border border-primary/40 bg-surface p-3">
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') reset()
        }}
        maxLength={100}
        placeholder="Folder name"
        aria-label="New folder name"
        className="h-10 w-full rounded-[10px] border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          aria-label="Cancel"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line text-ink-soft transition-colors hover:bg-canvas"
        >
          <X size={15} />
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim() || create.isPending}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-primary text-[13px] font-semibold text-white transition-colors hover:bg-primary-600 disabled:border disabled:border-line disabled:bg-canvas disabled:text-ink-faint"
        >
          {create.isPending && <Loader2 size={14} className="animate-spin" />}
          Create
        </button>
      </div>
      {error && (
        <p role="alert" className="text-[11px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export default function Folders() {
  const navigate = useNavigate()
  const { data: folders = [], isLoading, isError, refetch } = useFolders()

  return (
    <Layout breadcrumb="Folders">
      <div className="mb-4">
        <h1 className="text-base font-bold text-ink">Folders</h1>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          Group your codes however you like. A code can be in one folder.
        </p>
      </div>

      {isError ? (
        <div className="rounded-[10px] border border-line bg-surface px-4 py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[10px] bg-danger/10">
            <FolderOpen size={24} className="text-danger" aria-hidden="true" />
          </div>
          <p className="mb-1 font-bold text-ink">Couldn&apos;t load your folders</p>
          <p className="mx-auto max-w-[240px] text-sm leading-relaxed text-ink-muted">
            Something went wrong fetching them. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 h-10 rounded-[10px] border border-line px-5 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="shimmer h-[92px] rounded-[10px]"
                  aria-busy="true"
                />
              ))
            : folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => navigate(`/folders/${f.id}`)}
                  aria-label={`Open ${f.name}`}
                  className="group flex h-full min-h-[92px] flex-col justify-between rounded-[10px] border border-line bg-surface p-4 text-left transition-all hover:border-primary/30 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    <FolderOpen size={18} />
                  </span>
                  <span className="mt-3 min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {f.name}
                    </span>
                    <span className="block text-[11px] text-ink-muted tabular-nums">
                      {f.qrCount === 1
                        ? '1 code'
                        : `${f.qrCount.toLocaleString()} codes`}
                    </span>
                  </span>
                </button>
              ))}

          {!isLoading && (
            <NewFolderTile onCreated={(f) => navigate(`/folders/${f.id}`)} />
          )}
        </div>
      )}

      {!isLoading && !isError && folders.length === 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-[13px] text-ink-muted">
          <FolderPlus size={14} className="shrink-0" aria-hidden="true" />
          No folders yet — make one above, then move codes into it from the
          dashboard.
        </p>
      )}
    </Layout>
  )
}
