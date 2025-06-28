
-- Modificar a tabela clientes para incluir as novas colunas necessárias
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cnpj TEXT UNIQUE;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS members INTEGER;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo'));
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'Período de teste';

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_clientes_status ON public.clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_tag ON public.clientes(tag);
CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON public.clientes(created_at);

-- Função para inativar clientes com período de teste expirado
CREATE OR REPLACE FUNCTION public.inactivate_expired_trial_clients()
RETURNS void AS $$
BEGIN
  UPDATE public.clientes 
  SET status = 'inativo'
  WHERE tag = 'Período de teste' 
    AND status = 'ativo'
    AND created_at + INTERVAL '7 days' < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar políticas RLS para incluir verificação de status
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clientes;
CREATE POLICY "Clients can view their own data" ON public.clientes
  FOR SELECT USING (
    public.get_current_user_role() = 'cliente' AND 
    id = public.get_current_user_cliente_id() AND
    status = 'ativo'
  );

-- Política para permitir inserção durante cadastro
CREATE POLICY "Users can create client profile during signup" ON public.clientes
  FOR INSERT WITH CHECK (user_id = auth.uid());
