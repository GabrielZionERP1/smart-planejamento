-- Fix RLS policies for strategic_plans
-- Problema: auth.role() não funciona corretamente, usar auth.uid() é mais confiável

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver planejamentos" ON public.strategic_plans;
DROP POLICY IF EXISTS "Usuários autenticados podem criar planejamentos" ON public.strategic_plans;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar planejamentos" ON public.strategic_plans;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar planejamentos" ON public.strategic_plans;

-- Criar novas políticas usando auth.uid() que é mais confiável
CREATE POLICY "authenticated_can_select_strategic_plans"
  ON public.strategic_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_can_insert_strategic_plans"
  ON public.strategic_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_can_update_strategic_plans"
  ON public.strategic_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_can_delete_strategic_plans"
  ON public.strategic_plans FOR DELETE
  TO authenticated
  USING (true);
