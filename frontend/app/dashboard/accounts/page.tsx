"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccounts } from "@/contexts/accounts-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Link2,
  Link2Off,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function getExpiryDisplay(expiresAt: string | null | undefined) {
  if (!expiresAt) {
    return { text: "Unknown", expired: false };
  }
  const expiryDate = new Date(expiresAt);
  if (Number.isNaN(expiryDate.getTime())) {
    return { text: "Unknown", expired: false };
  }

  const expired = expiryDate.getTime() <= Date.now();
  const distance = formatDistanceToNow(expiryDate, { addSuffix: true });
  return {
    text: expired ? `${distance} (expired)` : distance,
    expired,
  };
}

function formatLinkedAt(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

function scopeBadges(scope: string | null | undefined) {
  if (!scope) return null;
  const parts = scope
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((part) => (
        <Badge key={part} variant="outline">
          {part}
        </Badge>
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const {
    accounts,
    loading,
    refreshAccounts,
    startConnect,
    relinkAccount,
    unlinkAccount,
  } = useAccounts();
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [relinking, setRelinking] = useState<string | null>(null);
  const [authorizationDialog, setAuthorizationDialog] = useState<{
    url: string;
    type: "connect" | "relink";
    openId?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const connectedCount = accounts?.length ?? 0;
  const hasAccounts = !loading && connectedCount > 0;

  const sortedAccounts = useMemo(() => {
    if (!accounts) return [];
    return [...accounts].sort((a, b) =>
      a.created_at > b.created_at ? -1 : a.created_at < b.created_at ? 1 : 0
    );
  }, [accounts]);

  const handleRefresh = async () => {
    setError(null);
    setRefreshing(true);
    try {
      await refreshAccounts();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      const authorizeUrl = await startConnect();
      setAuthorizationDialog({ url: authorizeUrl, type: "connect" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setConnecting(false);
    }
  };

  const handleUnlink = async (openId: string) => {
    setError(null);
    setUnlinking(openId);
    try {
      await unlinkAccount(openId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setUnlinking(null);
    }
  };

  const handleRelink = async (openId: string) => {
    setError(null);
    setRelinking(openId);
    try {
      const authorizeUrl = await relinkAccount(openId);
      setAuthorizationDialog({
        url: authorizeUrl,
        type: "relink",
        openId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setRelinking(null);
    }
  };

  useEffect(() => {
    setCopied(false);
  }, [authorizationDialog?.url]);

  const handleCopyLink = async () => {
    if (!authorizationDialog?.url) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(authorizationDialog.url);
        setCopied(true);
      }
    } catch (err) {
      console.error("Failed to copy authorization link", err);
    }
  };

  const handleOpenLink = () => {
    if (!authorizationDialog?.url) return;
    if (typeof window !== "undefined") {
      window.open(authorizationDialog.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Connect Accounts
              </h1>
              <p className="text-muted-foreground">
                Manage and refresh the TikTok accounts linked to your workspace.
              </p>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle>TikTok Accounts</CardTitle>
                  <CardDescription>
                    {connectedCount === 1
                      ? "1 account connected"
                      : `${connectedCount} accounts connected`}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    {connecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    Connect account
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {error ? (
                  <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Something went wrong</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {loading ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : hasAccounts ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Open ID</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Access expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAccounts.map((account) => {
                        const expiryInfo = getExpiryDisplay(account.expires_at);
                        return (
                          <TableRow key={account.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage
                                    src={account.avatar_url ?? undefined}
                                  />
                                  <AvatarFallback>
                                    {account.handle
                                      ?.slice(0, 2)
                                      .toUpperCase() ??
                                      account.open_id.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {account.handle
                                      ? `@${account.handle}`
                                      : "Unknown handle"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Linked {formatLinkedAt(account.created_at)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell
                              className="font-mono text-xs max-w-[100px] truncate"
                              title={account.open_id}
                            >
                              {account.open_id}
                            </TableCell>
                            <TableCell>{scopeBadges(account.scope)}</TableCell>
                            <TableCell
                              className={
                                expiryInfo.expired
                                  ? "text-destructive"
                                  : undefined
                              }
                            >
                              {expiryInfo.text}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {expiryInfo.expired ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRelink(account.open_id)
                                    }
                                    disabled={relinking === account.open_id}
                                  >
                                    {relinking === account.open_id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                    Relink
                                  </Button>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnlink(account.open_id)}
                                  disabled={unlinking === account.open_id}
                                >
                                  {unlinking === account.open_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Link2Off className="h-4 w-4" />
                                  )}
                                  Unlink
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <UserPlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">No accounts connected yet</p>
                      <p className="text-sm text-muted-foreground">
                        Connect your TikTok account to start publishing directly
                        from the platform.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleConnect}
                      disabled={connecting}
                    >
                      {connecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                      Connect account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={authorizationDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAuthorizationDialog(null);
            setCopied(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {authorizationDialog?.type === "relink"
                ? "Relink TikTok account"
                : "Connect TikTok account"}
            </DialogTitle>
            <DialogDescription>
              Copy and open this link in a new tab to finish authorizing TikTok.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input readOnly value={authorizationDialog?.url ?? ""} />
            <p className="text-xs text-muted-foreground">
              Make sure you are signed into the correct TikTok account before
              proceeding.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              disabled={!authorizationDialog?.url}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy link
                </>
              )}
            </Button>
            <Button
              onClick={handleOpenLink}
              disabled={!authorizationDialog?.url}
            >
              Open link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
