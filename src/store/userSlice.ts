import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Состояние интерфейса после авторизации. Запросы входа и выхода делают компоненты через axios
// (LoginPage, AppNavbar) и передают результат сюда вручную обычными действиями — без thunk и кодогенерации.
// Состояние не сохраняется: после F5 интерфейс снова гостевой, хотя токен остаётся в localStorage.
interface UserState {
  isAuth: boolean
  username: string
  authPending: boolean // идёт запрос входа или выхода
  sessionExpired: boolean // бэкенд ответил 401: срок токена истёк
}

const initialState: UserState = {
  isAuth: false,
  username: '',
  authPending: false,
  sessionExpired: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<string>) {
      state.isAuth = true
      state.username = action.payload
      state.sessionExpired = false
    },
    // true в payload — пользователя вывел не он сам, а истёкший токен
    clearUser(state, action: PayloadAction<boolean | undefined>) {
      state.isAuth = false
      state.username = ''
      state.sessionExpired = action.payload === true
    },
    setAuthPending(state, action: PayloadAction<boolean>) {
      state.authPending = action.payload
    },
  },
})

export const { setUser, clearUser, setAuthPending } = userSlice.actions
export default userSlice.reducer
