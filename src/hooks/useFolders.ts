import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignFolder,
  createFolder,
  deleteFolder,
  listFolders,
  renameFolder,
} from '../api/folders'
import { qrsQueryKey } from './useQrs'

export const foldersQueryKey = ['folders'] as const

export function useFolders(enabled = true) {
  return useQuery({
    queryKey: foldersQueryKey,
    queryFn: listFolders,
    enabled,
  })
}

/**
 * Anything that changes a folder can change the codes list too — a count on a
 * tile, a chip on a row, which codes a folder page shows — so both keys are
 * invalidated together. Keeping them in step here means no caller has to
 * remember the second one.
 */
function useFolderMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foldersQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useCreateFolder() {
  return useFolderMutation((name: string) => createFolder(name))
}

export function useRenameFolder() {
  return useFolderMutation(({ id, name }: { id: number; name: string }) =>
    renameFolder(id, name),
  )
}

export function useDeleteFolder() {
  return useFolderMutation((id: number) => deleteFolder(id))
}

export function useAssignFolder() {
  return useFolderMutation(
    ({ qrId, folderId }: { qrId: number; folderId: number | null }) =>
      assignFolder(qrId, folderId),
  )
}
