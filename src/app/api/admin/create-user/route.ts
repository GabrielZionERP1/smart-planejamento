import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para criar usuário usando Admin API
 * Requer service_role key (nunca expor no frontend!)
 */

// Cliente Supabase com service_role key para usar Admin API
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, company_id, role, department_id } = body

    // Validação
    if (!email || !password || !name || !company_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: email, password, name, company_id' },
        { status: 400 }
      )
    }

    const adminClient = getAdminClient()

    // Criar usuário via Admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        nome: name,
        role: role || 'usuario',
        company_id,
        department_id: department_id || null,
      },
    })

    if (authError) {
      console.error('Erro ao criar usuário admin:', authError)
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Usuário não foi criado' },
        { status: 500 }
      )
    }

    // Aguardar um pouco para o trigger criar o profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Atualizar o profile com company_id e department_id (trigger não pega todos os campos dos metadados)
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        company_id,
        department_id: department_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authData.user.id)

    if (updateError) {
      console.error('Erro ao atualizar profile com company_id:', updateError)
      
      // Rollback: deletar usuário criado
      await adminClient.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: `Erro ao configurar empresa do usuário: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
    })
  } catch (error) {
    console.error('Erro na API de criação de usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
