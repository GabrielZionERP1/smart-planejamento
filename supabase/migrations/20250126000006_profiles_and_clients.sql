-- ============================================
-- TABELAS ESSENCIAIS: PROFILES E CLIENTS
-- ============================================
-- Cria as tabelas necessárias para o sistema de permissões

-- ============================================
-- 1. TABELA PROFILES
-- ============================================
-- Tabela de perfis de usuários vinculada ao auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  avatar_url TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('admin', 'gestor', 'usuario')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 2. TABELA CLIENTS
-- ============================================
-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  cnpj_cpf TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_nome ON public.clients(nome);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_cnpj_cpf ON public.clients(cnpj_cpf);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 3. RLS POLICIES PARA PROFILES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Todos podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Todos autenticados podem ver outros perfis (necessário para listas de responsáveis)
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Usuários podem atualizar seu próprio perfil (nome, avatar)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================
-- 4. RLS POLICIES PARA CLIENTS
-- ============================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ver clientes
CREATE POLICY "Authenticated users can view clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (true);

-- Todos autenticados podem gerenciar clientes (por enquanto)
CREATE POLICY "Authenticated users can insert clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete clients"
  ON public.clients FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 5. FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
-- ============================================
-- Quando um novo usuário é criado, cria automaticamente seu profile

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. DADOS INICIAIS (OPCIONAL)
-- ============================================
-- Criar um usuário admin inicial se necessário
-- NOTA: Descomentar e ajustar os valores conforme necessário

/*
-- Inserir profile para usuário admin existente
INSERT INTO public.profiles (id, email, nome, role)
VALUES (
  'seu-user-id-aqui'::uuid,
  'admin@example.com',
  'Administrador',
  'admin'
)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================
-- FIM DA MIGRATION
-- ============================================
