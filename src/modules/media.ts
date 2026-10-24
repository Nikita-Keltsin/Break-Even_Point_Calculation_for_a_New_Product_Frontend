// Фото и видео по умолчанию лежат в public/ и отдаются самим фронтендом.
// BASE_URL нужен, чтобы пути не сломались при деплое не в корень (например, GitHub Pages).
const base = import.meta.env.BASE_URL

export const DEFAULT_IMAGE = `${base}default-image.png`
export const DEFAULT_VIDEO = `${base}default-video.mp4`

export const mockAsset = (file: string) => `${base}mock/${file}`
