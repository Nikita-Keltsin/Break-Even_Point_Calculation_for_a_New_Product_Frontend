import { configureStore } from '@reduxjs/toolkit'
import costsReducer from './costsSlice'
import filtersReducer from './filtersSlice'
import userReducer from './userSlice'

// Хранилище приложения. Thunk middleware и Redux DevTools configureStore подключает сам.
export const store = configureStore({
  reducer: {
    user: userReducer,
    filters: filtersReducer,
    costs: costsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Выполняется запрос: страница показывает анимацию и блокирует кнопки
export const selectIsBusy = (state: RootState) => state.costs.pendingCount > 0 || state.user.authPending
