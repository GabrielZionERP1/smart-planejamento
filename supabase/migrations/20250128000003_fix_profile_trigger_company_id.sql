-- ============================================
-- FIX: Atualizar trigger para pegar company_id dos metadados
-- ============================================
-- O trigger handle_new_user não estava pegando company_id do user_metadata
-- Agora vai extrair company_id quando disponível

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'usuario'),
    (NEW.raw_user_meta_data->>'company_id')::uuid  -- Extrair company_id dos metadados
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger já existe, apenas recriamos a função acima
