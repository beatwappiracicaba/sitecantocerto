# Supabase Configuration

Para configurar o Supabase em produção, você precisa definir as seguintes variáveis de ambiente:

## Variáveis Necessárias

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Como Configurar

### 1. Cloudflare Pages
1. Vá para o painel do Cloudflare Pages
2. Selecione seu projeto
3. Vá para Settings → Environment variables
4. Adicione as variáveis acima

### 2. Vercel
1. Vá para o painel do Vercel
2. Selecione seu projeto
3. Vá para Settings → Environment Variables
4. Adicione as variáveis acima

### 3. Netlify
1. Vá para o painel do Netlify
2. Selecione seu projeto
3. Vá para Site settings → Build & deploy → Environment
4. Adicione as variáveis acima

### 4. Desenvolvimento Local
Crie um arquivo `.env` na raiz do projeto `front-end` com:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Obter as Credenciais do Supabase

1. Acesse seu projeto no Supabase
2. Vá para Settings → API
3. Copie a URL do projeto (Project URL)
4. Copie a chave anônima (anon key)