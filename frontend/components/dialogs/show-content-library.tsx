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
import { BaseDialogProps } from "./dialog-provider";
import { useJob } from "@/contexts/job-context";
import JobTables from "@/app/dashboard/library/tables";
import Link from "next/link";

type ShowContentLibrary = BaseDialogProps & {};

export function ShowContentLibrary({
  open,
  onClose,
  close,
  onOpenChange,
}: ShowContentLibrary) {
  const { data } = usePublishing();
  const { flattenedRows } = useJob();

  const filteredRows = flattenedRows.filter(
    (row) => !data?.some((d) => d.special_reference_id === row.id)
  );

  const formattedRow = flattenedRows.map((row) => {
    const publish_status = data?.find(
      (p) => p.special_reference_id === row.id
    )?.status;
    const scheduled_at = data?.find(
      (p) => p.special_reference_id === row.id
    )?.scheduled_at;
    return {
      ...row,
      publish: {
        status: publish_status ?? null,
        scheduled_at: scheduled_at ?? null,
      },
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>Review and continue.</DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-2 overflow-x-scroll overflow-y-scroll">
          <JobTables flattenedRows={formattedRow} />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Link href="/dashboard/work" passHref>
            <Button
              onClick={() => {
                onClose();
              }}
              asChild
            >
              <a>Go to Dashboard</a>
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
