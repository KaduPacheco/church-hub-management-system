
-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Usuarios autenticados podem ver clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuarios autenticados podem ver igrejas" ON public.igrejas;
DROP POLICY IF EXISTS "Usuarios autenticados podem inserir igrejas" ON public.igrejas;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar igrejas" ON public.igrejas;
DROP POLICY IF EXISTS "Usuarios podem ver seus proprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Sistema pode inserir usuarios" ON public.usuarios;

-- Create security definer functions to safely check user roles and permissions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_cliente_id()
RETURNS uuid AS $$
  SELECT cliente_id FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_igreja_id()
RETURNS uuid AS $$
  SELECT igreja_id FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_has_church_access(church_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid() 
    AND (
      u.role = 'superadmin' OR
      (u.role = 'cliente' AND u.cliente_id = (SELECT cliente_id FROM public.igrejas WHERE id = church_id)) OR
      (u.role = 'admin_igreja' AND u.igreja_id = church_id)
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Implement strict RLS policies for clientes table
CREATE POLICY "Superadmins can manage all clients" ON public.clientes
  FOR ALL USING (public.get_current_user_role() = 'superadmin');

CREATE POLICY "Clients can view their own data" ON public.clientes
  FOR SELECT USING (
    public.get_current_user_role() = 'cliente' AND 
    id = public.get_current_user_cliente_id()
  );

-- Implement strict RLS policies for igrejas table
CREATE POLICY "Superadmins can manage all churches" ON public.igrejas
  FOR ALL USING (public.get_current_user_role() = 'superadmin');

CREATE POLICY "Clients can view their churches" ON public.igrejas
  FOR SELECT USING (
    public.get_current_user_role() = 'cliente' AND 
    cliente_id = public.get_current_user_cliente_id()
  );

CREATE POLICY "Clients can manage their churches" ON public.igrejas
  FOR ALL USING (
    public.get_current_user_role() = 'cliente' AND 
    cliente_id = public.get_current_user_cliente_id()
  );

CREATE POLICY "Church admins can view their church" ON public.igrejas
  FOR SELECT USING (
    public.get_current_user_role() = 'admin_igreja' AND 
    id = public.get_current_user_igreja_id()
  );

CREATE POLICY "Church admins can update their church" ON public.igrejas
  FOR UPDATE USING (
    public.get_current_user_role() = 'admin_igreja' AND 
    id = public.get_current_user_igreja_id()
  );

-- Implement strict RLS policies for usuarios table
CREATE POLICY "Superadmins can manage all users" ON public.usuarios
  FOR ALL USING (public.get_current_user_role() = 'superadmin');

CREATE POLICY "Users can view their own profile" ON public.usuarios
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.usuarios
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Clients can view users in their churches" ON public.usuarios
  FOR SELECT USING (
    public.get_current_user_role() = 'cliente' AND 
    cliente_id = public.get_current_user_cliente_id()
  );

CREATE POLICY "System can insert new users during signup" ON public.usuarios
  FOR INSERT WITH CHECK (id = auth.uid());
