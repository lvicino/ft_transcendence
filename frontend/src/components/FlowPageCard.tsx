import type { ReactNode } from 'react';

import type { GameStatus } from '../lib/types';
import FlowStatusBlock from './FlowStatusBlock';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

type FlowPageCardProps = {
  title: string;
  status: GameStatus;
  error?: string | null;
  isLoading?: boolean;
  loadingLabel?: string;
  children?: ReactNode;
  actions: ReactNode;
};

export default function FlowPageCard({
  title,
  status,
  error,
  isLoading,
  loadingLabel,
  children,
  actions,
}: FlowPageCardProps) {
  return (
    <div className="mx-auto w-full max-w-2xl py-10">
      <Card className="border-white/10 bg-black/40">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-white/60">
            Status: <span className="text-white">{status}</span>
          </div>

          <FlowStatusBlock status={status} isLoading={isLoading} loadingLabel={loadingLabel} error={error} />

          {children}

          {actions}
        </CardContent>
      </Card>
    </div>
  );
}
