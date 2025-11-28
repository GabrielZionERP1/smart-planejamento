'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Target, 
  Users,
  Building2,
  UserCog,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getCurrentUserProfile, UserRole } from '@/lib/permissions'
import { Profile } from '@/lib/types'

type NavItem = {
  title: string
  href: string
  icon: typeof LayoutDashboard
  roles: readonly UserRole[]
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['superadmin', 'admin', 'gestor', 'usuario'],
  },
  {
    title: 'Planejamentos',
    href: '/plans',
    icon: FolderKanban,
    roles: ['superadmin', 'admin', 'gestor', 'usuario'],
  },
]

const settingsNavItems: NavItem[] = [
  {
    title: 'Usuários',
    href: '/settings/users',
    icon: Users,
    roles: ['superadmin', 'admin'],
  },
  {
    title: 'Departamentos',
    href: '/settings/departments',
    icon: Building2,
    roles: ['superadmin', 'admin'],
  },
  // {
  //   title: 'Clientes',
  //   href: '/settings/clients',
  //   icon: UserCog,
  //   roles: ['superadmin', 'admin'],
  // },
]

const superAdminNavItems: NavItem[] = [
  {
    title: 'Gerenciar Empresas',
    href: '/admin/companies',
    icon: ShieldCheck,
    roles: ['superadmin'],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getCurrentUserProfile()
        if (profile) {
          console.log('✅ AppSidebar: Profile carregado:', profile.role)
          setUserProfile(profile)
        } else {
          console.warn('⚠️ AppSidebar: Profile não encontrado')
        }
      } catch (error) {
        console.error('❌ AppSidebar: Erro ao carregar profile:', error)
      }
    }
    loadProfile()
  }, [])

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b bg-slate-900 dark:bg-slate-950 py-2">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logosmart.png" 
              alt="SMART Logo" 
              width={70} 
              height={70}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {mainNavItems
              .filter(item => !userProfile || item.roles.includes(userProfile.role as UserRole))
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                                (item.href !== '/' && pathname?.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
          </div>

          {/* SuperAdmin Section - Only for superadmin */}
          {userProfile?.role === 'superadmin' && (
            <div className="pt-6">
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                SuperAdmin
              </div>
              <div className="space-y-1">
                {superAdminNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Settings Section - For admin and superadmin */}
          {(userProfile?.role === 'admin' || userProfile?.role === 'superadmin') && (
            <div className="pt-6">
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                Configurações
              </div>
              <div className="space-y-1">
                {settingsNavItems
                  .filter(item => item.roles.includes(userProfile.role as UserRole))
                  .map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
              </div>
            </div>
          )}
        </nav>
      </div>
    </aside>
  )
}
