import * as React from 'react'
import { createEvent, createMovement, deleteMovement, getOverview, updateMovement } from '../lib/financialApi'

export function useFinancialOverview() {
  const [overview, setOverview] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOverview()
      setOverview(data)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  React.useEffect(() => {
    const handleUpdate = () => refresh()
    window.addEventListener('saestl:movements-updated', handleUpdate)
    return () => window.removeEventListener('saestl:movements-updated', handleUpdate)
  }, [refresh])

  const addMovement = React.useCallback(async (movement) => {
    const response = await createMovement(movement)
    window.dispatchEvent(new Event('saestl:movements-updated'))
    return response
  }, [])

  const addEvent = React.useCallback(async (eventData) => {
    const response = await createEvent(eventData)
    window.dispatchEvent(new Event('saestl:movements-updated'))
    return response
  }, [])

  const editMovement = React.useCallback(async (id, movement) => {
    const response = await updateMovement(id, movement)
    window.dispatchEvent(new Event('saestl:movements-updated'))
    return response
  }, [])

  const removeMovementById = React.useCallback(async (id) => {
    const response = await deleteMovement(id)
    window.dispatchEvent(new Event('saestl:movements-updated'))
    return response
  }, [])

  return {
    overview,
    loading,
    error,
    refresh,
    addMovement,
    addEvent,
    editMovement,
    removeMovementById,
  }
}
