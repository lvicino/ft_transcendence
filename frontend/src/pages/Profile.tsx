// src/pages/Profile.tsx
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { Alert } from "../components/ui/Alert";

import { useAuth, useToast, useChat } from "../store";
import { cn, displayTag } from "../lib/utils";
import { apiFetch } from "../net/http";

type FriendEntry = { id: number; username: string; online?: boolean };

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { friends, onlineUsers, addFriend, removeFriend, fetchFriends } = useChat();

  const effectiveUserId = id ?? user?.id ?? null;
  const isOwnProfile = Boolean(user?.id && effectiveUserId === user.id);

  const [friendLoading, setFriendLoading] = React.useState(false);

  // Check if this user is in our friends list
  const isFriend = friends.some((f) => String(f.id) === String(effectiveUserId));

  // Check online status from live data
  const isOnline = onlineUsers.some((u) => String(u.id) === String(effectiveUserId));

  // Find username from online users or friends list
  const knownUsername = React.useMemo(() => {
    if (isOwnProfile) return user?.username ?? "You";
    const onlineMatch = onlineUsers.find((u) => String(u.id) === String(effectiveUserId));
    if (onlineMatch) return onlineMatch.username;
    const friendMatch = friends.find((f) => String(f.id) === String(effectiveUserId));
    if (friendMatch) return friendMatch.username;
    return null;
  }, [isOwnProfile, user, onlineUsers, friends, effectiveUserId]);

  const displayName = knownUsername ?? (isOwnProfile ? user?.username ?? "You" : `User #${effectiveUserId}`);

  // ── Friends list: own profile uses the store (instant), other profiles poll the API ──
  const [fetchedFriends, setFetchedFriends] = React.useState<FriendEntry[]>([]);
  const [profileFriendsLoading, setProfileFriendsLoading] = React.useState(!isOwnProfile);

  // Fetch our own friends on mount
  React.useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // For other users' profiles: fetch their friends on mount + poll every 5s
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

  // Merge live online status from WebSocket into the friends list
  const profileFriends: FriendEntry[] = React.useMemo(() => {
    const source = isOwnProfile ? friends : fetchedFriends;
    const onlineIds = new Set(onlineUsers.map((u) => u.id));
    return source.map((f) => ({ ...f, online: onlineIds.has(f.id) }));
  }, [isOwnProfile, friends, fetchedFriends, onlineUsers]);

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

  if (!effectiveUserId) {
    return (
      <div className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <Alert variant="error">Profile id is missing</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-10 px-6">
      {/* Profile Header */}
      <section className="flex flex-col gap-8 border border-white/10 bg-white/5 p-10 md:flex-row md:items-center">
        <Avatar
          userId={effectiveUserId}
          size="xl"
          className="h-48 w-48 border-4 border-primary"
        />

        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-5xl text-white font-['Goonies']">
            {displayTag(displayName, effectiveUserId)}
          </h1>

          <p className="text-xs text-white/50">{t("idLabel")}: {effectiveUserId}</p>

          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Badge
              variant={isOnline ? "success" : "outline"}
            >
              {isOnline ? "online" : "offline"}
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
        </div>
      </section>

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
