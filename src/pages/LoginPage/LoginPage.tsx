import './LoginPage.css'
import { useState } from 'react'
import type { FC, FormEvent } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import axios from 'axios'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { saveToken } from '../../modules/authApi'
import { ROUTE_LABELS } from '../../Routes'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setAuthPending, setUser } from '../../store/userSlice'

// Страница входа. Запрос аутентификации — axios прямо в компоненте (без thunk и кодогенерации),
// результат передаём в Redux вручную. После setUser маршрут в App.tsx сам перенаправит на плитку.
export const LoginPage: FC = () => {
  const dispatch = useAppDispatch()
  const sessionExpired = useAppSelector((state) => state.user.sessionExpired)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    dispatch(setAuthPending(true))
    try {
      // Вызов метода аутентификации веб-сервиса: POST /api/users/login через прокси Vite
      const { data } = await axios.post<{ access_token: string }>('/api/users/login', { username, password })
      saveToken(data.access_token) // JWT -> localStorage
      dispatch(setUser(username)) // состояние приложения меняем вручную
    } catch (reason) {
      // Mock здесь не используется: без веб-сервиса войти нельзя
      setError(
        axios.isAxiosError(reason) && reason.response?.status === 401
          ? 'Неверный логин или пароль'
          : 'Сервис недоступен. Попробуйте позже.',
      )
    } finally {
      dispatch(setAuthPending(false))
    }
  }

  return (
    <div className="loginPage">
      <header className="pageHeader">
        <Breadcrumbs crumbs={[{ label: ROUTE_LABELS.LOGIN }]} />
        <div className="pageHeaderRow">
          <h1 className="pageTitle">{ROUTE_LABELS.LOGIN}</h1>
        </div>
      </header>

      <Form className="formCard loginForm" onSubmit={handleSubmit}>
        {sessionExpired && !error && <Alert variant="warning">Сессия истекла. Войдите снова.</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group controlId="login-username">
          <Form.Label>Логин</Form.Label>
          <Form.Control
            required
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="login-password">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Form.Group>
        <Button type="submit" className="formCardSubmit">Войти</Button>
      </Form>
    </div>
  )
}
