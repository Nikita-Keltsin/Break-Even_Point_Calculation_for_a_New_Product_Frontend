import { api } from '../api'

// Хранение JWT. Сами запросы входа и выхода делают компоненты через axios
// (LoginPage и AppNavbar) и передают результат в Redux вручную — без thunk и кодогенерации.
// localStorage используется только для JWT.

const TOKEN_KEY = 'access_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

// После входа: токен в localStorage и в сгенерированный клиент (для запросов к услугам)
export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
  api.setSecurityData(token)
}

// Токен больше не действует (выход или истёк срок)
export const forgetToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  api.setSecurityData(null)
}
