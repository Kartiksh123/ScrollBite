export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.'
  if (!error.response) return 'Cannot reach the server. Check that the backend is running and try again.'
  return fallback
}
