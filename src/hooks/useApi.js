import { useState, useCallback } from 'react'

export const useApi = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle')
  const [value, setValue] = useState(null)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...params) => {
      setStatus('pending')
      setValue(null)
      setError(null)
      try {
        const response = await asyncFunction(...params)
        setValue(response)
        setStatus('success')
        return response
      } catch (err) {
        setError(err)
        setStatus('error')
        throw err
      }
    },
    [asyncFunction]
  )

  return { execute, status, value, error }
}

export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState(immediate ? 'pending' : 'idle')
  const [value, setValue] = useState(null)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setValue(null)
    setError(null)
    try {
      const response = await asyncFunction()
      setValue(response)
      setStatus('success')
      return response
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [asyncFunction])

  React.useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, value, error }
}
