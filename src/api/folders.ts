import { api } from './axios'

/**
 * Folders — the groups codes are filed into.
 *
 * These routes return their payload directly rather than inside the `{ data }`
 * envelope the QR endpoints use, because they are on the same direct-session
 * pattern as saved templates. Read `data`, not `data.data`.
 */

export interface Folder {
  id: number
  name: string
  /** How many codes are filed in it. Zero is a legitimate, expected state. */
  qrCount: number
}

export async function listFolders(): Promise<Folder[]> {
  const { data } = await api.get<Folder[]>('/folders')
  return data ?? []
}

export async function createFolder(name: string): Promise<Folder> {
  const { data } = await api.post<Folder>('/folders', { name })
  return data
}

export async function renameFolder(id: number, name: string): Promise<Folder> {
  const { data } = await api.patch<Folder>(`/folders/${id}`, { name })
  return data
}

/** Deletes the folder only. The codes inside it are unfiled, never deleted. */
export async function deleteFolder(id: number): Promise<void> {
  await api.delete(`/folders/${id}`)
}

/** File a code into a folder, or pass null to take it out of every folder. */
export async function assignFolder(
  qrId: number,
  folderId: number | null,
): Promise<void> {
  await api.put('/folders/assignment', { qrId, folderId })
}
