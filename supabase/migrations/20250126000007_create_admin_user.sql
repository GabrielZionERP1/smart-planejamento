-- ============================================
-- CRIAR USUÁRIO ADMINISTRADOR INICIAL
-- ============================================
-- Esta migration cria o primeiro usuário admin do sistema
-- IMPORTANTE: Execute esta migration DEPOIS de 20250126000006_profiles_and_clients.sql

-- ============================================
-- 1. CRIAR USUÁRIO NO AUTH.USERS
-- ============================================
-- Nota: O Supabase não permite criar usuários via SQL diretamente com senha
-- Esta migration presume que o usuário já foi criado via Dashboard ou API

-- Alternativa 1: Criar via SQL (requer extensão pgcrypto)
-- O trigger handle_new_user criará automaticamente o profile

DO $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Verificar se o usuário já existe
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'gabriel@zion.tec.br'
  ) INTO user_exists;

  IF NOT user_exists THEN
    -- Gerar UUID para o novo usuário
    user_id := gen_random_uuid();
    
    -- Inserir usuário no auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'gabriel@zion.tec.br',
      crypt('@Z1on1500', gen_salt('bf')), -- Senha criptografada com bcrypt
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"nome":"Gabriel","role":"admin"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );

    -- O trigger handle_new_user criará automaticamente o profile
    -- Mas vamos garantir e atualizar para admin
    UPDATE public.profiles 
    SET role = 'admin', nome = 'Gabriel'
    WHERE id = user_id;

    RAISE NOTICE 'Usuário admin criado com sucesso: gabriel@zion.tec.br';
  ELSE
    -- Se o usuário já existe, apenas garantir que tem profile admin
    SELECT id INTO user_id FROM auth.users WHERE email = 'gabriel@zion.tec.br';
    
    -- Criar ou atualizar profile para admin
    INSERT INTO public.profiles (id, email, nome, role)
    VALUES (
      user_id,
      'gabriel@zion.tec.br',
      'Gabriel',
      'admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', nome = 'Gabriel';

    RAISE NOTICE 'Profile admin atualizado para usuário existente: gabriel@zion.tec.br';
  END IF;
END $$;

-- ============================================
-- ALTERNATIVA: INSTRUÇÕES MANUAIS
-- ============================================
-- Se a criação automática falhar, siga estes passos:
--
-- 1. Acesse o Supabase Dashboard > Authentication > Users
-- 2. Clique em "Add user" > "Create new user"
-- 3. Email: gabriel@zion.tec.br
-- 4. Password: @Z1on1500
-- 5. Marque "Auto Confirm User"
-- 6. O trigger handle_new_user criará o profile automaticamente
-- 7. Execute o SQL abaixo para definir como admin:

/*
UPDATE public.profiles 
SET role = 'admin', nome = 'Gabriel'
WHERE email = 'gabriel@zion.tec.br';
*/

-- ============================================
-- FIM DA MIGRATION
-- ============================================
