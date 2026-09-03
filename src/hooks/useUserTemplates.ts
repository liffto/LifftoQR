import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listUserTemplates,
  saveUserTemplate,
  deleteUserTemplate,
} from '../api/qrcode/userTemplates'
import type { UserTemplate } from '../api/qrcode/userTemplates'
import { getTemplates, clearLocalTemplates } from '../lib/store'
import { defaultDesign } from '../lib/store'

export const userTemplatesQueryKey = ['user-templates'] as const

export function useUserTemplates(enabled = true) {
  return useQuery({
    queryKey: userTemplatesQueryKey,
    queryFn: listUserTemplates,
    enabled,
    // A saved look is not something anyone edits from two places at once, and
    // the design studio reads this list on every visit.
    staleTime: 5 * 60 * 1000,
  })
}

export function useSaveUserTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      label,
      design,
    }: {
      label: string
      design: ReturnType<typeof defaultDesign>
    }) => saveUserTemplate(label, design),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userTemplatesQueryKey })
    },
  })
}

export function useDeleteUserTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteUserTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userTemplatesQueryKey })
    },
  })
}

/**
 * Move whatever is already in localStorage up to the account, once.
 *
 * Templates used to live only in the browser. Switching to the server without
 * this would have quietly emptied the picker for everyone who had saved
 * anything — their looks would still be in localStorage, just no longer read by
 * anything, which is the same as losing them.
 *
 * Runs after the server list has loaded so it can skip names already up there,
 * and only clears the local copy once every one of them has been accepted. A
 * half-finished upload leaves the local copy alone and tries again next time.
 */
export function useLiftLocalTemplates(serverTemplates?: UserTemplate[]) {
  const queryClient = useQueryClient()
  const started = useRef(false)

  useEffect(() => {
    if (started.current || !serverTemplates) return

    const local = getTemplates()
    if (!Array.isArray(local) || local.length === 0) {
      // Nothing to move, but an empty array may still be sitting in storage.
      clearLocalTemplates()
      return
    }

    started.current = true
    const taken = new Set(serverTemplates.map((t) => t.label))
    const pending = local.filter((t) => t?.label && !taken.has(t.label))

    if (pending.length === 0) {
      clearLocalTemplates()
      return
    }

    Promise.allSettled(
      pending.map((t) =>
        saveUserTemplate(t.label, { ...defaultDesign(), ...(t.design || {}) }),
      ),
    ).then((results) => {
      if (results.every((r) => r.status === 'fulfilled')) clearLocalTemplates()
      queryClient.invalidateQueries({ queryKey: userTemplatesQueryKey })
    })
  }, [serverTemplates, queryClient])
}
