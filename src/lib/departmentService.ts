import { supabaseClient } from './supabaseClient'
import { getCurrentUserCompanyId } from './auth'

export interface Department {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface DepartmentFormData {
  name: string
}

/**
 * Busca todos os departamentos
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = supabaseClient
  const companyId = await getCurrentUserCompanyId()
  
  let query = supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar departamentos:', error)
    throw new Error('Não foi possível carregar os departamentos')
  }
  
  return data || []
}

/**
 * Busca um departamento por ID
 */
export async function getDepartmentById(id: string): Promise<Department | null> {
  const supabase = supabaseClient
  
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Erro ao buscar departamento:', error)
    return null
  }
  
  return data
}

/**
 * Cria um novo departamento
 */
export async function createDepartment(formData: DepartmentFormData): Promise<Department> {
  const supabase = supabaseClient
  const companyId = await getCurrentUserCompanyId()
  
  const { data, error } = await supabase
    .from('departments')
    .insert([{
      name: formData.name,
      company_id: companyId,
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar departamento:', error)
    throw new Error('Não foi possível criar o departamento')
  }
  
  return data
}

/**
 * Atualiza um departamento existente
 */
export async function updateDepartment(id: string, formData: DepartmentFormData): Promise<Department> {
  const supabase = supabaseClient
  
  const { data, error } = await supabase
    .from('departments')
    .update({
      name: formData.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar departamento:', error)
    throw new Error('Não foi possível atualizar o departamento')
  }
  
  return data
}

/**
 * Exclui um departamento
 */
export async function deleteDepartment(id: string): Promise<void> {
  const supabase = supabaseClient
  
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir departamento:', error)
    throw new Error('Não foi possível excluir o departamento')
  }
}
