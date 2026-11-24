import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

function chartModel() {
  const group = new THREE.Group()
  const bars = [0.85, 1.4, 2.1, 2.8]
  bars.forEach((height, index) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, height, 0.75),
      new THREE.MeshStandardMaterial({ color: index < 2 ? '#f0a563' : '#50d2b2', roughness: 0.36 }),
    )
    bar.position.set(index * 0.75 - 1.125, (height - 2.8) / 2, 0)
    group.add(bar)
  })
  const axis = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.12, 1.25), new THREE.MeshStandardMaterial({ color: '#87a8c7' }))
  axis.position.y = -1.46
  group.add(axis)
  return group
}

function dispose(object: THREE.Object3D) {
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry.dispose()
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) materials.add(material)
  })
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value instanceof THREE.Texture) textures.add(value)
    }
    material.dispose()
  }
  for (const texture of textures) texture.dispose()
}

type Props = { url?: string; x?: number; y?: number; className?: string }

export default function ModelViewer({ url, x = 0, y = 0, className }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const pose = useRef({ x, y })
  const [message, setMessage] = useState('')
  useEffect(() => { pose.current = { x, y } }, [x, y])

  useEffect(() => {
    const container = host.current
    if (!container) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      const report = setTimeout(() => setMessage('3D-просмотр недоступен в этом браузере.'), 0)
      return () => clearTimeout(report)
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.prepend(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30)
    camera.position.set(0, 0.35, 7.5)
    camera.lookAt(0, 0, 0)
    scene.add(new THREE.HemisphereLight('#e7f8ff', '#7c90ab', 2.5))
    const key = new THREE.DirectionalLight('#ffffff', 3)
    key.position.set(4, 7, 5)
    scene.add(key)
    const pivot = new THREE.Group()
    let model: THREE.Object3D = chartModel()
    pivot.add(model)
    scene.add(pivot)
    const resize = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = container
      if (!w || !h) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.position.z = Math.max(6, 6 / camera.aspect)
      camera.updateProjectionMatrix()
    })
    resize.observe(container)
    const controller = new AbortController()
    if (url) {
      const manager = new THREE.LoadingManager()
      // GLB contains its own assets. Permit object URLs from embedded textures.
      manager.setURLModifier((asset) => {
        if (/^(blob:|data:)/.test(asset)) return asset
        throw new Error('Внешняя зависимость модели')
      })
      void fetch(url, { signal: controller.signal }).then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.arrayBuffer()
      }).then((bytes) => new GLTFLoader(manager).parseAsync(bytes, '')).then(({ scene: loaded }) => {
        if (controller.signal.aborted) { dispose(loaded); return }
        const box = new THREE.Box3().setFromObject(loaded)
        const size = box.getSize(new THREE.Vector3())
        const extent = Math.max(size.x, size.y, size.z)
        if (!Number.isFinite(extent) || extent <= 0) { dispose(loaded); throw new Error('Пустая модель') }
        loaded.position.sub(box.getCenter(new THREE.Vector3()))
        const fitted = new THREE.Group()
        fitted.add(loaded)
        fitted.scale.setScalar(3 / extent)
        pivot.remove(model)
        dispose(model)
        model = fitted
        pivot.add(model)
      }).catch(() => {
        if (!controller.signal.aborted) setMessage('Файл недоступен. Показана схема затрат.')
      })
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const draw = () => {
      const approach = (current: number, degrees: number) => {
        const target = THREE.MathUtils.degToRad(degrees)
        return reducedMotion ? target : current + Math.atan2(Math.sin(target - current), Math.cos(target - current)) * 0.13
      }
      pivot.rotation.x = approach(pivot.rotation.x, pose.current.x)
      pivot.rotation.y = approach(pivot.rotation.y, pose.current.y)
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(draw)
    return () => {
      controller.abort()
      resize.disconnect()
      renderer.setAnimationLoop(null)
      dispose(model)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [url])

  return <div ref={host} className={className} aria-label="Трёхмерная модель вида затрат">
    {message && <span className="modelMessage" role="status">{message}</span>}
  </div>
}
