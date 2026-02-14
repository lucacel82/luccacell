

# Sistema de Login e Associacao de Dados

## Objetivo
Ativar o sistema de login (que ja existe no codigo mas nao esta conectado) e associar todos os dados existentes (vendas e produtos) a conta do usuario apos o primeiro login.

## Etapas

### 1. Migracao no Banco de Dados
- Adicionar coluna `user_id` na tabela `produtos` (a tabela `vendas` ja possui)
- Atualizar as politicas RLS de ambas as tabelas (`vendas` e `produtos`) para restringir acesso por usuario autenticado
- Manter politica temporaria que permite ao usuario autenticado "reivindicar" registros orfaos (onde `user_id IS NULL`)

### 2. Ativar Autenticacao no App
- Envolver o App com o `AuthProvider` (ja existe em `src/components/AuthProvider.tsx`)
- Proteger as rotas `/` e `/chefe` com o `ProtectedRoute` (ja existe em `src/components/ProtectedRoute.tsx`)
- Adicionar a rota `/auth` apontando para a pagina de login (ja existe em `src/pages/Auth.tsx`)

### 3. Migrar Dados Existentes ao Primeiro Login
- Criar um efeito que, apos o usuario fazer login, execute um UPDATE nas tabelas `vendas` e `produtos` para associar todos os registros com `user_id IS NULL` ao `auth.uid()` do usuario logado
- Isso garante que os dados ja cadastrados nao sejam perdidos

### 4. Atualizar Hooks de Dados
- `useSales.ts`: incluir `user_id` do usuario logado ao inserir novas vendas
- `useProducts.ts`: incluir `user_id` do usuario logado ao inserir novos produtos e filtrar por usuario nas consultas
- `useDashboardData.ts` e demais hooks: garantir que as queries ja funcionam corretamente com os dados filtrados por RLS

### 5. Adicionar Botao de Logout
- Adicionar um botao de logout no header da pagina principal (`Index.tsx`) para o usuario poder sair da conta

---

## Detalhes Tecnicos

### Migracao SQL
```sql
-- Adicionar user_id em produtos
ALTER TABLE public.produtos ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Remover politicas publicas antigas de vendas
DROP POLICY IF EXISTS "Allow public read access to vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public insert access to vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public update access to vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public delete access to vendas" ON public.vendas;

-- Novas politicas para vendas (por usuario)
CREATE POLICY "Users can view own vendas" ON public.vendas FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can insert own vendas" ON public.vendas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own vendas" ON public.vendas FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can delete own vendas" ON public.vendas FOR DELETE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

-- Remover politicas publicas antigas de produtos
DROP POLICY IF EXISTS "Allow public read access to produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow public insert access to produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow public update access to produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow public delete access to produtos" ON public.produtos;

-- Novas politicas para produtos (por usuario)
CREATE POLICY "Users can view own produtos" ON public.produtos FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can insert own produtos" ON public.produtos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own produtos" ON public.produtos FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can delete own produtos" ON public.produtos FOR DELETE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
```

### Logica de Reivindicacao de Dados
Ao detectar o primeiro login, executar:
```typescript
await supabase.from('vendas').update({ user_id: user.id }).is('user_id', null);
await supabase.from('produtos').update({ user_id: user.id }).is('user_id', null);
```

### Arquivos Modificados
- `src/App.tsx` - adicionar AuthProvider, ProtectedRoute e rota /auth
- `src/hooks/useSales.ts` - incluir user_id nas insercoes
- `src/hooks/useProducts.ts` - incluir user_id nas insercoes
- `src/pages/Index.tsx` - adicionar botao de logout no header

### Arquivos Ja Existentes (sem alteracao)
- `src/hooks/useAuth.ts`
- `src/components/AuthProvider.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/pages/Auth.tsx`
