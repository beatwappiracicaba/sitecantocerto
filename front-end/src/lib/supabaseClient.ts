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
    from: (tableName: string) => ({
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options: any = {}) => ({
            order: (column2: string, options2: any = {}) => ({
              data: [],
              error: null
            }),
            data: [],
            error: null
          })
        }),
        order: (column: string, options: any = {}) => ({
          order: (column2: string, options2: any = {}) => ({
            data: [],
            error: null
          }),
          data: [],
          error: null
        })
      }),
      insert: (values: any) => ({
        select: (columns = '*') => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      upsert: (values: any) => ({
        select: (columns = '*') => ({
          single: async () => ({ data: null, error: null })
        })
      })
    }),
    storage: {
      from: (bucketId: string) => ({
        list: async (path = '', options = {}) => ({
          data: [
            { name: 'mock-image-1.jpg' },
            { name: 'mock-image-2.jpg' },
            { name: 'mock-image-3.jpg' }
          ],
          error: null
        }),
        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: '/images/casadeshow.png'
          }
        })
      })
    }
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
