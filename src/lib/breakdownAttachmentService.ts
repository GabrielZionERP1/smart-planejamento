import { createClient } from './supabase/client'

function getSupabaseClient() {
  return createClient()
}

export interface BreakdownAttachment {
  id: string
  breakdown_id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  description?: string | null
  created_at: string
  updated_at: string
}

const STORAGE_BUCKET = 'breakdown-attachments'

// Tamanho máximo: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Tipos de arquivo permitidos
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]

/**
 * Busca todos os anexos de um desdobramento
 */
export async function getAttachments(
  breakdown_id: string
): Promise<BreakdownAttachment[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('breakdown_attachments')
    .select('*')
    .eq('breakdown_id', breakdown_id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar anexos: ${error.message}`)
  }

  return data || []
}

/**
 * Faz upload de um arquivo e cria o registro do anexo
 */
export async function uploadAttachment(
  breakdown_id: string,
  file: File,
  description?: string
): Promise<BreakdownAttachment> {
  const supabase = getSupabaseClient()
  
  // Validações
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 10MB')
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido')
  }

  // Obter usuário atual
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Gerar nome único para o arquivo
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(7)
  const fileExtension = file.name.split('.').pop()
  const filePath = `${user.id}/${breakdown_id}/${timestamp}-${randomString}.${fileExtension}`

  // Upload do arquivo para o Storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`)
  }

  // Criar registro no banco de dados
  const { data, error } = await supabase
    .from('breakdown_attachments')
    .insert({
      breakdown_id,
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      description: description || null,
    })
    .select()
    .single()

  if (error) {
    // Se falhar ao criar registro, tentar remover o arquivo do storage
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])
    
    throw new Error(`Erro ao criar registro do anexo: ${error.message}`)
  }

  if (!data) {
    throw new Error('Falha ao criar registro do anexo')
  }

  return data
}

/**
 * Obtém URL de download de um anexo
 */
export async function getAttachmentUrl(filePath: string): Promise<string> {
  const supabase = getSupabaseClient()
  
  const { data } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, 3600) // URL válida por 1 hora

  if (!data) {
    throw new Error('Erro ao gerar URL de download')
  }

  return data.signedUrl
}

/**
 * Exclui um anexo (registro e arquivo)
 */
export async function deleteAttachment(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  
  // Buscar informações do anexo antes de excluir
  const { data: attachment, error: fetchError } = await supabase
    .from('breakdown_attachments')
    .select('file_path')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error(`Erro ao buscar anexo: ${fetchError.message}`)
  }

  if (!attachment) {
    throw new Error('Anexo não encontrado')
  }

  // Excluir arquivo do storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([attachment.file_path])

  if (storageError) {
    console.error('Erro ao excluir arquivo do storage:', storageError)
    // Continua mesmo com erro no storage para não deixar registro órfão
  }

  // Excluir registro do banco
  const { error: deleteError } = await supabase
    .from('breakdown_attachments')
    .delete()
    .eq('id', id)

  if (deleteError) {
    throw new Error(`Erro ao excluir registro do anexo: ${deleteError.message}`)
  }
}

/**
 * Formata o tamanho do arquivo para exibição
 */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}
