import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  console.log('🔒 Middleware: Processando rota:', request.nextUrl.pathname)
  
  // Atualizar sessão
  const response = await updateSession(request)

  // Rotas públicas que não requerem autenticação
  const publicPaths = ['/login']
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isPublicPath) {
    console.log('✅ Middleware: Rota pública, permitindo acesso')
    return response
  }

  // Verificar autenticação para rotas protegidas
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.getSession()
  
  console.log('🔑 Middleware: Sessão encontrada?', !!session, 'Erro?', error)

  // Redirecionar para login se não estiver autenticado
  if (!session) {
    console.log('❌ Middleware: Sem sessão, redirecionando para login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('✅ Middleware: Sessão válida, userId:', session.user.id)

  // Buscar perfil do usuário para verificar permissões (com fallback)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.log('⚠️ Middleware: Erro ao buscar profile (talvez não exista ainda):', profileError.message)
  }

  const userRole = profile?.role || 'usuario' // Fallback para usuario se não encontrar

  console.log('👤 Middleware: Role do usuário:', userRole)

  // Rotas restritas apenas para admin
  const adminOnlyPaths = [
    '/settings/users',
    '/settings/departments',
    '/settings/clients',
  ]

  const isAdminOnlyPath = adminOnlyPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAdminOnlyPath && userRole !== 'admin') {
    console.log('🚫 Middleware: Acesso negado para role:', userRole)
    return NextResponse.redirect(new URL('/', request.url))
  }

  console.log('✅ Middleware: Permitindo acesso')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
