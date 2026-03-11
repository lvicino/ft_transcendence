import { useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';

import { Alert } from '../components/ui/Alert';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { useAuth } from '../store';

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();

  const isOwnProfile = !id || id === user?.id;

  // No backend endpoint for user profiles — show only local data
  const viewedUser = isOwnProfile && user
    ? {
        id: user.id,
        login: user.username,
        avatar: user.avatar ?? null,
        status: 'online' as const,
      }
    : null;

  if (!isOwnProfile) {
    return (
      <div className="vt-enter mx-auto max-w-5xl space-y-10 px-6 py-10">
        <Alert variant="error">User profiles are not available — no backend endpoint</Alert>
      </div>
    );
  }

  if (!viewedUser) {
    return (
      <div className="vt-enter mx-auto max-w-5xl space-y-10 py-10 px-6">
        <Card className="border border-white/10 bg-white/5 p-10">
          <div className="flex justify-center">
            <Loader size="lg" label="Loading profile" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="vt-enter mx-auto max-w-5xl space-y-10 py-10 px-6">
      <section className="relative flex flex-col gap-8 overflow-hidden border border-white/10 bg-white/5 p-10 md:flex-row md:items-center">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-5 pointer-events-none select-none">
          <span className="text-[180px] font-normal font-['Goonies'] leading-none">Profile</span>
        </div>

        <div className="relative group">
          <Avatar 
            userId={viewedUser.id}
            src={viewedUser.avatar}
            size="xl" 
            className="h-48 w-48 border-4 border-primary shadow-[0_0_48px_rgba(135,182,180,0.26)]" 
          />
        </div>

        <div className="z-10 flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-5xl font-normal tracking-tighter text-white font-['Goonies']">
              {viewedUser.login}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">
              User Profile
            </p>
            <p className="text-xs text-white/50">ID: {viewedUser.id}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Badge variant="success">
              {viewedUser.status}
            </Badge>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-2 border-t-primary">
            <CardHeader>
              <CardTitle className="text-xs flex items-center gap-2">
                <UserRound size={14} /> My Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/60">
                Stats and match history are not available (no backend endpoint).
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Wins', value: '—' },
            { label: 'Losses', value: '—' },
            { label: 'Winrate %', value: '—' },
          ].map((item) => (
            <Card key={item.label} className="border border-white/10 bg-white/5">
              <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                <div className="text-5xl font-black tracking-tight text-white">{item.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
