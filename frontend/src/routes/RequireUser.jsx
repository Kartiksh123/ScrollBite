import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { Navigate, useLocation } from 'react-router-dom'
import { getApiErrorMessage } from '../utils/apiError'

const RequireUser = ({ children }) => {
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')
  const location = useLocation()

  useEffect(() => {
    let active = true
    api.get('/api/auth/user/me')
      .then(() => { if (active) setStatus('allowed') })
      .catch((requestError) => {
        if (!active) return
        if (requestError.response?.status === 401) setStatus('signed-out')
        else { setError(getApiErrorMessage(requestError, 'Unable to verify your session.')); setStatus('error') }
      })
    return () => { active = false }
  }, [])

  if (status === 'checking') return <div className="feed-status">Checking your session...</div>
  if (status === 'signed-out') return <Navigate to="/user/login" replace state={{ from: location.pathname }} />
  if (status === 'error') return <div className="feed-status" role="alert">{error}<button onClick={() => window.location.reload()}>Try again</button></div>
  return children
}

export default RequireUser
