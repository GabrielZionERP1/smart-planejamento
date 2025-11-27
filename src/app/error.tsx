'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer, EmptyState } from '@/components/ui/PageContainer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Application error:', error);
  }, [error]);

  return (
    <PageContainer>
      <EmptyState
        icon={<AlertTriangle className="h-16 w-16" />}
        title="Algo deu errado"
        description={
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Ocorreu um erro inesperado. Por favor, tente novamente.'
        }
        action={
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            <Button onClick={() => (window.location.href = '/')} variant="outline">
              Voltar ao início
            </Button>
          </div>
        }
      />
    </PageContainer>
  );
}
