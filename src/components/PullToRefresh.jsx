import { usePullToRefresh } from '../hooks/usePullToRefresh'
import QrRefreshIndicator from './QrRefreshIndicator'

/**
 * Owns the pull gesture and the thing it drags into view.
 *
 * A component rather than a hook call in the page, because the pull updates on
 * every animation frame of the drag and whatever holds that state re-renders
 * with it. In the dashboard that meant re-rendering thirteen rows and their QR
 * previews sixty times a second to move one pill — on the phone that matters
 * here, exactly the kind of thing that turns a nice gesture into a stuttering
 * one. Keeping the state down here means a drag re-renders this and nothing
 * else.
 *
 * Hidden from md up: the hook already ignores anything but a coarse pointer,
 * and a desktop has a scrollbar and a reload button.
 */
export default function PullToRefresh({ onRefresh }) {
  const { pull, progress, refreshing, ready } = usePullToRefresh(onRefresh)

  if (pull <= 0 && !refreshing) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[52px] z-30 flex justify-center md:hidden"
      style={{
        // Transform and opacity only — no layout property changes, so the list
        // underneath never reflows mid-gesture.
        transform: `translateY(${pull}px)`,
        opacity: refreshing ? 1 : Math.min(1, progress * 1.4),
      }}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 py-2 shadow-pop">
        <QrRefreshIndicator progress={progress} refreshing={refreshing} />
        <span className="text-[12px] font-semibold text-ink-soft">
          {refreshing
            ? 'Refreshing…'
            : ready
              ? 'Release to refresh'
              : 'Pull to refresh'}
        </span>
      </div>
    </div>
  )
}
