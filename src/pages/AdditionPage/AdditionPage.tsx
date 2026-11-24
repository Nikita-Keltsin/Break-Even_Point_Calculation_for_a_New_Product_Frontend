import './AdditionPage.css'
import { lazy, Suspense, useEffect, useState } from 'react'
import type { ChangeEvent, FC, FormEvent } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { StatusBanner } from '../../components/StatusBanner/StatusBanner'
import { DEFAULT_IMAGE } from '../../modules/media'
import type { Cost } from '../../modules/types'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import { createCost, fetchDraft, publishCost } from '../../store/costsSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const ModelViewer = lazy(() => import('../../components/ModelViewer/ModelViewer'))

// Временная ссылка на выбранный файл для предпросмотра
const useFilePreview = () => {
  const [selection, setSelection] = useState<{ file: File; url: string }>()
  const url = selection?.url
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelection(file ? { file, url: URL.createObjectURL(file) } : undefined)
  }
  return { file: selection?.file ?? null, url, pick }
}

// Шаг 1: название, фото и видео -> создаётся черновик
const NewCostForm: FC = () => {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const image = useFilePreview()
  const model = useFilePreview()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    dispatch(createCost({ name, image: image.file, model: model.file }))
  }

  return (
    <Form className="formCard" onSubmit={handleSubmit}>
      <Form.Group controlId="cost-image">
        <Form.Label>Фото</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={image.pick} />
        {image.url && <img className="additionPreview" src={image.url} alt="Предпросмотр фото" />}
      </Form.Group>
      <Form.Group controlId="cost-model">
        <Form.Label>3D-модель (.glb)</Form.Label>
        <Form.Control type="file" accept=".glb,model/gltf-binary" onChange={model.pick} />
        {model.url && <Suspense fallback="Загрузка модели…"><ModelViewer key={model.url} className="additionModel" url={model.url} /></Suspense>}
        <Form.Text>GLB версии 2, до 20 МиБ. Без файла будет показана стандартная модель.</Form.Text>
      </Form.Group>
      <Form.Group controlId="cost-name">
        <Form.Label>Название вида затрат</Form.Label>
        <Form.Control
          required
          placeholder="Например: Аренда помещения"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Form.Group>
      <Button type="submit" className="formCardSubmit">Далее</Button>
    </Form>
  )
}

// Шаг 2: черновик уже есть -> описание и два поля по теме -> публикация
const DraftForm: FC<{ draft: Cost }> = ({ draft }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [description, setDescription] = useState(draft.short_description)
  const [amount, setAmount] = useState(draft.amount_monthly?.toString() ?? '')
  const [isFixed, setIsFixed] = useState(draft.is_fixed ?? false)
  const [imageFailed, setImageFailed] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await dispatch(publishCost({
        id: draft.id,
        short_description: description,
        amount_monthly: Number(amount),
        is_fixed: isFixed,
      })).unwrap()
      navigate(ROUTES.COSTS)
    } catch {
      // Текст ошибки уже в Redux, его показывает StatusBanner; остаёмся на форме
    }
  }

  return (
    <Form className="formCard" onSubmit={handleSubmit}>
      <img
        className="additionPreview"
        src={draft.image_url && !imageFailed ? draft.image_url : DEFAULT_IMAGE}
        alt="Фото черновика"
        onError={() => setImageFailed(true)}
      />
      <Suspense fallback="Загрузка модели…">
        <ModelViewer className="additionModel" url={draft.model_url} x={draft.angle_x} y={draft.angle_y} />
      </Suspense>
      <Form.Group controlId="draft-name">
        <Form.Label>Название вида затрат</Form.Label>
        <Form.Control readOnly value={draft.cost_name} />
      </Form.Group>
      <Form.Group controlId="draft-description">
        <Form.Label>Краткое описание</Form.Label>
        <Form.Control
          required
          as="textarea"
          rows={3}
          placeholder="Что входит в эти затраты"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="draft-amount">
        <Form.Label>Сумма затрат, ₽/мес</Form.Label>
        <Form.Control
          required
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Form.Group>
      <Form.Check
        type="checkbox"
        id="draft-fixed"
        label="Постоянные затраты (не зависят от объёма выпуска)"
        checked={isFixed}
        onChange={(event) => setIsFixed(event.target.checked)}
      />
      <Button type="submit" className="formCardSubmit">Опубликовать</Button>
    </Form>
  )
}

// Страница добавления вида затрат — два шага, как addition.html из ЛР1.
// Какой шаг показать, решает наличие черновика: у пользователя он не более чем один.
export const AdditionPage: FC = () => {
  const dispatch = useAppDispatch()
  const draft = useAppSelector((state) => state.costs.draft)

  useEffect(() => {
    const request = dispatch(fetchDraft())
    return () => request.abort()
  }, [dispatch])

  return (
    <div className="additionPage">
      <header className="pageHeader">
        <Breadcrumbs crumbs={[{ label: ROUTE_LABELS.ADDITION }]} />
        <div className="pageHeaderRow">
          <h1 className="pageTitle">{ROUTE_LABELS.ADDITION}</h1>
        </div>
      </header>

      <div className="additionBody">
        <StatusBanner />
        {draft ? <DraftForm key={draft.id} draft={draft} /> : <NewCostForm />}
      </div>
    </div>
  )
}
