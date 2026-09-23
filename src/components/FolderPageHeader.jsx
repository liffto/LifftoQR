import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, FolderOpen, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { useDeleteFolder, useRenameFolder } from '../hooks/useFolders'

/**
 * The header for /folders/:folderId — what this list is, and the two things
 * you can do to the folder itself.
 *
 * Renaming is inline: the name is already on screen, and a dialog to change one
 * word is a step nobody needs. Deleting is confirmed, because it is
 * destructive — and the confirmation says the codes survive, since that is the
 * thing someone pressing Delete is actually worried about.
 */
export default function FolderPageHeader({ folder, count, loading }) {
  const navigate = useNavigate()
  const rename = useRenameFolder()
  const remove = useDeleteFolder()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(folder?.name ?? '')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => setName(folder?.name ?? ''), [folder?.name])
  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  if (loading) {
    return <div className="shimmer mb-5 h-[52px] rounded-[10px]" aria-busy="true" />
  }

  // An id that is not yours, or no longer exists, reads the same way.
  if (!folder) {
    return (
      <div className="mb-5 rounded-[10px] border border-line bg-surface p-5 text-center">
        <p className="font-bold text-ink">That folder isn&apos;t here</p>
        <p className="mx-auto mt-1 max-w-[280px] text-sm leading-relaxed text-ink-muted">
          It may have been deleted, or it belongs to another account.
        </p>
        <button
          type="button"
          onClick={() => navigate('/folders')}
          className="mt-3 h-10 rounded-[10px] border border-line px-5 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Back to folders
        </button>
      </div>
    )
  }

  const submitRename = async () => {
    const next = name.trim()
    if (!next || next === folder.name) {
      setEditing(false)
      setName(folder.name)
      return
    }
    setError('')
    try {
      await rename.mutateAsync({ id: folder.id, name: next })
      setEditing(false)
    } catch (err) {
      setError(
        err?.response?.status === 409
          ? `You already have a folder called ${next}`
          : 'Could not rename that folder. Please try again.',
      )
    }
  }

  const submitDelete = async () => {
    setError('')
    try {
      await remove.mutateAsync(folder.id)
      navigate('/folders')
    } catch {
      setError('Could not delete that folder. Please try again.')
    }
  }

  return (
    <div className="mb-5 rounded-[10px] border border-line bg-surface">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          aria-label="Back to folders"
          title="Back to folders"
          onClick={() => navigate('/folders')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft size={18} />
        </button>

        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <FolderOpen size={18} />
        </span>

        {editing ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename()
                if (e.key === 'Escape') {
                  setEditing(false)
                  setName(folder.name)
                }
              }}
              maxLength={100}
              aria-label="Folder name"
              className="h-10 w-full min-w-0 rounded-[10px] border border-line bg-surface px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="button"
              aria-label="Save name"
              onClick={submitRename}
              disabled={rename.isPending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-white transition-colors hover:bg-primary-600 disabled:bg-canvas disabled:text-ink-faint"
            >
              {rename.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} strokeWidth={3} />
              )}
            </button>
            <button
              type="button"
              aria-label="Cancel rename"
              onClick={() => {
                setEditing(false)
                setName(folder.name)
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-canvas"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold leading-tight text-ink">
                {folder.name}
              </h1>
              <p className="text-[11px] text-ink-muted tabular-nums">
                {count === 1 ? '1 code' : `${count.toLocaleString()} codes`}
              </p>
            </div>
            <button
              type="button"
              aria-label="Rename folder"
              title="Rename folder"
              onClick={() => setEditing(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              aria-label="Delete folder"
              title="Delete folder"
              onClick={() => setConfirming(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="px-4 pb-3 text-xs font-medium text-danger">
          {error}
        </p>
      )}

      {confirming && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirming(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Delete ${folder.name}`}
            className="w-full max-w-sm rounded-[10px] bg-surface p-5 shadow-2xl animate-pop"
          >
            <h2 className="font-semibold text-ink">Delete {folder.name}?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {count > 0 ? (
                <>
                  The {count === 1 ? 'code' : `${count} codes`} in it will be
                  kept — they just won&apos;t be in a folder any more.
                </>
              ) : (
                'This folder is empty.'
              )}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-10 flex-1 rounded-[10px] border border-line text-sm font-medium text-ink-soft transition-colors hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDelete}
                disabled={remove.isPending}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[10px] bg-danger text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
              >
                {remove.isPending && <Loader2 size={15} className="animate-spin" />}
                Delete folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
