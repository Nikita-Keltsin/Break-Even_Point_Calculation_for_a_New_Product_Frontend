import { Api } from './Api'

// Единственный экземпляр клиента, сгенерированного из Swagger (npm run generate:api).
//
// baseURL '/' — запросы идут на свой адрес и попадают в прокси Vite, а не на хост из Swagger
// (прямое обращение к localhost:8080 браузер запретил бы из-за CORS).
//
// secure: true — токен нужен всем запросам. В Swagger чтение (список, лента) не отмечено
// как защищённое, но с токеном бэкенд заполняет в нём is_mine и is_liked.
//
// Токен передаётся через setSecurityData и живёт только в памяти, как и состояние Redux:
// после F5 запросы уходят как от гостя, хотя токен остаётся в localStorage.
export const api = new Api<string>({
  baseURL: '/',
  secure: true,
  securityWorker: (token) => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
})
