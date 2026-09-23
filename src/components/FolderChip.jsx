import { Folder } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * The folder a code is filed in, shown on the row, the card and the details
 * panel — one component so all three change together rather than drifting.
 *
 * A name that refers to a destination navigates to it: seeing "Marketing" on a
 * row and having to go back up and find Marketing again is the thing this
 * exists to stop. A folder with no id has nowhere to go, so it stays plain
 * text — a control that looks live and does nothing is worse than a label.
 */
export default function FolderChip({ row, className = '', onNavigate }) {
  const navigate = useNavigate()
  if (!row?.folderName) return null

  const shell =
    'inline-flex max-w-[150px] items-center gap-1 rounded-full bg-canvas px-2 py-0.5 ' +
    `text-[11px] font-semibold text-ink-muted ring-1 ring-line ${className}`
  const body = (
    <>
      <Folder size={10} className="shrink-0" strokeWidth={2.4} aria-hidden="true" />
      <span className="truncate">{row.folderName}</span>
    </>
  )

  if (typeof row.folderId !== 'number') {
    return (
      <span className={shell} title={`In ${row.folderName}`}>
        {body}
      </span>
    )
  }

  return (
    <button
      type="button"
      title={`Go to ${row.folderName}`}
      onClick={(e) => {
        // Inside a clickable card or row, the parent's handler must not fire
        // as well — otherwise this opens the details panel on the way out.
        e.stopPropagation()
        onNavigate?.()
        navigate(`/folders/${row.folderId}`)
      }}
      className={`${shell} transition-all hover:bg-primary/5 hover:text-primary hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
    >
      {body}
    </button>
  )
}
