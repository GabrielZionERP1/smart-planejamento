# Implementação de Histórico e Anexos para Desdobramentos

## 📋 Resumo

Implementação completa do sistema de **histórico textual** e **anexos** para os desdobramentos (breakdowns) dos planos de ação, conforme solicitado.

## ✅ O que foi implementado

### 1. **Banco de Dados** (`20250126000009_breakdown_history_attachments.sql`)

#### Tabela `breakdown_history`
- Armazena comentários e mudanças automáticas de status
- Campos:
  - `entry_type`: `comment` | `status_change` | `update`
  - `content`: Texto do comentário ou descrição da mudança
  - `metadata`: JSON com informações adicionais (ex: status antigo → novo)
- **RLS** configurado para usuários autenticados

#### Tabela `breakdown_attachments`
- Armazena metadados dos arquivos anexados
- Campos:
  - `file_name`, `file_path`, `file_size`, `file_type`
  - `description`: Descrição opcional do arquivo
- **RLS** configurado para usuários autenticados

#### Storage Bucket `breakdown-attachments`
- Bucket privado para armazenar arquivos
- Políticas de acesso: usuários podem fazer upload, visualizar e excluir seus próprios arquivos
- Estrutura: `{user_id}/{breakdown_id}/{timestamp}-{random}.ext`

#### Trigger Automático
- **Função**: `log_breakdown_status_change()`
- Registra automaticamente no histórico quando o status de um desdobramento muda
- Inclui metadados com `old_status` e `new_status`

---

### 2. **Serviços (Backend Logic)**

#### `breakdownHistoryService.ts` ✅
Refatorado para usar autenticação e novo schema:
- ✅ `getBreakdownHistory(breakdown_id)` - Busca todo o histórico
- ✅ `addBreakdownComment(breakdown_id, content)` - Adiciona comentário
- ✅ `updateBreakdownComment(historyId, content)` - Edita comentário
- ✅ `deleteBreakdownComment(historyId)` - Exclui comentário

#### `breakdownAttachmentService.ts` ✅
Refatorado para usar autenticação, validações e novo schema:
- ✅ `getAttachments(breakdown_id)` - Lista anexos
- ✅ `uploadAttachment(breakdown_id, file, description?)` - Upload com validação
  - Tamanho máximo: **10MB**
  - Formatos permitidos: Imagens, PDF, Word, Excel, TXT, CSV
- ✅ `getAttachmentUrl(filePath)` - Gera URL de download assinada (válida por 1h)
- ✅ `deleteAttachment(id)` - Remove arquivo e registro

---

### 3. **Componentes React**

#### `BreakdownHistory.tsx` ✅
Componente visual para histórico com timeline:
- **Timeline vertical** com ícones por tipo de entrada
- **Tipos de entrada** com badges coloridos:
  - 🔵 Comentário (comment)
  - 🟢 Mudança de Status (status_change)
  - ⚪ Atualização (update)
- **Comentários**:
  - Adicionar novo comentário (textarea + botão)
  - Editar comentários próprios (inline editing)
  - Excluir comentários próprios (com confirmação)
- **Mudanças automáticas de status**: Mostra badges com transição "De → Para"
- **Timestamps**: Exibe tempo relativo (ex: "há 2 horas")

#### `BreakdownAttachments.tsx` ✅
Componente para gerenciar anexos:
- **Upload de arquivos**:
  - Input de arquivo com validação de tipo e tamanho
  - Descrição opcional
  - Preview do arquivo selecionado
  - Barra de progresso durante upload
- **Lista de anexos**:
  - Ícones por tipo (🖼️ imagem, 📄 PDF, 📝 documento)
  - Nome, tamanho e data de upload
  - Botão de download (gera URL assinada)
  - Botão de exclusão (com confirmação)
- **Badges**: Exibe contador total de anexos

#### `BreakdownList.tsx` 🔄
Atualizado para incluir navegação:
- Adicionado botão **"👁️ Ver Detalhes"** em cada desdobramento
- Navega para página completa com histórico e anexos
- Requer prop adicional: `planId` para construir URL correta

---

### 4. **Página de Detalhes** (`breakdowns/[breakdownId]/page.tsx`) ✅

Nova página com **3 abas** (Tabs):

#### Aba 1: **Visão Geral**
- Informações do desdobramento:
  - Status com badge colorido
  - Nível de esforço (🟢 Baixo, 🟡 Médio, 🔴 Alto)
  - Descrição completa
  - Datas de início e término
  - Responsável
  - Recursos necessários
  - Recursos financeiros (formatado em R$)
- Botões de ação: **Editar** e **Excluir**

#### Aba 2: **Histórico**
- Componente `BreakdownHistory` integrado
- Permite adicionar comentários
- Exibe timeline completa

#### Aba 3: **Anexos**
- Componente `BreakdownAttachments` integrado
- Permite upload de arquivos
- Lista e gerencia anexos

---

## 🗂️ Estrutura de Arquivos

```
supabase/migrations/
  └── 20250126000009_breakdown_history_attachments.sql ✅

src/lib/
  ├── breakdownHistoryService.ts ✅ (refatorado)
  └── breakdownAttachmentService.ts ✅ (refatorado)

src/components/breakdown/
  ├── BreakdownHistory.tsx ✅ (recriado)
  ├── BreakdownAttachments.tsx ✅ (novo)
  └── BreakdownList.tsx 🔄 (atualizado com botão Ver Detalhes)

src/app/(dashboard)/plans/[id]/actions/[actionId]/
  ├── page.tsx 🔄 (atualizado com prop planId)
  └── breakdowns/[breakdownId]/
      └── page.tsx ✅ (nova página de detalhes)
```

---

## 🚀 Como Usar

### 1. **Aplicar Migration**
```sql
-- Execute no Supabase SQL Editor:
-- Copie o conteúdo de 20250126000009_breakdown_history_attachments.sql
```

### 2. **Navegar para um Desdobramento**
1. Acesse um Plano de Ação
2. Na seção "Desdobramentos", clique no botão **👁️** (Ver Detalhes)
3. Você será levado para a página completa

### 3. **Adicionar Comentário**
1. Aba **Histórico**
2. Digite no textarea "Adicionar um comentário..."
3. Clique em **"📤 Adicionar Comentário"**

### 4. **Enviar Arquivo**
1. Aba **Anexos**
2. Clique em **"Selecionar arquivo"**
3. Adicione descrição (opcional)
4. Clique em **"⬆️ Enviar Arquivo"**

### 5. **Mudanças Automáticas de Status**
- Quando você edita um desdobramento e muda o status
- O histórico **registra automaticamente** a mudança
- Aparece como entrada do tipo "Mudança de Status" com badges mostrando a transição

---

## 🔒 Segurança

- ✅ **RLS (Row-Level Security)** ativo em todas as tabelas
- ✅ **Autenticação obrigatória** para todas as operações
- ✅ **Validação de tamanho** de arquivo (máx. 10MB)
- ✅ **Validação de tipo** de arquivo (apenas formatos permitidos)
- ✅ **URLs assinadas** para downloads (válidas por 1 hora)
- ✅ **Estrutura de pastas** no Storage: `{user_id}/{breakdown_id}/` (isolamento)

---

## 📊 Funcionalidades Especiais

### Histórico Automático
```sql
-- Trigger registra mudanças de status automaticamente
CREATE TRIGGER breakdown_status_change_trigger
  AFTER UPDATE ON action_breakdowns
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_breakdown_status_change();
```

### Upload com Progresso
- Barra de progresso visual durante upload
- Preview do arquivo antes de enviar
- Feedback de sucesso/erro com toast notifications

### Timeline Visual
- Ícones diferentes por tipo de entrada
- Linha vertical conectando entradas
- Cores semânticas (azul=comentário, verde=status, cinza=update)
- Tempo relativo em português (date-fns + locale ptBR)

---

## 🎯 Próximos Passos (Opcional)

Se quiser expandir ainda mais:
- [ ] Notificações em tempo real (Supabase Realtime)
- [ ] Mencionar usuários em comentários (@usuario)
- [ ] Filtros no histórico (apenas comentários, apenas mudanças)
- [ ] Pesquisa em anexos por nome/descrição
- [ ] Preview de imagens inline (sem precisar baixar)
- [ ] Versionamento de arquivos (manter histórico de uploads)

---

## ✨ Resultado Final

Agora você tem um sistema completo onde pode:
1. ✅ Marcar desdobramentos como concluídos (via edição de status)
2. ✅ Adicionar histórico textual (comentários)
3. ✅ Anexar arquivos (documentos, planilhas, imagens)
4. ✅ Ver linha do tempo completa de mudanças
5. ✅ Gerenciar anexos (upload, download, exclusão)

Tudo integrado na interface, com validações, segurança RLS e feedback visual!
