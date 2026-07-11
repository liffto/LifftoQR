import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createLinkTree,
  getLinkTree,
  listLinkTrees,
  updateLinkTree,
} from '../api/qrcode/linkTree'
import type { LinkTreeCreatePayload, LinkTreeUpdatePayload } from '../api/qrcode/linkTree'
import { linkTreeToRecord } from '../api/qrcode/linkTree.mappers'
import { qrsQueryKey } from './useQrs'

export const linkTreeQueryKey = (linkTreeId: number) => ['linkTree', linkTreeId] as const
export const linkTreesQueryKey = ['linkTrees'] as const

export function useLinkTree(linkTreeId: number | null) {
  return useQuery({
    queryKey: linkTreeQueryKey(linkTreeId ?? 0),
    enabled: linkTreeId != null && Number.isFinite(linkTreeId) && linkTreeId > 0,
    queryFn: () => getLinkTree(linkTreeId as number),
    select: linkTreeToRecord,
  })
}

export function useLinkTreeList() {
  return useQuery({
    queryKey: linkTreesQueryKey,
    queryFn: listLinkTrees,
    select: (items) => items.map(linkTreeToRecord),
  })
}

export function useCreateLinkTree() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LinkTreeCreatePayload) => createLinkTree(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkTreesQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateLinkTree() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      linkTreeId,
      payload,
    }: {
      linkTreeId: number
      payload: LinkTreeUpdatePayload
    }) => updateLinkTree(linkTreeId, payload),
    onSuccess: (_, { linkTreeId }) => {
      queryClient.invalidateQueries({ queryKey: linkTreesQueryKey })
      queryClient.invalidateQueries({ queryKey: linkTreeQueryKey(linkTreeId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
