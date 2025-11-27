# GUIA RÁPIDO - Fase 8: Sistema SMART UX/UI

## 🚀 Início Rápido

### 1. Imports Essenciais

```typescript
// Design System completo
import { theme, uiStyles, cn } from '@/lib/ui';

// Helpers úteis
import { 
  formatDate, 
  formatStatus, 
  applyStatusColor,
  getInitials,
  isOverdue 
} from '@/lib/ui/ui.helpers';

// Toast notifications
import toast from '@/lib/ui/toast';

// Animações
import { fadeInUp, staggerContainer } from '@/lib/ui/animations';
import { motion } from 'framer-motion';

// Componentes de Layout
import { PageContainer, Section, EmptyState } from '@/components/ui/PageContainer';

// Componentes UI
import { FormField, TextareaField, SelectField } from '@/components/ui/FormField';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
```

## 📄 Estrutura de Página Padrão

```typescript
export default function MinhaPage() {
  return (
    <PageContainer
      title="Título da Página"
      description="Descrição opcional"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ação
        </Button>
      }
    >
      {/* Conteúdo da página */}
      <Section title="Seção 1" variant="card">
        Conteúdo da seção
      </Section>

      <Section title="Seção 2">
        Conteúdo sem card
      </Section>
    </PageContainer>
  );
}
```

## 🎨 Componentes Prontos

### Toast Notifications

```typescript
// Sucesso
toast.success('Operação concluída!');

// Erro
toast.error('Erro ao processar', {
  description: 'Detalhes do erro'
});

// Promise
toast.promise(
  fetchData(),
  {
    loading: 'Carregando...',
    success: 'Dados carregados!',
    error: 'Erro ao carregar'
  }
);

// Info
toast.info('Informação importante');

// Warning
toast.warning('Atenção necessária');
```

### Formulários

```typescript
<form onSubmit={handleSubmit}>
  <FormField
    label="Nome"
    placeholder="Digite o nome"
    error={errors.name}
    helper="Mínimo 3 caracteres"
    required
    {...register('name')}
  />

  <TextareaField
    label="Descrição"
    placeholder="Digite a descrição"
    error={errors.description}
    rows={4}
    {...register('description')}
  />

  <SelectField
    label="Status"
    options={[
      { value: 'ativo', label: 'Ativo' },
      { value: 'inativo', label: 'Inativo' }
    ]}
    error={errors.status}
    required
    {...register('status')}
  />

  <Button type="submit" loading={isSubmitting}>
    Salvar
  </Button>
</form>
```

### Cards com Animação

```typescript
<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map((item, index) => (
    <motion.div key={item.id} variants={fadeInUp}>
      <Card interactive>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusBadge status={item.status} />
          <Progress value={item.progress} showPercentage colorByValue />
        </CardContent>
      </Card>
    </motion.div>
  ))}
</motion.div>
```

### Avatar e Status

```typescript
// Avatar do usuário
<UserAvatar
  name="João Silva"
  email="joao@example.com"
  size="lg"
/>

// Badge de status
<StatusBadge status="em_andamento" />
<StatusBadge status="concluido" showDot={false} />
```

### Empty State

```typescript
<EmptyState
  icon={<FileText className="h-16 w-16" />}
  title="Nenhum item encontrado"
  description="Comece criando seu primeiro item"
  action={
    <Button onClick={handleCreate}>
      <Plus className="mr-2 h-4 w-4" />
      Criar Primeiro Item
    </Button>
  }
/>
```

## 🎭 Animações Rápidas

```typescript
// Card com hover
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  <Card>...</Card>
</motion.div>

// Fade in ao carregar
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Conteúdo
</motion.div>

// Lista com stagger
<motion.div variants={staggerContainer}>
  {items.map(item => (
    <motion.div key={item.id} variants={fadeInUp}>
      Item
    </motion.div>
  ))}
</motion.div>
```

## 🎨 Estilos Rápidos

```typescript
// Usando uiStyles
<h1 className={uiStyles.typography.h1}>Título</h1>
<p className={uiStyles.typography.body}>Texto</p>
<div className={uiStyles.container.gridCols3}>Grid 3 colunas</div>

// Usando theme
<div style={{ color: theme.colors.primary[500] }}>
  Cor primária
</div>

// Helper cn para combinar classes
<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)}>
  Conteúdo
</div>
```

## 🌙 Dark Mode

```typescript
// No header ou navbar
<ThemeToggle />

// Classes dark: no Tailwind
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50">
  Suporte automático a dark mode
</div>
```

## 📊 Progress Bar

```typescript
// Básico
<Progress value={75} />

// Com percentual
<Progress value={75} showPercentage />

// Com cor dinâmica (verde se >75%, vermelho se <25%)
<Progress value={45} colorByValue />
```

## 🔄 Loading States

```typescript
// Button com loading
<Button loading={isSubmitting} loadingText="Salvando...">
  Salvar
</Button>

// Skeleton
<Skeleton className="h-10 w-full" />
<Skeleton className="h-4 w-64" />

// Página inteira (loading.tsx)
// Crie loading.tsx na pasta da rota
export default function Loading() {
  return <div>Loading...</div>;
}
```

## 🎯 Helpers Úteis

```typescript
// Formatação
formatDate('2024-01-15') // 15/01/2024
formatDateTime('2024-01-15T10:30') // 15/01/2024 10:30
formatStatus('em_andamento') // Em Andamento
formatPercentage(0.75) // 75%
formatNumber(1234567) // 1.234.567

// Verificações
isOverdue('2024-01-15') // true/false
daysUntil('2024-12-31') // número de dias

// UI
getInitials('João Silva') // JS
stringToColor('João Silva') // bg-blue-500 (consistente)
truncate('Texto longo...', 20) // Texto longo...

// Cores por status
const colors = applyStatusColor('concluido');
// colors.badge, colors.bg, colors.text, colors.border, colors.dot
```

## 📱 Responsividade

```typescript
// Grid responsivo
<div className={uiStyles.container.gridCols3}>
  {/* 1 coluna mobile, 2 tablet, 3 desktop */}
</div>

// Tipografia responsiva
<h1 className={uiStyles.typography.h1}>
  {/* text-3xl md:text-4xl */}
</h1>

// Espaçamento responsivo
<div className="mb-4 md:mb-6 lg:mb-8">
  Conteúdo
</div>
```

## 🚨 Erros e Alertas

```typescript
// Alert component
<Alert variant="destructive">
  <AlertDescription>Mensagem de erro</AlertDescription>
</Alert>

<Alert>
  <AlertDescription>Mensagem informativa</AlertDescription>
</Alert>

// Toast para ações
try {
  await deleteItem();
  toast.success('Item deletado com sucesso');
} catch (error) {
  toast.error('Erro ao deletar item');
}
```

## 📦 Dicas de Performance

```typescript
// Lazy loading de componentes pesados
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton className="h-64 w-full" />
});

// Debounce em inputs
const debouncedSearch = debounce((term: string) => {
  performSearch(term);
}, 300);

// React Suspense
<Suspense fallback={<LoadingSkeleton />}>
  <AsyncComponent />
</Suspense>
```

## 🎬 Exemplo Completo: Página de Listagem

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText } from 'lucide-react';
import { PageContainer, EmptyState } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { staggerContainer, fadeInUp } from '@/lib/ui/animations';
import toast from '@/lib/ui/toast';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (error) {
      toast.error('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <PageContainer
      title="Meus Itens"
      description="Gerencie todos os seus itens"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Item
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="Nenhum item cadastrado"
          description="Comece criando seu primeiro item"
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Item
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, index) => (
            <motion.div key={item.id} variants={fadeInUp}>
              <Card interactive>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusBadge status={item.status} />
                  <Progress value={item.progress} showPercentage colorByValue />
                  <Button variant="outline" className="w-full">
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageContainer>
  );
}
```

---

## 🎉 Pronto!

Com este guia você tem tudo que precisa para implementar páginas consistentes e bonitas no sistema SMART.

Para mais detalhes, consulte:
- `FASE-8-UX-UI-PERFORMANCE.md` - Documentação completa
- `src/lib/ui/` - Design system
- `src/components/ui/` - Componentes reutilizáveis
