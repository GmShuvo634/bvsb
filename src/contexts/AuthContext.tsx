// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react'
import axios from '@/lib/axios'

interface AuthContextType {
  token: string | null
  login: (newToken: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  })

  useEffect(() => {
    // attach token to all requests
    axios.defaults.headers.common['Authorization'] = token
      ? `Bearer ${token}`
      : ''
  }, [token])

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
