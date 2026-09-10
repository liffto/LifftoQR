import { linkIcon } from '../lib/linkIcons'

/**
 * A link-tree link's icon on its light chip. The chip is a fixed light surface
 * regardless of theme, so a brand mark — black ones (X, TikTok) included —
 * always reads, the way an app tile does on a home screen. `size` is the chip;
 * the glyph is drawn a little smaller inside it.
 */
export default function LinkIconChip({ iconKey, size = 36, className = '' }) {
  const { Icon, color, name } = linkIcon(iconKey)
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[10px] bg-white ring-1 ring-black/[0.06] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
      title={name}
    >
      <Icon size={size * 0.52} style={{ color }} />
    </span>
  )
}
