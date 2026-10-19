import axios from 'axios'

const browserHost = window.location.hostname
const isLoopback = browserHost === 'localhost' || browserHost === '127.0.0.1'
const localNetworkHost = isLoopback ? 'localhost' : browserHost
const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : `http://${localNetworkHost}:3000`)

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
})
