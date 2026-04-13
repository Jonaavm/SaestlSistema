import * as React from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { clearAuthSession, isAuthenticated, setAuthSession } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || 'No se pudo iniciar sesion')
      }

      setAuthSession(payload.token, payload.user)
      navigate('/', { replace: true })
    } catch (requestError) {
      clearAuthSession()
      setError(requestError.message || 'No se pudo iniciar sesion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border-[#EBE5D9]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-[#3D3325]">Iniciar sesion</CardTitle>
          <p className="text-sm text-[#8D8271]">Accede con tu usuario y contrasena</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}

            <div>
              <Label className="text-[#8D8271] mb-2 block">Usuario</Label>
              <Input
                type="text"
                value={username}
                onChange={(eventChange) => setUsername(eventChange.target.value)}
                placeholder="admin"
                className="rounded-full border-[#EBE5D9]"
                required
              />
            </div>

            <div>
              <Label className="text-[#8D8271] mb-2 block">Contrasena</Label>
              <Input
                type="password"
                value={password}
                onChange={(eventChange) => setPassword(eventChange.target.value)}
                placeholder="********"
                className="rounded-full border-[#EBE5D9]"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full rounded-full shadow-lg shadow-[#800020]/20">
              {isLoading ? 'Ingresando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
