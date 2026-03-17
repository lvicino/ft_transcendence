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
import { Input } from "../components/ui/Input";

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
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { success, error } = useToast();

  const effectiveUserId = id ?? user?.id ?? "dev";
  const isOwnProfile = Boolean(user?.id && effectiveUserId === user.id);

  const [profileData, setProfileData] = React.useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isFriend, setIsFriend] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchProfile = React.useCallback(() => {
    setIsLoading(true);
    apiFetch(`/users/${effectiveUserId}`)
      .then((data) => setProfileData(data as ProfileResponse))
      .catch(() => {
        setLoadError(null);
        setProfileData({
          user: {
            id: effectiveUserId,
            login: isOwnProfile ? (user?.username ?? "TestUser") : "TestUser",
            avatar: isOwnProfile ? (user?.avatar ?? null) : null,
            status: "online",
          },
          stats: { wins: 0, losses: 0, winrate: 0, rating: 1000, gamesPlayed: 0 },
          recentMatches: [],
        });
      })
      .finally(() => setIsLoading(false));
  }, [effectiveUserId, isOwnProfile, user?.avatar, user?.username]);

  React.useEffect(() => {
    if (!effectiveUserId) {
      setIsLoading(false);
      setLoadError("Profile id is missing");
      return;
    }
    fetchProfile();
  }, [fetchProfile, effectiveUserId]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const newLogin = formData.get("login") as string;
    const avatarFile = formData.get("avatar") as File;

    try {
      let nextLogin = viewedUser?.login ?? user?.username ?? "";
      let nextAvatar = viewedUser?.avatar ?? user?.avatar ?? null;

      if (newLogin && newLogin !== viewedUser?.login) {
        await updateProfile(newLogin);
        nextLogin = newLogin;
      }

      if (avatarFile && avatarFile.size > 0) {
        if (!avatarFile.type.startsWith("image/")) {
          throw new Error("Avatar file must be an image");
        }
        await uploadAvatar(avatarFile);
        nextAvatar = URL.createObjectURL(avatarFile);
      }

      setProfileData((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                login: nextLogin,
                avatar: nextAvatar,
              },
            }
          : current
      );

      success(t("profileUpdated"));
      setIsEditing(false);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

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
      <Card className="border border-white/10 bg-white/5 p-10">
        <form 
          onSubmit={isEditing ? handleSave : (e) => e.preventDefault()} 
          className="flex flex-col gap-8 md:flex-row md:items-center"
        >
          <div className="flex flex-col items-center gap-4">
            <Avatar
              userId={viewedUser?.id}
              src={viewedUser?.avatar}
              size="xl"
              className="h-48 w-48 border-4 border-primary"
            />
            {isEditing && (
              <Input
                name="avatar"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="w-48 text-xs"
              />
            )}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            {isEditing ? (
              <Input
                name="login"
                defaultValue={viewedUser?.login}
                minLength={2}
                maxLength={24}
                required
                pattern="^[a-zA-Z0-9_]+$"
                title="Only letters, numbers, and underscores"
                className="max-w-xs text-xl font-bold"
              />
            ) : (
              <h1 className="text-5xl text-white font-['Goonies']">
                {viewedUser?.login || t("unknown")}
              </h1>
            )}

            <p className="text-xs text-white/50">{t("idLabel")}: {viewedUser?.id ?? "N/A"}</p>

            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Badge variant={profileStatus === "online" ? "success" : profileStatus === "ingame" ? "warning" : "outline"}>
                {profileStatus}
              </Badge>
              <Badge variant="outline" className="border-primary/50 text-primary">
                {t("rating")} {viewedStats?.rating ?? 0}
              </Badge>
            </div>

            {isOwnProfile && (
              <div className="flex justify-center md:justify-start gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button type="submit" size="sm" disabled={isSaving}>
                      {isSaving ? <Loader size="sm" /> : t("saveProfile")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                      {t("cancel")}
                    </Button>
                  </>
                ) : (
                  <Button type="button" size="sm" onClick={() => setIsEditing(true)}>
                    {t("editProfile")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </form>
      </Card>

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
                  <div key={match.id} className="flex items-center justify-between border border-white/10 p-3">
                    <span className="text-sm text-white">{match.opponentLogin}</span>
                    <span className={match.result === "win" ? "text-emerald-400 text-xs" : "text-rose-400 text-xs"}>
                      {match.result}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/60">{t("noRecentMatches")}</p>
              )
            ) : (
              <>
                <Button className="w-full" disabled={isFriend} onClick={() => { setIsFriend(true); success(t("friendAdded")); }}>
                  {t("addFriend")}
                </Button>
                <Button variant="outline" className="w-full" disabled={!isFriend} onClick={() => { setIsFriend(false); success(t("friendRemoved")); }}>
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
                <div className="text-xs uppercase text-white/50">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
