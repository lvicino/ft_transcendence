// src/pages/Profile.tsx
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserRound, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";

import { useAuth, useToast, useChat } from "../store";
import { cn, displayTag } from "../lib/utils";
import { apiFetch } from "../net/http";
import { getErrorMessage } from "../net/api";

type ProfileUser = {
  id: string;
  login: string;
  avatar: string | null;
  status: string;
};
type ProfileStats = {
  wins: number;
  losses: number;
  winrate: number;
  rating: number;
  gamesPlayed: number;
};
type ProfileMatch = {
  id: string;
  opponentLogin: string;
  result: string;
};
type ProfileResponse = {
  user: ProfileUser;
  stats: ProfileStats;
  recentMatches: ProfileMatch[];
};
type FriendEntry = { id: number; username: string; online?: boolean };

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { success, error: showError } = useToast();
  const { friends, onlineUsers, addFriend, removeFriend, fetchFriends } = useChat();

  const effectiveUserId = id ?? user?.id ?? "dev";
  const isOwnProfile = Boolean(user?.id && effectiveUserId === user.id);

  const [profileData, setProfileData] = React.useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [friendLoading, setFriendLoading] = React.useState(false);

  // Check if this user is in our friends list
  const isFriend = friends.some((f) => String(f.id) === String(effectiveUserId));

  // Check online status from live data
  const isOnline = onlineUsers.some((u) => String(u.id) === String(effectiveUserId));

  // ── Profile data fetching ──
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
      setLoadError(t("profileIdMissing"));
      return;
    }
    fetchProfile();
  }, [fetchProfile, effectiveUserId]);

  // ── Friends data ──
  // Fetch our own friends on mount
  React.useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // For other users' profiles: fetch their friends
  const [fetchedFriends, setFetchedFriends] = React.useState<FriendEntry[]>([]);
  const [profileFriendsLoading, setProfileFriendsLoading] = React.useState(!isOwnProfile);

  React.useEffect(() => {
    if (isOwnProfile || !effectiveUserId) return;

    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch(`/api/chat/friends/${effectiveUserId}`);
        if (!cancelled && Array.isArray(data)) {
          setFetchedFriends(data.map((f: any) => ({ id: f.id, username: f.username })));
        }
      } catch {
        if (!cancelled) setFetchedFriends([]);
      } finally {
        if (!cancelled) setProfileFriendsLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [effectiveUserId, isOwnProfile]);

  // Merge live online status into the friends list
  const profileFriends: FriendEntry[] = React.useMemo(() => {
    const source = isOwnProfile ? friends : fetchedFriends;
    const onlineIds = new Set(onlineUsers.map((u) => u.id));
    return source.map((f) => ({ ...f, online: onlineIds.has(f.id) }));
  }, [isOwnProfile, friends, fetchedFriends, onlineUsers]);

  // ── Profile editing ──
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const newLogin = formData.get("login") as string;
    try {
      let nextLogin = viewedUser?.login ?? user?.username ?? "";

      if (newLogin && newLogin !== viewedUser?.login) {
        await updateProfile(newLogin);
        nextLogin = newLogin;
      }

      setProfileData((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                login: nextLogin,
              },
            }
          : current
      );

      success(t("profileUpdated"));
      setIsEditing(false);
    } catch (err) {
      showError(getErrorMessage(err instanceof Error ? err.message : "API_ERROR"));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Friend actions ──
  async function handleAddFriend() {
    if (!effectiveUserId) return;
    setFriendLoading(true);
    try {
      await addFriend(Number(effectiveUserId));
      success(t("friendAdded"));
    } catch (err: any) {
      showError(err?.message ?? "Failed to add friend");
    } finally {
      setFriendLoading(false);
    }
  }

  async function handleRemoveFriend() {
    if (!effectiveUserId) return;
    setFriendLoading(true);
    try {
      await removeFriend(Number(effectiveUserId));
      success(t("friendRemoved"));
    } catch (err: any) {
      showError(err?.message ?? "Failed to remove friend");
    } finally {
      setFriendLoading(false);
    }
  }

  function handleViewProfile(userId: number | string) {
    const myId = user?.id;
    if (String(userId) === String(myId)) {
      navigate("/me");
    } else {
      navigate(`/users/${userId}`);
    }
  }

  const viewedUser = profileData?.user;
  const viewedStats = profileData?.stats;
  const profileStatus = viewedUser?.status ?? (isOnline ? "online" : "offline");

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
      {/* Profile Header Card */}
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

            {/* Add/Remove friend buttons (only on other users' profiles) */}
            {!isOwnProfile && (
              <div className="flex gap-2 justify-center md:justify-start">
                <Button
                  size="sm"
                  disabled={isFriend || friendLoading}
                  onClick={handleAddFriend}
                  isLoading={friendLoading && !isFriend}
                >
                  {isFriend ? t("alreadyFriend") ?? "Already friends" : t("addFriend")}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isFriend || friendLoading}
                  onClick={handleRemoveFriend}
                  isLoading={friendLoading && isFriend}
                >
                  {t("removeFriend")}
                </Button>
              </div>
            )}

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
        {/* Matches / Friends Card */}
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
            ) : null}
          </CardContent>
        </Card>

        {/* Stats Cards */}
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

      {/* Friends List */}
      <Card className="border-t-2 border-t-primary">
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <Users size={14} />
            {isOwnProfile ? t("myFriends") ?? "My Friends" : t("friends") ?? "Friends"} ({profileFriends.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {profileFriendsLoading ? (
            <div className="flex justify-center py-6">
              <Loader size="md" />
            </div>
          ) : profileFriends.length === 0 ? (
            <p className="text-sm text-white/60 text-center py-6">
              {isOwnProfile ? t("noFriendsYet") ?? "No friends yet" : t("noFriendsYet") ?? "No friends yet"}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profileFriends.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleViewProfile(f.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3",
                    "transition-colors hover:bg-white/10 hover:border-white/10 text-left"
                  )}
                >
                  <Avatar userId={String(f.id)} size="sm" className="h-8 w-8 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-white truncate block">
                      {displayTag(f.username, f.id)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full flex-shrink-0",
                      f.online ? "bg-emerald-400" : "bg-white/20"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
