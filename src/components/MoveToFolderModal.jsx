import { useEffect, useRef, useState } from 'react'
import { Check, FolderOpen, Loader2, Plus, X } from 'lucide-react'
import { useAssignFolder, useCreateFolder, useFolders } from '../hooks/useFolders'

/**
 * Move a code into a folder — or out of every folder.
 *
 * Opens showing where the code is *now*, with that folder already selected.
 * Without it the only way to find out where something lived was to close the
 * dialog you had opened in order to move it.
 *
 * Stacks over the details panel rather than replacing it, so closing returns
 * you to the code you were looking at.
 */
export default function MoveToFolderModal({ row, onClose }) {
  const { data: folders = [], isLoading } = useFolders()
  const assign = useAssignFolder()
  const create = useCreateFolder()

  // Where it is now — the question the dialog answers before it is used to
  // change the answer.
  const [selected, setSelected] = useState(row?.folderId ?? null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const newNameRef = useRef(null)

  useEffect(() => {
    if (creating) newNameRef.current?.focus()
  }, [creating])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const unchanged = selected === (row?.folderId ?? null)
  const busy = assign.isPending || create.isPending

  const submitNew = async () => {
    const name = newName.trim()
    if (!name) return
    setError('')
    try {
      const folder = await create.mutateAsync(name)
      setSelected(folder.id)
      setCreating(false)
      setNewName('')
    } catch (err) {
      setError(
        err?.response?.status === 409
          ? `You already have a folder called ${name}`
          : 'Could not create that folder. Please try again.',
      )
    }
  }

  const submit = async () => {
    setError('')
    try {
      await assign.mutateAsync({ qrId: row.id, folderId: selected })
      onClose()
    } catch {
      setError('Could not move that code. Please try again.')
    }
  }

  const Row = ({ id, name, count, icon: Icon }) => {
    const active = selected === id
    return (
      <button
        type="button"
        onClick={() => setSelected(id)}
        className={`flex w-full items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
          active
            ? 'border-primary bg-primary/5'
            : 'border-line hover:bg-canvas'
        }`}
      >
        <Icon
          size={16}
          className={`shrink-0 ${active ? 'text-primary' : 'text-ink-faint'}`}
          aria-hidden="true"
        />
        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            active ? 'font-semibold text-ink' : 'text-ink-soft'
          }`}
        >
          {name}
        </span>
        {typeof count === 'number' && (
          <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
            {count}
          </span>
        )}
        {active && <Check size={15} className="shrink-0 text-primary" strokeWidth={3} />}
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade"
      // Only a press that both starts and ends on the backdrop closes it, so a
      // drag that begins inside the panel cannot dismiss it.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Move to folder"
        className="w-full max-w-sm rounded-[10px] bg-surface shadow-2xl animate-pop"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <FolderOpen size={18} className="shrink-0 text-primary" aria-hidden="true" />
            <h2 className="min-w-0 truncate font-semibold text-ink">Move to folder</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">{row?.name}</span> is
            currently{' '}
            {row?.folderName ? (
              <>
                in <span className="font-semibold text-ink">{row.folderName}</span>.
              </>
            ) : (
              'not in any folder.'
            )}
          </p>

          <div className="max-h-[240px] space-y-1.5 overflow-y-auto">
            <Row id={null} name="No folder" icon={FolderOpen} />

            {isLoading ? (
              <div className="shimmer h-[42px] rounded-[10px]" aria-busy="true" />
            ) : (
              folders.map((f) => (
                <Row key={f.id} id={f.id} name={f.name} count={f.qrCount} icon={FolderOpen} />
              ))
            )}
          </div>

          {creating ? (
            <div className="flex gap-2">
              <input
                ref={newNameRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitNew()
                  if (e.key === 'Escape') {
                    e.stopPropagation()
                    setCreating(false)
                  }
                }}
                maxLength={100}
                placeholder="Folder name"
                aria-label="New folder name"
                className="h-11 w-full rounded-[10px] border border-line bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={submitNew}
                disabled={!newName.trim() || create.isPending}
                className="h-11 shrink-0 rounded-[10px] bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:border disabled:border-line disabled:bg-canvas disabled:text-ink-faint"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[10px]"
            >
              <Plus size={14} strokeWidth={2.5} aria-hidden="true" /> New folder
            </button>
          )}

          {error && (
            <p role="alert" className="text-xs font-medium text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 flex-1 rounded-[10px] border border-line text-sm font-medium text-ink-soft transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            // The only sanctioned disable: moving it where it already is does
            // nothing, so there is no error to explain.
            disabled={unchanged || busy}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:border disabled:border-line disabled:bg-canvas disabled:text-ink-faint disabled:cursor-not-allowed"
          >
            {assign.isPending && <Loader2 size={15} className="animate-spin" />}
            Move
          </button>
        </div>
      </div>
    </div>
  )
}
