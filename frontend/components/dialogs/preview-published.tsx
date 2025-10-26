import { usePublishing } from "@/contexts/publishing-context";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { BaseDialogProps, useDialog } from "./dialog-provider";
import { useJob } from "@/contexts/job-context";
import JobTables from "@/app/dashboard/library/tables";
import Link from "next/link";
import { SkipBack, Trash } from "lucide-react";
import { deletePost, publishNow, updatePost } from "@/hooks/usePublish";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { DateTimePicker } from "../ui/date-time-picker";
import { useAccounts } from "@/contexts/accounts-context";
import { Select } from "../ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Database } from "@/database.types";

type PreviewPublished = BaseDialogProps & {
  previewId: string;
};

export function PreviewPublished({
  open,
  onClose,
  close,
  onOpenChange,
  previewId,
}: PreviewPublished) {
  const { data, refetch } = usePublishing();
  const { accounts, loading } = useAccounts();

  const dialog = useDialog();
  const publishData = data?.find((d) => d.special_reference_id === previewId);

  if (publishData == null || publishData.post_type == null) return null;

  // const payload = JSON.parse(publishData.payload);

  // const [title, setTitle] = useState<string>(payload.title);]
  const payload = publishData.payload as {
    title: string;
    description: string;
  };
  const [title, setTitle] = useState<string>(payload.title);
  const [caption, setCaption] = useState<string>(payload.description);
  const [date, setDate] = useState<Date>(new Date(publishData.scheduled_at));
  const [selectedOpenId, setSelectedOpenId] = useState<string | undefined>(
    publishData.open_id ?? undefined
  );

  if (publishData.status === "published")
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Publishing Content</DialogTitle>
            <DialogDescription>Review and continue.</DialogDescription>
          </DialogHeader>
          <div>
            <Empty>
              <EmptyHeader>
                <EmptyMedia></EmptyMedia>
                <EmptyTitle>Post already published</EmptyTitle>
                <EmptyDescription>You&apos;re all caught up!</EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="space-y-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  <SkipBack />
                  Back
                </Button>
              </EmptyContent>
            </Empty>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[80vh] flex flex-col"
        // onPointerDownOutside={(e) => {
        //   e.preventDefault(); // Prevent the default behavior of closing on outside click
        // }}
      >
        <DialogHeader>
          <DialogTitle
            onClick={() => {
              console.log("TIE");
              console.log(publishData.special_reference_id);
            }}
          >
            Preview Publishing Content
          </DialogTitle>

          <DialogDescription>Review and continue.</DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div>
            <Label htmlFor="publish-account">Select account</Label>
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading accounts…
              </div>
            ) : (accounts?.length ?? 0) > 0 ? (
              <Select
                value={selectedOpenId}
                onValueChange={(v) => setSelectedOpenId(v)}
              >
                <SelectTrigger id="publish-account" className="w-full">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts!.map((acc) => (
                    <SelectItem key={acc.id} value={acc.open_id}>
                      <span className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={acc.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {acc.handle?.slice(0, 2)?.toUpperCase() || "TT"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[220px]">
                          {acc.handle ? `@${acc.handle}` : acc.open_id}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // <div className="rounded-md border p-3 text-sm text-muted-foreground">
              //   No TikTok accounts connected.
              // </div>
              <Link
                href="/dashboard/accounts"
                className="w-full"
                onClick={onClose}
              >
                <Button className="w-full">Connect TikTok Account</Button>
              </Link>
            )}
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Caption</Label>
            <Input
              type="text"
              placeholder="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-at">Schedule Time</Label>
            <DateTimePicker date={date} setDate={setDate} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            onClick={async () => {
              try {
                await deletePost(publishData?.id || "");
                await refetch();
                onClose();
              } catch (error: any) {
                toast.error(error.message ?? "Failed to delete post");
              }
            }}
          >
            <Trash />
            Delete
          </Button>
          <Button
            onClick={async () => {
              try {
                await updatePost(
                  publishData,
                  publishData.id,
                  publishData.post_type as Database["public"]["Enums"]["post_type"],
                  title,
                  caption,
                  date,
                  selectedOpenId as string
                );
                await refetch();
                onClose();
              } catch (error: any) {
                toast.error(error.message ?? "Failed to update post");
              }
            }}
          >
            Update Now
          </Button>

          <Button
            onClick={async () => {
              try {
                await publishNow(publishData.id);
                await refetch();
                onClose();
              } catch (err: any) {
                toast.error(err.message ?? "Failed to publish post");
              }
            }}
          >
            {publishData.status !== "failed"
              ? "Retry & Publish"
              : "Publish Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
