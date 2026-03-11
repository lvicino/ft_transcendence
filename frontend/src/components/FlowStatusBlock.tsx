import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';
import { Loader } from './ui/Loader';
import type { GameStatus } from '../lib/types';

type FlowStatusBlockProps = {
  status: GameStatus;
  isLoading?: boolean;
  loadingLabel?: string;
  error?: string | null;
};

function getBadgeVariant(status: GameStatus): 'default' | 'success' | 'warning' | 'error' | 'outline' {
  if (status === 'lobby') return 'warning';
  if (status === 'playing') return 'success';
  if (status === 'finished') return 'default';
  return 'outline';
}

export default function FlowStatusBlock({
  status,
  isLoading = false,
  loadingLabel = 'Loading',
  error,
}: FlowStatusBlockProps) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium tracking-[0.08em] text-white/55">Status</span>
        <Badge variant={getBadgeVariant(status)}>{status}</Badge>
      </div>

      {isLoading ? <Loader size="sm" label={loadingLabel} className="w-full justify-start gap-2" /> : null}

      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
