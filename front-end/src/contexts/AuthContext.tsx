import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type User = {
  id: string
  name: string
  email: string
  role: 'Membro' | 'Admin' | 'User'
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const u = data.user
        if (u) {
          await syncProfile(u)
        }
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    init()
    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      const u = session?.user
      if (u) {
        syncProfile(u)
      } else {
        setUser(null)
      }
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const syncProfile = async (u: SupabaseUser) => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('name, cargo, role, email')
      .eq('id', u.id)
      .single()
    if (error || !profileData) {
      await supabase
        .from('profiles')
        .upsert({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário',
          cargo: 'Membro',
          role: 'Membro'
        })
    }
    const role = profileData?.cargo || profileData?.role || 'Membro'
    const name = profileData?.name || u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário'
    setUser({
      id: u.id,
      name,
      email: u.email || '',
      role: (role as User['role']) || 'Membro'
    })
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setIsLoading(false)
      return false
    }
    const u = data.user
    if (u) {
      await syncProfile(u)
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  }

  const logout = () => {
    supabase.auth.signOut()
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
