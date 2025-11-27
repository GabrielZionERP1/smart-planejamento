# SMART - Sistema de Planejamento Estratégico

Sistema completo de gestão de planejamento estratégico em 4 níveis hierárquicos:
1. **Planejamento** - Plano macro com períodos definidos
2. **Visão Estratégica** - Missão, visão, valores e objetivos
3. **Planos de Ação** - Ações SMART vinculadas aos objetivos
4. **Desdobramentos** - Subatividades com histórico e progresso

## ✨ Novidades - Fase 8

**Sistema de Design Completo Implementado!**

- 🎨 Design System robusto com tokens padronizados
- 🌙 Dark Mode completo (light/dark/system)
- ✨ 20+ animações suaves com Framer Motion
- 🔔 Sistema de toasts elegantes
- 📱 Componentes responsivos e acessíveis
- 🚀 Performance otimizada com loading states
- 📝 FormFields padronizados
- 🎯 UserAvatars e StatusBadges

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **Animações**: Framer Motion
- **Toasts**: Sonner
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)
- Git (opcional)

## ⚙️ Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Copie as credenciais do projeto
3. Renomeie `.env.local` e adicione suas credenciais:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

### 3. Criar Schema do Banco

Execute a migration inicial no SQL Editor do Supabase:
```bash
# Copie o conteúdo de: supabase/migrations/20250126000000_initial_schema.sql
# Cole no SQL Editor do Supabase e execute
```

Ou use o Supabase CLI (recomendado):
```bash
npx supabase login
npx supabase link --project-ref seu-project-ref
npx supabase db push
```

## 🏃 Executar o Projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
