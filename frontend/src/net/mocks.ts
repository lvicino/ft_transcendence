import type { User } from '@/lib/types';

type AuthStep = { msg: string; delayMs: number };

type AuthFlowOptions = {
  steps?: AuthStep[];
  user?: User;
  onStatus: (msg: string) => void;
  onSuccess: (user: User, token: string) => void;
};

export function startAuthFlowMock(options: AuthFlowOptions): () => void {
  const steps = options.steps ?? [
    { msg: 'Authenticating…', delayMs: 700 },
    { msg: 'Verifying profile…', delayMs: 1400 },
    { msg: 'Creating session…', delayMs: 2100 },
  ];

  const user = options.user ?? { id: '1', username: 'Student_42', email: 'student42@intra.42.fr' };
  const timers: Array<ReturnType<typeof setTimeout>> = [];

  steps.forEach((step) => timers.push(setTimeout(() => options.onStatus(step.msg), step.delayMs)));
  timers.push(setTimeout(() => options.onSuccess(user, `mock_${Date.now()}`), 2600));

  return () => timers.forEach(clearTimeout);
}
