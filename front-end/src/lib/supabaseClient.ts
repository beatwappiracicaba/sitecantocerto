import { createClient } from '@supabase/supabase-js'

// Obter variáveis de ambiente com fallback para evitar erros em produção
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Criar cliente Supabase ou mock baseado na configuração
let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key não configurados. Usando cliente mock para desenvolvimento.')
  
  // Criar um cliente mock para desenvolvimento
  supabase = {
    auth: {
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase não configurado') }),
      signOut: async () => ({ data: null, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      upsert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) })
    })
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }