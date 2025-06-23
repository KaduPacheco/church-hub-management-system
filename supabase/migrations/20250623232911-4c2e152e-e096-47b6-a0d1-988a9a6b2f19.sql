
-- Criar enum para as roles do sistema
CREATE TYPE public.user_role AS ENUM ('superadmin', 'cliente', 'admin_igreja');

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de igrejas
CREATE TABLE public.igrejas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  endereco TEXT,
  tipo TEXT CHECK (tipo IN ('matriz', 'filial')) DEFAULT 'filial',
  pastor_nome TEXT,
  pastor_email TEXT,
  membros INTEGER DEFAULT 0,
  eventos INTEGER DEFAULT 0,
  receitas DECIMAL(10,2) DEFAULT 0,
  despesas DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de usuários com roles
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  igreja_id UUID REFERENCES public.igrejas(id) ON DELETE CASCADE,
  nome TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints para garantir integridade dos dados
  CONSTRAINT check_superadmin_no_refs CHECK (
    role != 'superadmin' OR (cliente_id IS NULL AND igreja_id IS NULL)
  ),
  CONSTRAINT check_cliente_has_cliente_id CHECK (
    role != 'cliente' OR (cliente_id IS NOT NULL AND igreja_id IS NULL)
  ),
  CONSTRAINT check_admin_igreja_has_igreja_id CHECK (
    role != 'admin_igreja' OR (cliente_id IS NOT NULL AND igreja_id IS NOT NULL)
  )
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.igrejas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Criar função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para clientes
CREATE POLICY "Superadmins podem ver todos os clientes" ON public.clientes
  FOR ALL USING (public.get_user_role() = 'superadmin');

CREATE POLICY "Clientes podem ver apenas seus dados" ON public.clientes
  FOR SELECT USING (
    id IN (SELECT cliente_id FROM public.usuarios WHERE id = auth.uid())
  );

-- Políticas RLS para igrejas
CREATE POLICY "Superadmins podem ver todas as igrejas" ON public.igrejas
  FOR ALL USING (public.get_user_role() = 'superadmin');

CREATE POLICY "Clientes podem ver suas igrejas" ON public.igrejas
  FOR ALL USING (
    cliente_id IN (SELECT cliente_id FROM public.usuarios WHERE id = auth.uid())
  );

CREATE POLICY "Admins de igreja podem ver sua igreja" ON public.igrejas
  FOR SELECT USING (
    id IN (SELECT igreja_id FROM public.usuarios WHERE id = auth.uid())
  );

-- Políticas RLS para usuários
CREATE POLICY "Superadmins podem ver todos os usuários" ON public.usuarios
  FOR ALL USING (public.get_user_role() = 'superadmin');

CREATE POLICY "Usuários podem ver seus próprios dados" ON public.usuarios
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Clientes podem ver usuários de suas igrejas" ON public.usuarios
  FOR SELECT USING (
    cliente_id IN (SELECT cliente_id FROM public.usuarios WHERE id = auth.uid())
  );

-- Inserir usuário superadmin padrão
INSERT INTO public.clientes (nome, email, ativo) VALUES 
('Sistema Admin', 'admin@sistema.com', true);

-- Dados de exemplo
INSERT INTO public.clientes (nome, email, ativo) VALUES 
('Igreja Batista Central', 'contato@igrejabatista.com', true),
('Assembleia de Deus', 'admin@assembleia.com', true);

INSERT INTO public.igrejas (cliente_id, nome, endereco, tipo, pastor_nome, pastor_email, membros, eventos, receitas, despesas) 
SELECT 
  c.id,
  CASE 
    WHEN c.nome = 'Igreja Batista Central' THEN 'Igreja Matriz Central'
    ELSE 'Assembleia Central'
  END,
  CASE 
    WHEN c.nome = 'Igreja Batista Central' THEN 'Rua Principal, 123 - Centro'
    ELSE 'Av. Principal, 456 - Centro'
  END,
  'matriz',
  CASE 
    WHEN c.nome = 'Igreja Batista Central' THEN 'Pastor João Silva'
    ELSE 'Pastor Pedro Santos'
  END,
  CASE 
    WHEN c.nome = 'Igreja Batista Central' THEN 'pastor@igrejabatista.com'
    ELSE 'pastor@assembleia.com'
  END,
  850,
  12,
  45000,
  32000
FROM public.clientes c 
WHERE c.nome IN ('Igreja Batista Central', 'Assembleia de Deus');

INSERT INTO public.igrejas (cliente_id, nome, endereco, tipo, pastor_nome, pastor_email, membros, eventos, receitas, despesas) 
SELECT 
  c.id,
  CASE 
    WHEN c.nome = 'Igreja Batista Central' THEN 'Congregação Vila Nova'
    ELSE 'Congregação Bairro Alto'
  END,
  CASE 
    WHEN c.nome = 'Igreja Batista Central' THEN 'Av. das Flores, 456 - Vila Nova'
    ELSE 'Rua das Acácias, 789 - Bairro Alto'
  END,
  'filial',
  CASE 
    WHEN c.nome = 'Igreja Batista Central' THEN 'Pastor Maria Oliveira'
    ELSE 'Pastor Ana Costa'
  END,
  CASE 
    WHEN c.nome = 'Igreja Batista Central' THEN 'maria@igrejabatista.com'
    ELSE 'ana@assembleia.com'
  END,
  320,
  8,
  18000,
  12000
FROM public.clientes c 
WHERE c.nome IN ('Igreja Batista Central', 'Assembleia de Deus');
