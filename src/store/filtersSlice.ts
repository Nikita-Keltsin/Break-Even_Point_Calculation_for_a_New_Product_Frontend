import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_FILTERS } from '../modules/types'
import type { CostFilters } from '../modules/types'
import { clearUser } from './userSlice'

// Значения полей фильтра услуг: вид затрат и диапазон суммы. Каждое изменение галочки или
// ползунка сразу попадает сюда, поэтому поля сохраняют значения при переходе между страницами.
// Thunk fetchCosts берёт фильтр отсюда, когда пользователь нажимает «Применить».
const filtersSlice = createSlice({
  name: 'filters',
  initialState: DEFAULT_FILTERS,
  reducers: {
    setFilters: (_state, action: PayloadAction<CostFilters>) => ({ ...action.payload }),
    resetFilters: () => ({ ...DEFAULT_FILTERS }),
  },
  // При выходе фильтр пользователя сбрасывается
  extraReducers: (builder) => {
    builder.addCase(clearUser, () => ({ ...DEFAULT_FILTERS }))
  },
})

export const { setFilters, resetFilters } = filtersSlice.actions
export default filtersSlice.reducer
