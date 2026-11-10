// Фото и видео по умолчанию лежат в public/ и отдаются самим фронтендом.
// BASE_URL нужен, чтобы пути не сломались при деплое не в корень (например, GitHub Pages).
const base = import.meta.env.BASE_URL

export const DEFAULT_IMAGE = `${base}default-image.png`
export const DEFAULT_VIDEO = `${base}default-video.mp4`

export const mockAsset = (file: string) => `${base}mock/${file}`

// Веб-сервис отдаёт прямые адреса MinIO. Браузер открывает их через второй маршрут прокси:
// http://localhost:9000/break-even/file.png -> /s3/break-even/file.png
const S3_ORIGIN = 'http://localhost:9000'

export const toProxyUrl = (url: string) =>
  url.startsWith(S3_ORIGIN) ? `/s3${url.slice(S3_ORIGIN.length)}` : url
