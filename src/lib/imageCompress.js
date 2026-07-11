/**
 * Resize and compress an image file to a JPEG data URL suitable for QR logos.
 * Keeps payloads small enough to save via the API without hitting size limits.
 */
export function compressImageFile(file, { maxSize = 400, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Please choose an image file (PNG, JPG, or SVG).'))
      return
    }

    // SVGs are already tiny text — keep as-is via FileReader
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Could not read that image. Try another file.'))
      reader.readAsDataURL(file)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not process that image. Try another file.'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch {
        reject(new Error('Could not process that image. Try another file.'))
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read that image. Try another file.'))
    }

    img.src = objectUrl
  })
}
