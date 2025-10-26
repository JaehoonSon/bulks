"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { H1, H2, Large } from "@/components/ui/typography";
import { useAccounts } from "@/contexts/accounts-context";
import { useJob } from "@/contexts/job-context";
import JobTables from "./tables";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Cloud, MessageSquare, Wand2 } from "lucide-react";
import Link from "next/link";
import { usePublishing } from "@/contexts/publishing-context";
import { useEffect } from "react";
import { format } from "path";

export default function Page() {
  const { flattenedRows, loading, refreshJobs } = useJob();
  const { data, refetch } = usePublishing();

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
    <div className="p-4">
      <div className="flex items-center justify-between">
        {/* <Large>Your Videos</Large> */}
        <H2 className="border-0">Welcome to Your Video Library</H2>
        <Button
          onClick={async () => {
            await refreshJobs();
            await refetch();
          }}
        >
          {loading && <Spinner />} Refresh
        </Button>
      </div>
      <div>
        {/* TanStack Table */}
        {flattenedRows.length === 0 && !loading ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Cloud />
              </EmptyMedia>
              <EmptyTitle>No Content Found</EmptyTitle>
              <EmptyDescription>
                You have not generated any content yet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="space-x-2">
                <Link href={"/dashboard/video"}>
                  <Button variant="outline" size="sm">
                    <Wand2 />
                    Generate Video
                  </Button>
                </Link>
                <Link href={"/dashboard/video"}>
                  <Button variant="outline" size="sm">
                    <MessageSquare />
                    Generate Video
                  </Button>
                </Link>
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          <JobTables flattenedRows={formattedRow} />
        )}
      </div>
    </div>
  );
}
