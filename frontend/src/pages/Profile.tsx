import * as React from 'react';
import { useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';

import { Alert } from '../components/ui/Alert';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { fetchUserProfile, type UserProfileResponse } from '@/net/users';
import { useAuth, useToast } from '../store';

function buildMockProfileFromAuthUser(user: NonNullable<ReturnType<typeof useAuth>['user']>): UserProfileResponse {
  return {
    user: {
      id: user.id,
      login: user.username,
      avatar: user.avatar ?? null,
      status: 'online',
    },
    stats: {
      wins: 0,
      losses: 0,
      winrate: 0,
      rating: 1000,
      gamesPlayed: 0,
    },
    recentMatches: [],
  };
}

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { success } = useToast();

  const effectiveUserId = id ?? user?.id ?? null;
  const isOwnProfile = Boolean(user?.id && effectiveUserId === user.id);
  const [profileData, setProfileData] = React.useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isFriend, setIsFriend] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    if (!effectiveUserId) {
      setIsLoading(false);
      setLoadError('Profile id is missing');
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    void fetchUserProfile(effectiveUserId)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          if (isOwnProfile && user) {
            setProfileData(buildMockProfileFromAuthUser(user));
            setLoadError(null);
            return;
          }
          setLoadError('Unable to load profile');
          setProfileData(null);
          return;
        }
        setProfileData(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId]);

  const viewedUser = profileData?.user ?? null;
  const viewedStats = profileData?.stats ?? null;
  const profileStatus = viewedUser?.status ?? 'offline';

  if (isLoading && !profileData) {
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

  if (loadError) {
    return (
      <div className="vt-enter mx-auto max-w-5xl space-y-10 px-6 py-10">
        <Alert variant="error">{loadError}</Alert>
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
            userId={viewedUser?.id}
            src={viewedUser?.avatar}
            size="xl" 
            className="h-48 w-48 border-4 border-primary shadow-[0_0_48px_rgba(135,182,180,0.26)]" 
          />
        </div>

        <div className="z-10 flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-5xl font-normal tracking-tighter text-white font-['Goonies']">
              {viewedUser?.login || 'Unknown'}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">
              User Profile
            </p>
            <p className="text-xs text-white/50">ID: {viewedUser?.id ?? 'N/A'}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Badge
              variant={
                profileStatus === 'online'
                  ? 'success'
                  : profileStatus === 'ingame'
                    ? 'warning'
                    : 'outline'
              }
            >
              {profileStatus}
            </Badge>
            <Badge variant="outline" className="border-primary/50 text-primary">
              Rating {viewedStats?.rating ?? 0}
            </Badge>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {isOwnProfile && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => success('Edit profile action')}
                >
                  Edit profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => success('Upload avatar action')}
                >
                  Upload avatar
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-2 border-t-primary">
            <CardHeader>
              <CardTitle className="text-xs flex items-center gap-2">
                <UserRound size={14} /> {isOwnProfile ? 'My Matches' : 'Friend actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isOwnProfile ? (
                profileData?.recentMatches.length ? (
                  <div className="space-y-3">
                    {profileData.recentMatches.slice(0, 5).map((match) => (
                      <article key={match.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            size="sm"
                            userId={match.id}
                            src={match.opponentAvatar}
                            alt={match.opponentLogin}
                          />
                          <div>
                            <p className="text-sm text-white">{match.opponentLogin}</p>
                            <p className="text-xs text-white/50">{new Date(match.playedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={match.result === 'win' ? 'text-emerald-400 text-xs uppercase' : 'text-rose-400 text-xs uppercase'}>
                            {match.result}
                          </p>
                          <p className="text-xs text-white/70">{match.score}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">No recent matches yet.</p>
                )
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={isFriend}
                    onClick={() => {
                      setIsFriend(true);
                      success('Friend added');
                    }}
                  >
                    Add friend
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!isFriend}
                    onClick={() => {
                      setIsFriend(false);
                      success('Friend removed');
                    }}
                  >
                    Remove friend
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Wins', value: String(viewedStats?.wins ?? 0) },
            { label: 'Losses', value: String(viewedStats?.losses ?? 0) },
            { label: 'Winrate %', value: `${viewedStats?.winrate ?? 0}%` },
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
