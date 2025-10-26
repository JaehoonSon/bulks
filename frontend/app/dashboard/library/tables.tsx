"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Tables } from "@/database.types";
import {
  CarouselModelResponse,
  CarouselObjectType,
  DefaultJobResult,
  JobStatus,
  VideoModelResponse,
  VideoObjectType,
} from "@/hooks/models";
import { DownloadPost } from "@/hooks/usePublish";
import { useJob } from "@/contexts/job-context";
import { useDialog } from "@/components/dialogs/dialog-provider";
import Link from "next/link";

export type FlattenedRowWithPublish = FlattenedRow & {
  publish: {
    status: Database["public"]["Enums"]["post_status"] | null;
    scheduled_at:
      | Database["public"]["Tables"]["publishing"]["Row"]["scheduled_at"]
      | null;
  };
};

interface JobTablesProps {
  flattenedRows: FlattenedRowWithPublish[];
  showControls?: boolean;
}

export type FlattenedRow = {
  id: string; // original id + index
  status: JobStatus;
  job_type: string;
  created_at: string;
  updated_at: string;
  result: CarouselObjectType | VideoObjectType | null;
};

export default function JobTables({
  flattenedRows,
  showControls = true,
}: JobTablesProps) {
  const dialog = useDialog();
  useEffect(() => {
    console.log(flattenedRows);
  }, [flattenedRows]);
  // const { flattenedRows } = useJob();
  // const flattenedRows: FlattenedRow[] = (data ?? []).flatMap((r) => {
  //   if (r.job_type === "CAROUSEL") {
  //     const res = r.result as DefaultJobResult<CarouselModelResponse> | null;
  //     const items = res?.content ?? [];
  //     return items.map(
  //       (item, idx): FlattenedRow => ({
  //         id: `${r.id}-${idx}`,
  //         status: r.status as JobStatus,
  //         job_type: r.job_type ?? "CAROUSEL",
  //         created_at: r.created_at,
  //         updated_at: r.finished_at ?? r.started_at ?? r.created_at,
  //         result: item, // CarouselObjectType
  //       })
  //     );
  //   }

  //   if (r.job_type === "VIDEO") {
  //     const res = r.result as DefaultJobResult<VideoModelResponse> | null;
  //     const items = res?.content ?? [];
  //     return items.map(
  //       (item, idx): FlattenedRow => ({
  //         id: `${r.id}-${idx}`,
  //         status: r.status as JobStatus,
  //         job_type: r.job_type ?? "VIDEO",
  //         created_at: r.created_at,
  //         updated_at: r.finished_at ?? r.started_at ?? r.created_at,
  //         result: item, // VideoObjectType
  //       })
  //     );
  //   }

  //   return [];
  // });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [pubBusy, setPubBusy] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<FlattenedRowWithPublish>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <Button
            variant={"link"}
            // onClick={() => dialog.showContentPreview(row.original)}
            onClick={() => dialog.showContentPreviewWithId(row.original.id)}
            className="text-black"
          >
            <div className="max-w-[28rem] truncate">
              {row.original.result?.title || "(no title)"}
            </div>
          </Button>
        ),
        // search over title + desc
        filterFn: (row, _id, value) => {
          const q = String(value || "").toLowerCase();
          if (!q) return true;
          const t = (row.original.result?.title || "").toLowerCase();
          const d = (row.original.result?.caption || "").toLowerCase();
          return t.includes(q) || d.includes(q);
        },
      },
      {
        id: "publish",
        header: "Publish",
        cell: ({ row }) => {
          const st = row.original.publish?.status ?? null;
          const sched = row.original.publish?.scheduled_at ?? null;
          const schedText = sched
            ? new Date(String(sched)).toLocaleString()
            : "Not scheduled";
          return (
            <Button
              variant={"ghost"}
              className="justify-start h-auto p-0 hover:bg-transparent"
              onClick={() => dialog.showPreviewPublished(row.original.id)}
              title="View publish details"
            >
              <div className="flex flex-col items-start gap-1 text-left">
                <Badge
                  variant={(() => {
                    switch (st) {
                      case "published":
                        return "success";
                      case "failed":
                        return "destructive";
                      default:
                        return "default";
                    }
                  })()}
                >
                  {st ?? "—"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {schedText}
                </span>
              </div>
            </Button>
          );
        },
      },
      {
        accessorKey: "job_type",
        header: "Type",
        cell: ({ row }) => <Badge>{row.getValue<string>("job_type")}</Badge>,
        filterFn: (row, id, value) => {
          const v = value as string | undefined;
          return !v || row.getValue<string>(id) === v;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={(() => {
              switch (row.getValue<string>("status")) {
                case "finished":
                  return "success";
                case "failed":
                  return "destructive";
                default:
                  return "default";
              }
            })()}
          >
            {row.getValue<string>("status")}
          </Badge>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "Updated",
        cell: ({ row }) => {
          const v = row.getValue<string>("updated_at");
          return new Date(v).toLocaleString();
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              title="Download"
              onClick={() => DownloadPost(row.original)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              title="Publish"
              onClick={async () => {
                setPubBusy(row.original.id);
                try {
                  // await PublishPost(row.original.id);
                  dialog.showPublishing(row.original);
                } finally {
                  setPubBusy(null);
                }
              }}
              disabled={pubBusy === row.original.id}
            >
              <Rocket className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [pubBusy]
  );

  const table = useReactTable({
    data: flattenedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-3">
      {showControls && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search title or description..."
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              setSearch(v);
              table.getColumn("title")?.setFilterValue(v);
            }}
            className="w-full sm:w-[340px]"
          />
          <Select
            value={typeFilter || "all"}
            onValueChange={(v) => {
              const next = v === "all" ? undefined : v;
              setTypeFilter(next);
              table.getColumn("job_type")?.setFilterValue(next);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="CAROUSEL">CAROUSEL</SelectItem>
              <SelectItem value="VIDEO">VIDEO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((r) => (
            <TableRow key={r.id} data-state={r.getIsSelected() && "selected"}>
              {r.getVisibleCells().map((c) => (
                <TableCell key={c.id}>
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Pagination controls */}
      {showControls && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-2">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1} · Rows {table.getRowModel().rows.length}{" "}
            / {table.getPrePaginationRowModel().rows.length}
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rows / page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="30">30 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
