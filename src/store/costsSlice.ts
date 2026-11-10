import { createAsyncThunk, createSlice, isPending, isRejected, isFulfilled } from '@reduxjs/toolkit'
import axios from 'axios'
import { api } from '../api'
import { forgetToken } from '../modules/authApi'
import { getMockCosts, getMockFeedCost } from '../modules/mock'
import { toCost } from '../modules/toCost'
import type { Cost, CostFilters } from '../modules/types'
import { AMOUNT_MAX, AMOUNT_MIN } from '../modules/types'
import type { AppDispatch, RootState } from './index'
import { clearUser } from './userSlice'

interface CostsState {
  list: Cost[] // плитка
  listStatus: 'loading' | 'ready'
  feedCost: Cost | null // карточка ленты, null — не найдена
  feedStatus: 'loading' | 'ready'
  draft: Cost | null // черновик текущего пользователя
  pendingCount: number // сколько запросов выполняется: пока > 0, кнопки заблокированы
  error: string | null
  usingMock: boolean // данные взяты из mock, потому что веб-сервис недоступен
}

const initialState: CostsState = {
  list: [],
  listStatus: 'loading',
  feedCost: null,
  feedStatus: 'loading',
  draft: null,
  pendingCount: 0,
  error: null,
  usingMock: false,
}

const createCostsThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
}>()

// Прокси Vite отвечает кодом 5xx (502), когда веб-сервис не запущен
const isServiceUnavailable = (error: unknown) =>
  axios.isAxiosError(error) && !axios.isCancel(error) && (!error.response || error.response.status >= 500)

const isNotFound = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404

const errorMessage = (error: unknown) => {
  if (isServiceUnavailable(error)) return 'Сервис недоступен. Попробуйте позже.'
  if (axios.isAxiosError(error) && error.response?.status === 403) return 'Нет прав на это действие.'
  if (axios.isAxiosError(error) && error.response?.status === 404) return 'Вид затрат не найден или уже удалён.'
  if (axios.isAxiosError(error) && error.response?.status === 409) return 'У вас уже есть черновик.'
  return 'Не удалось выполнить запрос.'
}

// Общая обработка ошибки для thunk. 401 значит, что токен истёк: возвращаемся к гостю.
const failWith = <R,>(
  error: unknown,
  { dispatch, rejectWithValue }: { dispatch: AppDispatch; rejectWithValue: (value: string) => R },
): R => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    forgetToken()
    dispatch(clearUser(true))
    return rejectWithValue('Сессия истекла. Войдите снова.')
  }
  return rejectWithValue(errorMessage(error))
}

// Фильтр из Redux -> параметры запроса. Значения по умолчанию не отправляем.
// Выбраны оба вида или ни одного — фильтр по виду не нужен.
const toCostsQuery = ({ kinds, minAmount, maxAmount }: CostFilters) => ({
  min_amount: minAmount > AMOUNT_MIN ? minAmount : undefined,
  max_amount: maxAmount < AMOUNT_MAX ? maxAmount : undefined,
  is_fixed: kinds.length === 1 ? (kinds[0] === 'fixed' ? (1 as const) : (0 as const)) : undefined,
})

// ===== Thunk: обращения к домену услуг через код, сгенерированный из Swagger (api.api.*) =====

// GET /api/breakeven_point — плитка с фильтром из Redux. Гость без сервиса получает mock.
export const fetchCosts = createCostsThunk<{ costs: Cost[]; usingMock: boolean }, void>(
  'costs/fetchCosts',
  async (_, thunkApi) => {
    const { filters, user } = thunkApi.getState()
    try {
      const { data } = await api.api.breakevenPointList(toCostsQuery(filters), { signal: thunkApi.signal })
      return { costs: data.map(toCost), usingMock: false }
    } catch (error) {
      if (!user.isAuth && isServiceUnavailable(error)) {
        return { costs: getMockCosts(filters), usingMock: true }
      }
      return failWith(error, thunkApi)
    }
  },
)

// GET /api/breakeven_point/feed — одна карточка ленты. 404 — карточки нет, это не ошибка.
export const fetchFeedCost = createCostsThunk<
  { cost: Cost | null; usingMock: boolean },
  { id?: number; next?: boolean }
>('costs/fetchFeedCost', async ({ id, next }, thunkApi) => {
  // Адрес вроде /feed/abc: бэкенд принял бы его за «первую карточку»
  if (id !== undefined && !(id > 0)) return { cost: null, usingMock: false }
  try {
    const { data } = await api.api.breakevenPointFeedList({ id, next }, { signal: thunkApi.signal })
    return { cost: toCost(data), usingMock: false }
  } catch (error) {
    if (isNotFound(error)) return { cost: null, usingMock: false }
    if (!thunkApi.getState().user.isAuth && isServiceUnavailable(error)) {
      return { cost: getMockFeedCost(id, next), usingMock: true }
    }
    return failWith(error, thunkApi)
  }
})

// GET /api/breakeven_point/draft — черновик пользователя. 404 — черновика нет, это не ошибка.
export const fetchDraft = createCostsThunk<Cost | null, void>('costs/fetchDraft', async (_, thunkApi) => {
  try {
    const { data } = await api.api.breakevenPointDraftList({ signal: thunkApi.signal })
    return toCost(data)
  } catch (error) {
    if (isNotFound(error)) return null
    return failWith(error, thunkApi)
  }
})

// POST /api/breakeven_point — создание черновика с фото и видео (multipart/form-data)
export const createCost = createCostsThunk<Cost, { name: string; image: File | null; video: File | null }>(
  'costs/createCost',
  async ({ name, image, video }, thunkApi) => {
    try {
      // Пустые файлы в объект не кладём: генератор записал бы их в форму строкой "undefined"
      const { data } = await api.api.breakevenPointCreate({
        name,
        ...(image ? { image } : {}),
        ...(video ? { video } : {}),
      })
      return toCost(data)
    } catch (error) {
      return failWith(error, thunkApi)
    }
  },
)

// PUT /api/breakeven_point/:id/publish — публикация черновика
export const publishCost = createCostsThunk<
  Cost,
  { id: number; short_description: string; amount_monthly: number; is_fixed: boolean }
>('costs/publishCost', async ({ id, ...body }, thunkApi) => {
  try {
    const { data } = await api.api.breakevenPointPublishUpdate(id, body)
    return toCost(data)
  } catch (error) {
    return failWith(error, thunkApi)
  }
})

// DELETE /api/breakeven_point/:id — удаление своей услуги
export const deleteCost = createCostsThunk<number, number>('costs/deleteCost', async (id, thunkApi) => {
  try {
    await api.api.breakevenPointDelete(id)
    return id
  } catch (error) {
    return failWith(error, thunkApi)
  }
})

// POST /api/breakeven_point/:id/like — поставить или снять лайк
export const likeCost = createCostsThunk<
  { id: number; isLiked: boolean; likesCount: number },
  { id: number; like: boolean }
>('costs/likeCost', async ({ id, like }, thunkApi) => {
  try {
    const { data } = await api.api.breakevenPointLikeCreate(id, { like: like ? 1 : 0 })
    return { id, isLiked: data.is_liked === 1, likesCount: data.likes_count ?? 0 }
  } catch (error) {
    return failWith(error, thunkApi)
  }
})

const costsThunks = [fetchCosts, fetchFeedCost, fetchDraft, createCost, publishCost, deleteCost, likeCost] as const

const costsSlice = createSlice({
  name: 'costs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCosts.pending, (state) => {
        state.listStatus = 'loading'
      })
      .addCase(fetchCosts.fulfilled, (state, action) => {
        state.list = action.payload.costs
        state.usingMock = action.payload.usingMock
        state.listStatus = 'ready'
      })
      .addCase(fetchCosts.rejected, (state, action) => {
        if (action.meta.aborted) return // запрос устарел: фильтр изменился или страницу закрыли
        state.list = []
        state.listStatus = 'ready'
      })
      .addCase(fetchFeedCost.pending, (state) => {
        state.feedStatus = 'loading'
      })
      .addCase(fetchFeedCost.fulfilled, (state, action) => {
        state.feedCost = action.payload.cost
        state.usingMock = action.payload.usingMock
        state.feedStatus = 'ready'
      })
      .addCase(fetchFeedCost.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.feedCost = null
        state.feedStatus = 'ready'
      })
      .addCase(fetchDraft.fulfilled, (state, action) => {
        state.draft = action.payload
      })
      .addCase(createCost.fulfilled, (state, action) => {
        state.draft = action.payload
      })
      .addCase(publishCost.fulfilled, (state) => {
        state.draft = null
      })
      .addCase(deleteCost.fulfilled, (state, action) => {
        state.list = state.list.filter((cost) => cost.id !== action.payload)
      })
      .addCase(likeCost.fulfilled, (state, action) => {
        const { id, isLiked, likesCount } = action.payload
        if (state.feedCost?.id === id) {
          state.feedCost.is_liked = isLiked
          state.feedCost.likes_count = likesCount
        }
      })
      .addCase(clearUser, (state) => {
        state.draft = null
      })
      // Общий счётчик запросов и текст ошибки для всех thunk
      .addMatcher(isPending(...costsThunks), (state) => {
        state.pendingCount += 1
        state.error = null
      })
      .addMatcher(isFulfilled(...costsThunks), (state) => {
        state.pendingCount -= 1
      })
      .addMatcher(isRejected(...costsThunks), (state, action) => {
        state.pendingCount -= 1
        if (!action.meta.aborted) state.error = (action.payload as string | undefined) ?? 'Не удалось выполнить запрос.'
      })
  },
})

export default costsSlice.reducer
