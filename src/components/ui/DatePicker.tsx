"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  error?: boolean;
  className?: string;
  placeholder?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function DatePicker({
  value,
  onChange,
  minDate,
  error,
  className,
  placeholder = "Select a date",
}: DatePickerProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  const minDateObj = minDate ? new Date(minDate) : null;

  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Add days from previous month to fill the first week
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(new Date(year, month, -firstDay.getDay() + i + 1));
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }

  function isDateDisabled(date: Date): boolean {
    if (!minDateObj) return false;
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateOnly = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
    return dateOnly < minDateOnly;
  }

  function isCurrentMonth(date: Date): boolean {
    return date.getMonth() === currentMonth.getMonth();
  }

  function isSelected(date: Date): boolean {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function handleDateClick(date: Date) {
    if (isDateDisabled(date)) return;
    const formattedDate = date.toISOString().split("T")[0];
    onChange(formattedDate);
    setIsOpen(false);
  }

  function goToPreviousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  function formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const days = getDaysInMonth(currentMonth);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 rounded-xl text-left",
          "bg-background text-text-primary",
          "shadow-[var(--shadow-neumorphic-inset-light)]",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          "transition-all duration-200 cursor-pointer",
          error && "ring-2 ring-error",
          !value && "text-text-secondary",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span>{value ? formatDisplayDate(value) : placeholder}</span>
          <Icon path={ICON_PATHS.calendar} size="sm" className="text-text-secondary" />
        </div>
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-80 p-4 rounded-2xl",
            "bg-background",
            "shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-background cursor-pointer",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "active:shadow-[var(--shadow-neumorphic-inset-light)]",
                "transition-all duration-200"
              )}
            >
              <Icon path={ICON_PATHS.chevronLeft} size="sm" className="text-text-primary" />
            </button>
            <span className="font-semibold text-text-primary">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-background cursor-pointer",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "active:shadow-[var(--shadow-neumorphic-inset-light)]",
                "transition-all duration-200"
              )}
            >
              <Icon path={ICON_PATHS.chevronRight} size="sm" className="text-text-primary" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-text-secondary py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const disabled = isDateDisabled(date);
              const selected = isSelected(date);
              const today = isToday(date);
              const inCurrentMonth = isCurrentMonth(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={disabled}
                  className={cn(
                    "w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200",
                    inCurrentMonth ? "text-text-primary" : "text-text-secondary/50",
                    disabled && "opacity-30 cursor-not-allowed",
                    !disabled && !selected && "hover:bg-primary/10 cursor-pointer",
                    selected && cn(
                      "bg-primary text-white",
                      "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                    ),
                    today && !selected && cn(
                      "ring-2 ring-primary/50"
                    )
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                if (!isDateDisabled(today)) {
                  handleDateClick(today);
                }
              }}
              className={cn(
                "w-full py-2 rounded-lg text-sm font-medium text-primary",
                "hover:bg-primary/10 transition-colors cursor-pointer"
              )}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
