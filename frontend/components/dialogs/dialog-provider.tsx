"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/contexts/accounts-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { DateTimePicker } from "../ui/date-time-picker";
import { addHours } from "date-fns";
import { FlattenedRow } from "@/app/dashboard/library/tables";
import { Input } from "../ui/input";
import { DownloadPost, schedulePost } from "@/hooks/usePublish";
import { toast } from "sonner";
import { useJob } from "@/contexts/job-context";
import CarouselPlayer from "../player/CarouselPlayer";
import { CarouselObjectType, VideoObjectType } from "@/hooks/models";
import VideoPlayer from "../player/VideoPlayer";
import { Spinner } from "../ui/spinner";
import { ShowContentLibrary } from "./show-content-library";
import { PreviewPublished } from "./preview-published";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "../ui/empty";
import { Icon, PiIcon } from "lucide-react";

type DialogKind =
  | { type: "preview"; data: FlattenedRow }
  | { type: "publishing"; publishData: FlattenedRow }
  | { type: "preview-with-id"; previewId: string }
  | { type: "show-content-library" }
  | { type: "preview-published"; previewId: string }
  | null;

type DialogContextValue = {
  showContentPreview: (data: FlattenedRow) => void;
  showContentPreviewWithId: (previewId: string) => void;
  showPublishing: (publishData: FlattenedRow) => void;
  showContentLibrary: () => void;
  showPreviewPublished: (previewId: string) => void;
  closeTop: () => void;
  closeAll: () => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<DialogKind[]>([]);

  // Push helpers
  const showContentLibrary = useCallback(() => {
    setStack((s) => [...s, { type: "show-content-library" }]);
  }, []);

  const showContentPreview = useCallback((data: FlattenedRow) => {
    setStack((s) => [...s, { type: "preview", data }]);
  }, []);

  const showContentPreviewWithId = useCallback((previewId: string) => {
    setStack((s) => [...s, { type: "preview-with-id", previewId }]);
  }, []);

  const showPublishing = useCallback((publishData: FlattenedRow) => {
    setStack((s) => [...s, { type: "publishing", publishData }]);
  }, []);

  const showPreviewPublished = useCallback((previewId: string) => {
    setStack((s) => [...s, { type: "preview-published", previewId }]);
  }, []);

  // Pop helpers
  const closeTop = useCallback(() => {
    setStack((s) => (s.length ? s.slice(0, s.length - 1) : s));
  }, []);

  const closeAll = useCallback(() => {
    setStack([]);
  }, []);

  // Close the dialog at index i and everything above it
  const closeFromIndex = useCallback((i: number) => {
    setStack((s) => s.slice(0, i));
  }, []);

  const value = useMemo(
    () => ({
      showContentPreview,
      showPublishing,
      showContentLibrary,
      showContentPreviewWithId,
      showPreviewPublished,
      closeTop,
      closeAll,
    }),
    [
      showContentPreview,
      showPublishing,
      showContentLibrary,
      showContentPreviewWithId,
      showPreviewPublished,
      closeTop,
      closeAll,
    ]
  );

  // Each dialog is controlled. When shadcn Dialog calls onOpenChange(false),
  // remove that layer and anything above it.
  const renderLayer = (active: DialogKind, i: number) => {
    const onOpenChange = (next: boolean) => {
      if (!next) closeFromIndex(i);
    };
    const common = {
      open: true, // keep mounted and visible
      onClose: () => closeFromIndex(i),
      close: closeAll, // optional global close
      onOpenChange,
      // Optional: bump z-index to stack visually
      // @ts-ignore
      style: { zIndex: 50 + i },
    };

    if (active?.type === "preview") {
      return (
        <PreviewContentDialog
          key={`preview-${i}`}
          {...common}
          data={active.data}
        />
      );
    }
    if (active?.type === "publishing") {
      return (
        <PublishingDialog
          key={`publishing-${i}`}
          {...common}
          publishData={active.publishData}
        />
      );
    }
    if (active?.type === "preview-with-id") {
      return (
        <PreviewContentWithIdDialog
          key={`previewid-${i}`}
          {...common}
          previewId={active.previewId}
        />
      );
    }
    if (active?.type === "show-content-library") {
      return <ShowContentLibrary key={`library-${i}`} {...common} />;
    }
    if (active?.type === "preview-published") {
      return (
        <PreviewPublished
          key={`preview-published-${i}`}
          {...common}
          previewId={active.previewId}
        />
      );
    }
    return null;
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      {stack.map((active, i) => renderLayer(active, i))}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within <DialogProvider>");
  return ctx;
}

/* ================================
   Concrete dialog components
   Each receives: open, onClose, close
   Keep primitive: buttons + minimal copy
   ================================ */

export type BaseDialogProps = {
  open: boolean;
  onClose: () => void; // required
  close: () => void; // alias, same function
  onOpenChange?: (open: boolean) => void; // internal wiring for shadcn
};

type PreviewContentWithId = BaseDialogProps & {
  previewId: string;
};

export function PreviewContentWithIdDialog({
  open,
  onClose,
  close,
  onOpenChange,
  previewId,
}: PreviewContentWithId) {
  const { flattenedRows } = useJob();
  const data = flattenedRows.find((r) => r.id === previewId);
  if (!data)
    return (
      <Dialog>
        <DialogContent>
          <DialogTitle>No Preview Available</DialogTitle>
        </DialogContent>
      </Dialog>
    );
  return (
    <PreviewContentDialog
      open={open}
      onClose={onClose}
      close={close}
      onOpenChange={onOpenChange}
      data={data}
    />
  );
}

/* PaymentDialog */
type PreviewContentProps = BaseDialogProps & {
  data: FlattenedRow;
};

export function PreviewContentDialog({
  open,
  onClose,
  close,
  onOpenChange,
  data,
}: PreviewContentProps) {
  const [downloadLoading, setDownloadLoading] = useState(false);
  // const { flattenedRows } = useJob();

  if (!data || data.result === null)
    return (
      <Dialog>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogTitle>No Preview Available</DialogTitle>
        </DialogContent>
      </Dialog>
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          {/* <DialogDescription>Review and continue.</DialogDescription> */}
        </DialogHeader>
        {/* 
        <div className="space-y-2 py-2 justify-center">
          {data?.job_type === "CAROUSEL" && (
            <div className="mx-auto max-w-sm">
              <CarouselPlayer
                data={data.result as CarouselObjectType}
                autoPlay={true}
                showControls={true}
              />
            </div>
          )}
          {data?.job_type === "VIDEO" && (
            <div className="mx-auto max-w-sm">
              <VideoPlayer data={data.result as VideoObjectType} />
            </div>
          )}
        </div> */}
        <div className="space-y-2 py-2 justify-center overflow-y-auto">
          {data?.job_type === "CAROUSEL" && (
            <div className="mx-auto max-w-sm">
              <CarouselPlayer
                data={data.result as CarouselObjectType}
                autoPlay
                showControls
              />
            </div>
          )}
          {data?.job_type === "VIDEO" && (
            <div className="mx-auto max-w-sm">
              <VideoPlayer data={data.result as VideoObjectType} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              // placeholder action
              try {
                setDownloadLoading(true);
                await DownloadPost(data);
              } catch (err: any) {
                toast.error(err?.message || "Error downloading post.");
              } finally {
                setDownloadLoading(false);
              }
            }}
          >
            {downloadLoading && <Spinner />}
            {downloadLoading ? "Downloading..." : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* PublishingDialog */
type PublishingDialogProps = BaseDialogProps & {
  // publishId: string;
  publishData: FlattenedRow;
};

export function PublishingDialog({
  open,
  onClose,
  close,
  onOpenChange,
  publishData,
}: PublishingDialogProps) {
  if (!publishData) return null;

  const { accounts, loading } = useAccounts();
  const [selectedOpenId, setSelectedOpenId] = useState<string | undefined>();
  const [publishTitle, setPublishTitle] = useState(
    publishData.result?.title || ""
  );
  const [publishDescription, setPublishDescription] = useState(
    publishData.result?.caption || ""
  );
  const [date, setDate] = React.useState<Date>(addHours(new Date(), 3));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[80vh] flex flex-col"
        // onPointerDownOutside={(e) => {
        //   e.preventDefault(); // Prevent the default behavior of closing on outside click
        // }}
      >
        <DialogHeader>
          <DialogTitle>Publish content</DialogTitle>
          <DialogDescription>ID: {publishData.id}</DialogDescription>
        </DialogHeader>

        {/* <div className="py-2 text-sm">
          This will push your draft live. Continue?
        </div> */}
        <div className="space-y-3 py-1">
          <div className="space-y-2">
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
            <Label htmlFor="schedule-at">Schedule Time</Label>
            <DateTimePicker date={date} setDate={setDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publish-title">Title</Label>
            <Input
              id="publish-title"
              placeholder={"Enter Title"}
              value={publishTitle}
              onChange={(e) => setPublishTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publish-description">Description</Label>
            <Input
              id="publish-description"
              placeholder={"Enter Description"}
              value={publishDescription}
              onChange={(e) => setPublishDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={
              !selectedOpenId || !date || !publishTitle || !publishDescription
            }
            onClick={async () => {
              try {
                await schedulePost(
                  publishData,
                  publishData.id,
                  selectedOpenId!,
                  date!,
                  publishTitle,
                  publishDescription
                );
                toast.success("Post scheduled.");
              } catch (err: any) {
                toast.error(err.message || "Error scheduling post.");
              }
            }}
          >
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================
   Minimal usage examples
   Put anywhere under <DialogProvider>
   ================================ */

// export function ExampleButtons() {
//   const dlg = useDialog();
//   return (
//     <div className="flex gap-2">
//       <Button
//         onClick={() => dlg.showPayment("Pro Plan", 19.0, "Monthly renewal")}
//       >
//         Show Payment
//       </Button>
//       <Button variant="outline" onClick={() => dlg.showPublishing("pub_12345")}>
//         Show Publishing
//       </Button>
//     </div>
//   );
// }
