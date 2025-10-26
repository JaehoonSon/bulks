"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { format, setHours, setMinutes, setSeconds } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateTimePicker({
  date,
  setDate,
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!rootRef.current) return;

    const dialogContent = rootRef.current.closest(
      "[data-slot='dialog-content']"
    ) as HTMLElement | null;

    setPortalContainer(dialogContent ?? null);
  }, []);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (!timeValue || !date) return;

    const [hours, minutes, seconds] = timeValue.split(":").map(Number);
    const newDate = setSeconds(
      setMinutes(setHours(date, hours), minutes),
      seconds || 0
    );
    setDate(newDate);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      // setDate(null);
      return;
    }

    // Preserve time from current date if it exists
    if (date) {
      const newDate = setSeconds(
        setMinutes(setHours(selectedDate, date.getHours()), date.getMinutes()),
        date.getSeconds()
      );
      setDate(newDate);
    } else {
      setDate(selectedDate);
    }
  };

  return (
    <div ref={rootRef} className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            container={portalContainer}
            className="z-50 w-auto overflow-hidden p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if ((e.target as HTMLElement).closest("[data-calendar-root]"))
                e.preventDefault();
            }}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={format(date as Date, "HH:mm:ss")}
          onChange={handleTimeChange}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
