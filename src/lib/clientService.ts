import { supabaseClient } from './supabaseClient'
import { getCurrentUserCompanyId } from './auth'

export interface Client {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  cnpj_cpf: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface ClientFormData {
  nome: string
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  cnpj_cpf?: string
  observacoes?: string
}

/**
 * Busca todos os clientes
 */
export async function getClients(): Promise<Client[]> {
  const supabase = supabaseClient
  const companyId = await getCurrentUserCompanyId()
  
  let query = supabase
    .from('clients')
    .select('*')
    .order('nome', { ascending: true })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar clientes:', error)
    throw new Error('Não foi possível carregar os clientes')
  }
  
  return data || []
}

/**
 * Busca um cliente por ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const supabase = supabaseClient
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Erro ao buscar cliente:', error)
    return null
  }
  
  return data
}

/**
 * Cria um novo cliente
 */
export async function createClient(formData: ClientFormData): Promise<Client> {
  const supabase = supabaseClient
  const companyId = await getCurrentUserCompanyId()
  
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      nome: formData.nome,
      email: formData.email || null,
      telefone: formData.telefone || null,
      endereco: formData.endereco || null,
      cidade: formData.cidade || null,
      estado: formData.estado || null,
      cep: formData.cep || null,
      cnpj_cpf: formData.cnpj_cpf || null,
      observacoes: formData.observacoes || null,
      company_id: companyId,
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar cliente:', error)
    throw new Error('Não foi possível criar o cliente')
  }
  
  return data
}

/**
 * Atualiza um cliente existente
 */
export async function updateClient(id: string, formData: ClientFormData): Promise<Client> {
  const supabase = supabaseClient
  
  const { data, error } = await supabase
    .from('clients')
    .update({
      nome: formData.nome,
      email: formData.email || null,
      telefone: formData.telefone || null,
      endereco: formData.endereco || null,
      cidade: formData.cidade || null,
      estado: formData.estado || null,
      cep: formData.cep || null,
      cnpj_cpf: formData.cnpj_cpf || null,
      observacoes: formData.observacoes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar cliente:', error)
    throw new Error('Não foi possível atualizar o cliente')
  }
  
  return data
}

/**
 * Exclui um cliente
 */
export async function deleteClient(id: string): Promise<void> {
  const supabase = supabaseClient
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir cliente:', error)
    throw new Error('Não foi possível excluir o cliente')
  }
}
