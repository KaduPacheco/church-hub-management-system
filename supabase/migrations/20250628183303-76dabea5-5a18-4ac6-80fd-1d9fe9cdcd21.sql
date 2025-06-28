
-- Primeiro, vamos corrigir a estrutura fundamental do banco de dados

-- 1. Remover todas as políticas RLS problemáticas
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clientes;
DROP POLICY IF EXISTS "Users can create client profile during signup" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their own data" ON public.clientes;
DROP POLICY IF EXISTS "Superadmins can manage all clients" ON public.clientes;
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clientes;

-- 2. Desabilitar RLS temporariamente para clientes durante o processo de cadastro
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- 3. Criar função de validação de CNPJ
CREATE OR REPLACE FUNCTION public.validate_cnpj(cnpj_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cnpj TEXT;
    digit1 INTEGER;
    digit2 INTEGER;
    sum_val INTEGER;
    i INTEGER;
BEGIN
    -- Remove formatação
    cnpj := regexp_replace(cnpj_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 14 dígitos
    IF length(cnpj) != 14 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica CNPJs inválidos conhecidos
    IF cnpj IN ('00000000000000', '11111111111111', '22222222222222', 
                '33333333333333', '44444444444444', '55555555555555',
                '66666666666666', '77777777777777', '88888888888888', 
                '99999999999999') THEN
        RETURN FALSE;
    END IF;
    
    -- Calcula primeiro dígito verificador
    sum_val := 0;
    FOR i IN 1..12 LOOP
        sum_val := sum_val + (substring(cnpj, i, 1)::INTEGER * (CASE WHEN i <= 4 THEN 5 - i + 1 ELSE 13 - i + 1 END));
    END LOOP;
    
    digit1 := 11 - (sum_val % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Calcula segundo dígito verificador
    sum_val := 0;
    FOR i IN 1..13 LOOP
        sum_val := sum_val + (substring(cnpj, i, 1)::INTEGER * (CASE WHEN i <= 5 THEN 6 - i + 1 ELSE 14 - i + 1 END));
    END LOOP;
    
    digit2 := 11 - (sum_val % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Verifica se os dígitos calculados conferem
    RETURN (substring(cnpj, 13, 1)::INTEGER = digit1 AND substring(cnpj, 14, 1)::INTEGER = digit2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para criação segura de cliente (transação atômica)
CREATE OR REPLACE FUNCTION public.create_trial_client(
    p_user_id UUID,
    p_full_name TEXT,
    p_phone TEXT,
    p_cnpj TEXT,
    p_members INTEGER,
    p_email TEXT
)
RETURNS JSON AS $$
DECLARE
    cleaned_cnpj TEXT;
    client_id UUID;
    result JSON;
BEGIN
    -- Limpar CNPJ
    cleaned_cnpj := regexp_replace(p_cnpj, '[^0-9]', '', 'g');
    
    -- Validar CNPJ
    IF NOT public.validate_cnpj(cleaned_cnpj) THEN
        RETURN json_build_object('success', false, 'error', 'CNPJ inválido');
    END IF;
    
    -- Verificar se email já existe
    IF EXISTS (SELECT 1 FROM public.clientes WHERE email = lower(trim(p_email))) THEN
        RETURN json_build_object('success', false, 'error', 'Email já cadastrado');
    END IF;
    
    -- Verificar se CNPJ já existe
    IF EXISTS (SELECT 1 FROM public.clientes WHERE cnpj = cleaned_cnpj) THEN
        RETURN json_build_object('success', false, 'error', 'CNPJ já cadastrado');
    END IF;
    
    -- Inserir cliente
    INSERT INTO public.clientes (
        user_id, full_name, phone, cnpj, members, email, nome, status, tag
    ) VALUES (
        p_user_id, trim(p_full_name), trim(p_phone), cleaned_cnpj, 
        p_members, lower(trim(p_email)), trim(p_full_name), 'ativo', 'Período de teste'
    ) RETURNING id INTO client_id;
    
    -- Inserir usuário na tabela usuarios
    INSERT INTO public.usuarios (
        id, email, nome, role, cliente_id, ativo
    ) VALUES (
        p_user_id, lower(trim(p_email)), trim(p_full_name), 'cliente', client_id, true
    );
    
    RETURN json_build_object('success', true, 'client_id', client_id);
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Erro interno do servidor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Reabilitar RLS com políticas corretas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Política simples e segura para visualização
CREATE POLICY "Users can view their own client data" ON public.clientes
    FOR SELECT USING (user_id = auth.uid());

-- Política para atualização
CREATE POLICY "Users can update their own client data" ON public.clientes
    FOR UPDATE USING (user_id = auth.uid());

-- 6. Função para verificar status de trial expirado
CREATE OR REPLACE FUNCTION public.check_trial_expired(client_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.clientes 
        WHERE user_id = client_user_id 
        AND tag = 'Período de teste' 
        AND created_at + INTERVAL '7 days' < NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
