import { AppShell } from '@/components/layout/AppShell'
import { CompanyProvider } from '@/lib/companyContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CompanyProvider>
      <AppShell>{children}</AppShell>
    </CompanyProvider>
  )
}
