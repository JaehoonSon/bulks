"use client";

import { useMemo, useState, type ComponentType } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfWeek,
} from "date-fns";
import {
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock3,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { useDialog } from "@/components/dialogs/dialog-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePublishing } from "@/contexts/publishing-context";
import type { PublishingRow } from "@/contexts/publishing-context";
import { Spinner } from "@/components/ui/spinner";

type PublishingStatus = NonNullable<PublishingRow["status"]> | "scheduled";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_CONFIG: Record<
  PublishingStatus | "draft",
  {
    label: string;
    icon: ComponentType<{ className?: string }>;
    badge: string;
    iconWrapper: string;
  }
> = {
  scheduled: {
    label: "Scheduled",
    icon: CalendarClock,
    badge:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200 border border-transparent",
    iconWrapper:
      "bg-sky-500/15 text-sky-600 dark:bg-sky-500/10 dark:text-sky-200",
  },
  publishing: {
    label: "Publishing",
    icon: Loader2,
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-transparent",
    iconWrapper:
      "bg-blue-500/15 text-blue-600 dark:bg-blue-500/10 dark:text-blue-200",
  },
  published: {
    label: "Published",
    icon: CheckCircle2,
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 border border-transparent",
    iconWrapper:
      "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  failed: {
    label: "Failed",
    icon: AlertTriangle,
    badge:
      "bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20 dark:text-destructive",
    iconWrapper:
      "bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-destructive-foreground",
  },
  canceled: {
    label: "Canceled",
    icon: XCircle,
    badge:
      "bg-muted text-muted-foreground border border-muted-foreground/20 dark:bg-muted/40 dark:text-muted-foreground",
    iconWrapper:
      "bg-muted text-muted-foreground dark:bg-muted/40 dark:text-muted-foreground",
  },
  queued: {
    label: "Queued",
    icon: Clock3,
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 border border-transparent",
    iconWrapper:
      "bg-amber-500/15 text-amber-600 dark:bg-amber-500/10 dark:text-amber-200",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    badge:
      "bg-muted text-muted-foreground border border-muted-foreground/20 dark:bg-muted/40 dark:text-muted-foreground",
    iconWrapper:
      "bg-muted text-muted-foreground dark:bg-muted/40 dark:text-muted-foreground",
  },
};

function getEventStatus(event: PublishingRow): {
  label: string;
  Icon: ComponentType<{ className?: string }>;
  badgeClassName: string;
  iconWrapperClassName: string;
} {
  const normalizedStatus: PublishingStatus | "draft" =
    event.status ?? (event.published_at ? "published" : "scheduled");
  const config = STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG.scheduled;
  return {
    label: config.label,
    Icon: config.icon,
    badgeClassName: cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
      config.badge
    ),
    iconWrapperClassName: cn(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
      config.iconWrapper
    ),
  };
}

function getEventDate(event: PublishingRow): Date | null {
  const dateString =
    (event.status === "published" && event.published_at) ||
    event.scheduled_at ||
    event.published_at ||
    event.created_at;

  if (!dateString) {
    return null;
  }

  try {
    return parseISO(dateString);
  } catch (error) {
    return null;
  }
}

function getEventText(event: PublishingRow) {
  const payload = event.payload as
    | {
        title?: unknown;
        description?: unknown;
      }
    | null
    | undefined;

  const title =
    payload && typeof payload === "object" && "title" in payload
      ? typeof payload.title === "string"
        ? payload.title
        : undefined
      : undefined;
  const description =
    payload && typeof payload === "object" && "description" in payload
      ? typeof payload.description === "string"
        ? payload.description
        : undefined
      : undefined;

  return {
    title: title?.trim() || "Untitled content",
    description: description?.trim() || undefined,
  };
}

export default function CalendarPage() {
  const dialog = useDialog();
  const { data, loading, refetch } = usePublishing();
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const monthLabel = format(currentMonth, "MMMM yyyy");
  const monthKey = format(currentMonth, "yyyy-MM");

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    const days: Date[] = [];

    for (let date = start; date <= end; date = addDays(date, 1)) {
      days.push(date);
    }

    return days;
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, PublishingRow[]>();
    if (!data) return map;

    for (const event of data) {
      const eventDate = getEventDate(event);
      if (!eventDate) continue;

      const key = format(eventDate, "yyyy-MM-dd");
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(event);
    }

    for (const [, events] of map) {
      events.sort((a, b) => {
        const dateA = getEventDate(a)?.getTime() ?? 0;
        const dateB = getEventDate(b)?.getTime() ?? 0;
        return dateA - dateB;
      });
    }

    return map;
  }, [data]);

  const hasEventsThisMonth = useMemo(() => {
    for (const key of eventsByDay.keys()) {
      if (key.startsWith(monthKey)) {
        return true;
      }
    }
    return false;
  }, [eventsByDay, monthKey]);

  const goToPreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const goToCurrentMonth = () => setCurrentMonth(startOfMonth(new Date()));

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-hidden p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Content Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize and manage your scheduled and published content in one
            place.
          </p>
        </div>
        <div className="flex space-x-2 items-center">
          <Button onClick={() => dialog.showContentLibrary()}>
            <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Publish new content
          </Button>
          <Button onClick={refetch} aria-hidden="true">
            {loading && <Spinner />} Refresh
          </Button>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden py-0 gap-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/40 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <span className="sr-only">Next month</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div>
              <CardTitle className="text-lg font-semibold">
                {loading ? "Fetching your Data" : monthLabel}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-x-scroll p-0">
          {/* {!loading && !hasEventsThisMonth ? (
            <div className="border-b border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              No content scheduled for {monthLabel}. Use "Publish new content"
              to plan ahead.
            </div>
          ) : null} */}
          <div className="grid grid-cols-7 border-b border-border/80 bg-muted/30 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="border-r border-border/60 px-3 py-2 last:border-r-0"
              >
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-t border-border/60 text-sm">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const events = eventsByDay.get(key) ?? [];
              const isCurrentMonthDay = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={key}
                  className={cn(
                    "flex min-h-[20vh] max-h-[20vh] flex-col gap-2 border-r border-b border-border/60 bg-background p-3 transition-colors last:border-r-0",
                    !isCurrentMonthDay && "bg-muted/10 text-muted-foreground",
                    isToday &&
                      "ring-2 ring-primary/80 ring-offset-2 ring-offset-background"
                  )}
                >
                  {/* Header of Cell */}
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        !isCurrentMonthDay && "text-muted-foreground/80"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {events.length > 0 ? (
                      <span className="text-[0.65rem] text-muted-foreground">
                        {events.length}{" "}
                        {events.length === 1 ? "event" : "events"}
                      </span>
                    ) : null}
                  </div>
                  {/* Body of the cell */}
                  <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden">
                    {events.map((event) => {
                      const eventDate = getEventDate(event);
                      const {
                        label,
                        Icon,
                        badgeClassName,
                        iconWrapperClassName,
                      } = getEventStatus(event);
                      const { title, description } = getEventText(event);

                      const eventId = event.special_reference_id || event.id;

                      return (
                        <button
                          key={`${event.id}-${
                            event.special_reference_id ?? "default"
                          }`}
                          type="button"
                          onClick={() => {
                            // dialog.showContentPreviewWithId(eventId);
                            dialog.showPreviewPublished(eventId);
                          }}
                          className={cn(
                            "group flex w-full flex-col gap-2 rounded-lg border border-transparent bg-primary/5 p-2 text-left transition hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                            !isCurrentMonthDay &&
                              "bg-muted/30 hover:border-muted-foreground/30 hover:bg-muted/40"
                          )}
                        >
                          <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                            <div className={iconWrapperClassName}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            {eventDate ? (
                              <div className="flex items-center gap-1 font-medium">
                                <CalendarClock className="h-3 w-3 text-primary" />
                                <span>{format(eventDate, "p")}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 font-medium">
                                <Clock3 className="h-3 w-3 text-primary" />
                                <span>Time TBD</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-semibold leading-tight text-foreground line-clamp-2">
                              {title}
                            </p>
                            {description ? (
                              // <p className="text-[0.7rem] text-muted-foreground line-clamp-3">
                              //   {description}
                              // </p>
                              <p></p>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge
                              className={badgeClassName}
                              variant="secondary"
                            >
                              <Icon className="h-3 w-3" />
                              <span>{label}</span>
                            </Badge>
                            {/* {event.channel ? (
                              <span className="text-[0.65rem] font-medium text-muted-foreground">
                                {event.channel}
                              </span>
                            ) : null} */}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
