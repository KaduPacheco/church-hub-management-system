
-- Primeiro, remover todas as políticas RLS que dependem da função
DROP POLICY IF EXISTS "Superadmins podem ver todos os clientes" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem ver apenas seus dados" ON public.clientes;
DROP POLICY IF EXISTS "Superadmins podem ver todas as igrejas" ON public.igrejas;
DROP POLICY IF EXISTS "Clientes podem ver suas igrejas" ON public.igrejas;
DROP POLICY IF EXISTS "Admins de igreja podem ver sua igreja" ON public.igrejas;
DROP POLICY IF EXISTS "Superadmins podem ver todos os usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Clientes podem ver usuários de suas igrejas" ON public.usuarios;

-- Agora remover a função problemática
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- Criar políticas RLS mais simples para evitar recursão
-- Política básica para tabela usuarios
CREATE POLICY "Usuarios podem ver seus proprios dados" ON public.usuarios
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Sistema pode inserir usuarios" ON public.usuarios
  FOR INSERT WITH CHECK (true);

-- Políticas básicas para clientes (permitir acesso geral por enquanto)
CREATE POLICY "Usuarios autenticados podem ver clientes" ON public.clientes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas básicas para igrejas (permitir acesso geral por enquanto)
CREATE POLICY "Usuarios autenticados podem ver igrejas" ON public.igrejas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados podem inserir igrejas" ON public.igrejas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados podem atualizar igrejas" ON public.igrejas
  FOR UPDATE USING (auth.uid() IS NOT NULL);
