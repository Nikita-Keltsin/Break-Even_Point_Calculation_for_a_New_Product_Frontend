import { useEffect, useState } from 'react'
import { loadFeed } from '../../api/lab8'

type Angles = { x: number; y: number }
type Result = { key: string; angles?: Angles; timedOut?: boolean }

export function useRotation(navigation: string, id?: number, version?: number, scheduled?: boolean): Pick<Result, 'angles' | 'timedOut'> {
  const [result, setResult] = useState<Result>()
  const key = `${navigation}:${id}:${version}`
  useEffect(() => {
    if (!scheduled || id === undefined || version === undefined) return
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    const deadline = Date.now() + 15_000
    const poll = async () => {
      try {
        const { data } = await loadFeed(id, undefined, controller.signal)
        if (data.rotation_version !== undefined && data.rotation_version > version) {
          if (!controller.signal.aborted) setResult({ key, angles: { x: data.angle_x ?? 0, y: data.angle_y ?? 0 } })
          return
        }
      } catch {
        if (controller.signal.aborted) return
      }
      if (controller.signal.aborted) return
      if (Date.now() >= deadline) {
        setResult({ key, timedOut: true })
        return
      }
      timer = setTimeout(poll, 1200)
    }
    timer = setTimeout(poll, 1200)
    return () => { controller.abort(); clearTimeout(timer) }
  }, [id, key, scheduled, version])
  return scheduled && result?.key === key ? result : {}
}
