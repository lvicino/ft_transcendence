// src/pages/Profile.tsx
import * as React from "react";
import { useParams } from "react-router-dom";
import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Alert } from "../components/ui/Alert";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";

import { apiFetch } from "../net/http";
import { useAuth, useToast } from "../store";

type ProfileResponse = {
  user: {
    id: string;
    login: string;
    avatar: string | null;
    status: "online" | "offline" | "ingame";
  };
  stats: {
    wins: number;
    losses: number;
    winrate: number;
    rating: number;
    gamesPlayed: number;
  };
  recentMatches: {
    id: string;
    opponentLogin: string;
    opponentAvatar: string | null;
    score: string;
    result: "win" | "loss";
    playedAt: string;
  }[];
};

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { success } = useToast();

  const effectiveUserId = id ?? user?.id ?? "dev";  //rm "dev" to "null" after auth will be working
  const isOwnProfile = Boolean(user?.id && effectiveUserId === user.id);

  const [profileData, setProfileData] = React.useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isFriend, setIsFriend] = React.useState(false);

  React.useEffect(() => {
    if (!effectiveUserId) {
      setIsLoading(false);
      setLoadError("Profile id is missing");
      return;
    }

    setIsLoading(true);

    apiFetch(`/users/${effectiveUserId}`)
      .then((data) => setProfileData(data as ProfileResponse))
      .catch(() => {
        setLoadError(null);
        setProfileData({
          user: {
            id: effectiveUserId,
            login: "TestUser",
            avatar: null,
            status: "online",
          },
          stats: {
            wins: 0,
            losses: 0,
            winrate: 0,
            rating: 1000,
            gamesPlayed: 0,
          },
          recentMatches: [],
        });
      })
      .finally(() => setIsLoading(false));
  }, [effectiveUserId]);

  const viewedUser = profileData?.user;
  const viewedStats = profileData?.stats;
  const profileStatus = viewedUser?.status ?? "offline";

  if (isLoading && !profileData) {
    return (
      <div className="mx-auto max-w-5xl space-y-10 py-10 px-6">
        <Card className="border border-white/10 bg-white/5 p-10">
          <div className="flex justify-center">
            <Loader size="lg" label={t("loadingProfile")} />
          </div>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <Alert variant="error">{loadError}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-10 px-6">
      <section className="flex flex-col gap-8 border border-white/10 bg-white/5 p-10 md:flex-row md:items-center">

        <Avatar
          userId={viewedUser?.id}
          src={viewedUser?.avatar}
          size="xl"
          className="h-48 w-48 border-4 border-primary"
        />

        <div className="flex-1 space-y-4 text-center md:text-left">
          {/* Backend identity fields stay untranslated by design. */}
          <h1 className="text-5xl text-white font-['Goonies']">
            {viewedUser?.login || t("unknown")}
          </h1>

          <p className="text-xs text-white/50">{t("idLabel")}: {viewedUser?.id ?? "N/A"}</p>

          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Badge
              variant={
                profileStatus === "online"
                  ? "success"
                  : profileStatus === "ingame"
                  ? "warning"
                  : "outline"
              }
            >
              {profileStatus}
            </Badge>

            <Badge variant="outline" className="border-primary/50 text-primary">
              {t("rating")} {viewedStats?.rating ?? 0}
            </Badge>
          </div>

          {isOwnProfile && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => success(t("editProfile"))}
              >
                {t("editProfile")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => success(t("uploadAvatar"))}
              >
                {t("uploadAvatar")}
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-t-2 border-t-primary">
          <CardHeader>
            <CardTitle className="text-xs flex items-center gap-2">
              <UserRound size={14} />
              {isOwnProfile ? t("myMatches") : t("friendActions")}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {isOwnProfile ? (
              profileData?.recentMatches?.length ? (
                profileData.recentMatches.slice(0, 5).map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between border border-white/10 p-3"
                  >
                    <span className="text-sm text-white">
                      {match.opponentLogin}
                    </span>

                    <span
                      className={
                        match.result === "win"
                          ? "text-emerald-400 text-xs"
                          : "text-rose-400 text-xs"
                      }
                    >
                      {match.result}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/60">
                  {t("noRecentMatches")}
                </p>
              )
            ) : (
              <>
                <Button
                  className="w-full"
                  disabled={isFriend}
                  onClick={() => {
                    setIsFriend(true);
                    success(t("friendAdded"));
                  }}
                >
                  {t("addFriend")}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!isFriend}
                  onClick={() => {
                    setIsFriend(false);
                    success(t("friendRemoved"));
                  }}
                >
                  {t("removeFriend")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: t("wins"), value: viewedStats?.wins ?? 0 },
            { label: t("losses"), value: viewedStats?.losses ?? 0 },
            { label: t("winrate"), value: `${viewedStats?.winrate ?? 0}%` },
          ].map((item) => (
            <Card key={item.label} className="border border-white/10 bg-white/5">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-5xl text-white">{item.value}</div>
                <div className="text-xs uppercase text-white/50">
                  {item.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
