"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Calendar, ChevronLeft, ChevronRight, Edit3, X } from "lucide-react";

export interface LabeledInputCalendarTexts {
  enterDateManually: string;
  applyDate: string;
  cancel: string;
  today: string;
  backToMonths: string;
  backToDays: string;
  dateNotAvailable: string;
  enterValidDate: string;
  completeDate: string;
}

export interface LabeledInputCalendarColorPalette {
  primary: string;
  onPrimary: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  error: string;
  muted: string;
  scrim: string;
}

export interface LabeledInputCalendarColors {
  light?: Partial<LabeledInputCalendarColorPalette>;
  dark?: Partial<LabeledInputCalendarColorPalette>;
}

export interface LabeledInputCalendarProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isError?: boolean;
  bgColor?: string;
  isDisabled?: boolean;
  isOldDaysBlocked?: boolean;
  isUpcomingDaysBlocked?: boolean;
  className?: string;
  locale?: string;
  isRTL?: boolean;
  texts?: Partial<LabeledInputCalendarTexts>;
  colors?: LabeledInputCalendarColors;
}

const DEFAULT_TEXTS: LabeledInputCalendarTexts = {
  enterDateManually: "Enter date manually",
  applyDate: "Apply date",
  cancel: "Cancel",
  today: "Today",
  backToMonths: "Back to months",
  backToDays: "Back to days",
  dateNotAvailable: "This date is not available.",
  enterValidDate: "Please enter a valid date.",
  completeDate: "Please complete day, month, and year.",
};

const DEFAULT_LIGHT_COLORS: LabeledInputCalendarColorPalette = {
  primary: "#2563eb",
  onPrimary: "#ffffff",
  surface: "#ffffff",
  onSurface: "#0f172a",
  surfaceVariant: "#f1f5f9",
  onSurfaceVariant: "#64748b",
  outline: "#cbd5e1",
  error: "#ef4444",
  muted: "#94a3b8",
  scrim: "rgba(0, 0, 0, 0.5)",
};

const DEFAULT_DARK_COLORS: LabeledInputCalendarColorPalette = {
  primary: "#3b82f6",
  onPrimary: "#ffffff",
  surface: "#0f172a",
  onSurface: "#f1f5f9",
  surfaceVariant: "#1e293b",
  onSurfaceVariant: "#94a3b8",
  outline: "#475569",
  error: "#f87171",
  muted: "#475569",
  scrim: "rgba(0, 0, 0, 0.5)",
};

const parseDateString = (dateString: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getMonthShortNames = (locale: string): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
  return Array.from({ length: 12 }, (_, monthIndex) =>
    formatter.format(new Date(2024, monthIndex, 1)),
  );
};

const getWeekdayShortNames = (locale: string): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, dayOffset) =>
    formatter.format(new Date(2024, 0, 7 + dayOffset)),
  );
};

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

const LabeledInputCalendar: React.FC<LabeledInputCalendarProps> = ({
  label,
  name,
  value,
  onChange,
  isError = false,
  bgColor = "",
  isDisabled = false,
  isOldDaysBlocked = false,
  isUpcomingDaysBlocked = false,
  className = "",
  locale = "en-US",
  isRTL = false,
  texts,
  colors,
}) => {
  const calendarTexts = { ...DEFAULT_TEXTS, ...texts };
  const mergedColors = useMemo(
    () => ({
      light: { ...DEFAULT_LIGHT_COLORS, ...colors?.light },
      dark: { ...DEFAULT_DARK_COLORS, ...colors?.dark },
    }),
    [colors],
  );

  const colorVariables = useMemo(
    () =>
      ({
        "--lic-light-primary": mergedColors.light.primary,
        "--lic-light-on-primary": mergedColors.light.onPrimary,
        "--lic-light-surface": mergedColors.light.surface,
        "--lic-light-on-surface": mergedColors.light.onSurface,
        "--lic-light-surface-variant": mergedColors.light.surfaceVariant,
        "--lic-light-on-surface-variant": mergedColors.light.onSurfaceVariant,
        "--lic-light-outline": mergedColors.light.outline,
        "--lic-light-error": mergedColors.light.error,
        "--lic-light-muted": mergedColors.light.muted,
        "--lic-light-scrim": mergedColors.light.scrim,
        "--lic-dark-primary": mergedColors.dark.primary,
        "--lic-dark-on-primary": mergedColors.dark.onPrimary,
        "--lic-dark-surface": mergedColors.dark.surface,
        "--lic-dark-on-surface": mergedColors.dark.onSurface,
        "--lic-dark-surface-variant": mergedColors.dark.surfaceVariant,
        "--lic-dark-on-surface-variant": mergedColors.dark.onSurfaceVariant,
        "--lic-dark-outline": mergedColors.dark.outline,
        "--lic-dark-error": mergedColors.dark.error,
        "--lic-dark-muted": mergedColors.dark.muted,
        "--lic-dark-scrim": mergedColors.dark.scrim,
      }) as React.CSSProperties,
    [mergedColors],
  );

  const parsedValue = parseDateString(value);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    parsedValue ?? new Date(),
  );
  const [manualInput, setManualInput] = useState({
    day: "",
    month: "",
    year: "",
  });
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const [showManualEntry, setShowManualEntry] = useState<boolean>(false);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = useMemo(() => getWeekdayShortNames(locale), [locale]);
  const months = useMemo(() => getMonthShortNames(locale), [locale]);

  useEffect(() => {
    const parsed = parseDateString(value);
    if (parsed) {
      setCurrentMonth(parsed);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen && value) {
      const date = parseDateString(value);

      if (date) {
        setManualInput({
          day: String(date.getDate()).padStart(2, "0"),
          month: String(date.getMonth() + 1).padStart(2, "0"),
          year: String(date.getFullYear()),
        });
      } else {
        setManualInput({ day: "", month: "", year: "" });
      }
    } else if (isOpen && !value) {
      setManualInput({ day: "", month: "", year: "" });
    }
    setViewMode("days");
    setShowManualEntry(false);
  }, [isOpen, value]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = parseDateString(dateString);
    if (!date) return "";

    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift(prevDate);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const isDateDisabled = (date: Date): boolean => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (isOldDaysBlocked && checkDate < today) return true;
    if (isUpcomingDaysBlocked && checkDate > today) return true;
    return false;
  };

  const handleManualInputChange = (
    field: "day" | "month" | "year",
    inputValue: string,
  ) => {
    if (inputValue && !/^\d+$/.test(inputValue)) return;

    const newValue = inputValue;

    if (field === "day") {
      if (inputValue.length > 2) return;
      setManualInput((prev) => ({ ...prev, day: newValue }));

      if (inputValue.length === 2) {
        monthRef.current?.focus();
      }
    } else if (field === "month") {
      if (inputValue.length > 2) return;
      setManualInput((prev) => ({ ...prev, month: newValue }));

      if (inputValue.length === 2) {
        yearRef.current?.focus();
      }
    } else if (field === "year") {
      if (inputValue.length > 4) return;
      setManualInput((prev) => ({ ...prev, year: newValue }));
    }
  };

  const applyManualDate = () => {
    const { day, month, year } = manualInput;

    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const dateStr = `${year}-${month}-${day}`;
      const date = parseDateString(dateStr);

      if (date) {
        if (isDateDisabled(date)) {
          alert(calendarTexts.dateNotAvailable);
          return;
        }

        const syntheticEvent = {
          target: {
            name,
            value: dateStr,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
        setIsOpen(false);
      } else {
        alert(calendarTexts.enterValidDate);
      }
    } else {
      alert(calendarTexts.completeDate);
    }
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;

    const formattedDate = formatDate(date);
    const syntheticEvent = {
      target: {
        name,
        value: formattedDate,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
    setViewMode("days");
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setViewMode("months");
  };

  const handlePrevYear = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1),
    );
  };

  const handleNextYear = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1),
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handlePrevYearRange = () => {
    const newYear = currentMonth.getFullYear() - 20;
    setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
  };

  const handleNextYearRange = () => {
    const newYear = currentMonth.getFullYear() + 20;
    setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
  };

  const getYearsRange = (): number[] => {
    const currentYear = currentMonth.getFullYear();
    const startYear = currentYear - 10;
    const years: number[] = [];

    for (let i = 0; i < 20; i++) {
      years.push(startYear + i);
    }

    return years;
  };

  const days = getDaysInMonth(currentMonth);

  const isSelectedDate = (date: Date): boolean => {
    if (!value) return false;
    return formatDate(date) === value;
  };

  const isToday = (date: Date): boolean => {
    return formatDate(date) === formatDate(today);
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const renderDaysView = () => (
    <>
      {!showManualEntry && (
        <div
          className={cx(
            "lic-scroll-area",
            "max-h-[calc(100vh-200px)] overflow-y-auto",
          )}
        >
          <div className="mb-4 text-center">
            <button
              onClick={() => setShowManualEntry(true)}
              className={cx(
                "lic-manual-toggle",
                "inline-flex items-center gap-2 text-sm font-medium text-[color:var(--lic-primary)] hover:underline",
              )}
            >
              <Edit3 className="h-4 w-4" />
              {calendarTexts.enterDateManually}
            </button>
          </div>

          <div
            className={cx("lic-weekdays-grid", "mb-2 grid grid-cols-7 gap-2")}
          >
            {weekDays.map((day) => (
              <div
                key={day}
                className={cx(
                  "lic-weekday-cell",
                  "py-2 text-center text-xs font-medium text-[color:var(--lic-on-surface-variant)]",
                )}
              >
                {day}
              </div>
            ))}
          </div>

          <div className={cx("lic-days-grid", "grid grid-cols-7 gap-2")}>
            {days.map((date, index) => {
              const disabled = isDateDisabled(date);
              const selected = isSelectedDate(date);
              const todayDate = isToday(date);
              const currentMonthDay = isCurrentMonth(date);

              return (
                <button
                  key={`${date.toISOString()}-${index}`}
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={cx(
                    "lic-day-button",
                    "aspect-square rounded-lg text-sm font-medium transition-all",
                    !currentMonthDay &&
                      "lic-day-outside text-[color:var(--lic-muted)]",
                    disabled
                      ? "lic-day-disabled cursor-not-allowed opacity-30"
                      : "cursor-pointer hover:bg-[color:var(--lic-surface-variant)]",
                    selected
                      ? "lic-day-selected bg-[color:var(--lic-primary)] text-[color:var(--lic-on-primary)]"
                      : todayDate
                        ? "lic-day-today border-2 border-[color:var(--lic-primary)] text-[color:var(--lic-primary)]"
                        : "text-[color:var(--lic-on-surface)]",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showManualEntry && (
        <div
          className={cx(
            "lic-manual-panel",
            "mb-4 rounded-lg bg-[color:var(--lic-surface-variant)] p-6",
          )}
        >
          <div
            className={cx(
              "lic-manual-header",
              "mb-4 flex items-center justify-between",
            )}
          >
            <div
              className={cx(
                "lic-manual-title",
                "flex items-center gap-2 text-base font-medium text-[color:var(--lic-on-surface)]",
              )}
            >
              <Edit3 className="h-5 w-5" />
              {calendarTexts.enterDateManually}
            </div>
            <button
              onClick={() => setShowManualEntry(false)}
              className={cx(
                "lic-icon-button",
                "rounded-full p-2 transition-all hover:bg-[color:var(--lic-surface)]",
              )}
            >
              <X className="h-5 w-5 text-[color:var(--lic-on-surface-variant)]" />
            </button>
          </div>
          <div
            className={cx(
              "lic-manual-fields",
              "flex items-center justify-center gap-2",
            )}
          >
            <input
              ref={dayRef}
              type="text"
              placeholder="DD"
              value={manualInput.day}
              onChange={(e) => handleManualInputChange("day", e.target.value)}
              maxLength={2}
              className={cx(
                "lic-manual-input",
                "h-12 w-12 rounded border border-[color:var(--lic-outline)] bg-[color:var(--lic-surface)] text-center text-base text-[color:var(--lic-on-surface)] outline-none transition-all focus:border-[color:var(--lic-primary)]",
              )}
            />
            <span className="text-xl text-[color:var(--lic-on-surface-variant)]">
              /
            </span>

            <input
              ref={monthRef}
              type="text"
              placeholder="MM"
              value={manualInput.month}
              onChange={(e) => handleManualInputChange("month", e.target.value)}
              maxLength={2}
              className={cx(
                "lic-manual-input",
                "h-12 w-12 rounded border border-[color:var(--lic-outline)] bg-[color:var(--lic-surface)] text-center text-base text-[color:var(--lic-on-surface)] outline-none transition-all focus:border-[color:var(--lic-primary)]",
              )}
            />
            <span className="text-xl text-[color:var(--lic-on-surface-variant)]">
              /
            </span>

            <input
              ref={yearRef}
              type="text"
              placeholder="YYYY"
              value={manualInput.year}
              onChange={(e) => handleManualInputChange("year", e.target.value)}
              maxLength={4}
              className={cx(
                "lic-manual-input lic-manual-input-year",
                "h-12 w-20 rounded border border-[color:var(--lic-outline)] bg-[color:var(--lic-surface)] text-center text-base text-[color:var(--lic-on-surface)] outline-none transition-all focus:border-[color:var(--lic-primary)]",
              )}
            />
          </div>
          <button
            onClick={applyManualDate}
            className={cx(
              "lic-manual-apply",
              "mt-4 h-10 w-full rounded-full bg-[color:var(--lic-primary)] text-sm font-medium text-[color:var(--lic-on-primary)] transition-all hover:shadow-md",
            )}
          >
            {calendarTexts.applyDate}
          </button>
        </div>
      )}
    </>
  );

  const renderMonthsView = () => (
    <div
      className={cx(
        "lic-scroll-area",
        "max-h-[calc(100vh-200px)] overflow-y-auto",
      )}
    >
      <div className={cx("lic-picker-grid", "grid grid-cols-4 gap-3")}>
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => handleMonthSelect(index)}
            className={cx(
              "lic-picker-button",
              "aspect-square rounded-lg text-sm font-medium transition-all hover:bg-[color:var(--lic-surface-variant)]",
              currentMonth.getMonth() === index
                ? "lic-picker-button-selected bg-[color:var(--lic-primary)] text-[color:var(--lic-on-primary)]"
                : "text-[color:var(--lic-on-surface)]",
            )}
          >
            {month}
          </button>
        ))}
      </div>
    </div>
  );

  const renderYearsView = () => {
    const years = getYearsRange();
    const currentYear = currentMonth.getFullYear();

    return (
      <div
        className={cx(
          "lic-scroll-area",
          "max-h-[calc(100vh-200px)] overflow-y-auto",
        )}
      >
        <div className={cx("lic-picker-grid", "grid grid-cols-4 gap-3")}>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className={cx(
                "lic-picker-button",
                "aspect-square rounded-lg text-sm font-medium transition-all hover:bg-[color:var(--lic-surface-variant)]",
                currentYear === year
                  ? "lic-picker-button-selected bg-[color:var(--lic-primary)] text-[color:var(--lic-on-primary)]"
                  : "text-[color:var(--lic-on-surface)]",
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${className} lic-root lic-host flex flex-col`}
      style={colorVariables}
    >
      <div className="relative lic-input-wrap">
        <input
          id={name}
          type="text"
          readOnly
          name={name}
          value={value ? formatDisplayDate(value) : ""}
          onClick={() => !isDisabled && setIsOpen(true)}
          className={`peer lic-input h-14 w-full cursor-pointer rounded border bg-transparent px-4 pr-12 text-base text-[color:var(--lic-on-surface)] focus:outline-none ${
            isError
              ? "lic-input-error border-2 border-[color:var(--lic-error)]"
              : "border-[color:var(--lic-outline)]"
          } ${isDisabled ? "lic-input-disabled cursor-not-allowed opacity-50" : ""}`}
        />
        <label
          htmlFor={name}
          className={cx(
            "lic-label",
            "pointer-events-none absolute transform transition-all duration-200",
            isRTL ? "right-4" : "left-4",
            value
              ? "lic-label-float -top-2 px-1 text-xs"
              : "lic-label-rest top-[16px] px-1 text-base peer-focus:-top-2 peer-focus:text-xs",
            bgColor,
            "text-[color:var(--lic-on-surface)]",
          )}
          style={isRTL ? { right: 16 } : { left: 16 }}
        >
          {label || ""}
        </label>
        <Calendar
          className={`lic-input-icon pointer-events-none absolute ${isRTL ? "left-4" : "right-4"} top-[16px] h-5 w-5 text-[color:var(--lic-on-surface-variant)]`}
          style={isRTL ? { left: 16 } : { right: 16 }}
        />
      </div>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cx(
              "lic-overlay",
              "fixed inset-0 z-50 bg-[color:var(--lic-scrim)]",
            )}
          />
          <Dialog.Content
            className={cx(
              "lic-dialog",
              "fixed left-1/2 top-1/2 z-50 mx-4 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] bg-[color:var(--lic-surface)] shadow-xl",
            )}
          >
            <div
              className={cx(
                "lic-dialog-header",
                "bg-[color:var(--lic-primary)] p-4 text-[color:var(--lic-on-primary)]",
              )}
            >
              {viewMode === "days" && (
                <div
                  className={cx(
                    "lic-header-row",
                    "flex items-center justify-between",
                  )}
                >
                  <button
                    onClick={handlePrevMonth}
                    className={cx(
                      "lic-icon-button",
                      "rounded-full p-2 transition-all hover:bg-white/10",
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setViewMode("months");
                        setShowManualEntry(false);
                      }}
                      className={cx(
                        "lic-title-button",
                        "rounded-lg px-3 py-1 text-lg font-medium transition-all hover:bg-white/10",
                      )}
                    >
                      {currentMonth.toLocaleDateString(locale, {
                        month: "long",
                      })}
                    </button>
                    <button
                      onClick={() => {
                        setViewMode("years");
                        setShowManualEntry(false);
                      }}
                      className={cx(
                        "lic-title-button",
                        "rounded-lg px-3 py-1 text-lg font-medium transition-all hover:bg-white/10",
                      )}
                    >
                      {currentMonth.getFullYear()}
                    </button>
                  </div>

                  <button
                    onClick={handleNextMonth}
                    className={cx(
                      "lic-icon-button",
                      "rounded-full p-2 transition-all hover:bg-white/10",
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}

              {viewMode === "months" && (
                <div
                  className={cx(
                    "lic-header-row",
                    "flex items-center justify-between",
                  )}
                >
                  <button
                    onClick={handlePrevYear}
                    className={cx(
                      "lic-icon-button",
                      "rounded-full p-2 transition-all hover:bg-white/10",
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={() => setViewMode("years")}
                    className={cx(
                      "lic-title-button",
                      "rounded-lg px-3 py-1 text-lg font-medium transition-all hover:bg-white/10",
                    )}
                  >
                    {currentMonth.getFullYear()}
                  </button>

                  <button
                    onClick={handleNextYear}
                    className={cx(
                      "lic-icon-button",
                      "rounded-full p-2 transition-all hover:bg-white/10",
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}

              {viewMode === "years" && (
                <div
                  className={cx(
                    "lic-header-row",
                    "flex items-center justify-between",
                  )}
                >
                  <button
                    onClick={handlePrevYearRange}
                    className={cx(
                      "lic-icon-button",
                      "rounded-full p-2 transition-all hover:bg-white/10",
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <div className={cx("lic-range-title", "text-lg font-medium")}>
                    {getYearsRange()[0]} -{" "}
                    {getYearsRange()[getYearsRange().length - 1]}
                  </div>

                  <button
                    onClick={handleNextYearRange}
                    className={cx(
                      "lic-icon-button",
                      "rounded-full p-2 transition-all hover:bg-white/10",
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>

            <div className={cx("lic-dialog-body", "p-6")}>
              {viewMode === "days" && renderDaysView()}
              {viewMode === "months" && renderMonthsView()}
              {viewMode === "years" && renderYearsView()}

              <div className={cx("lic-actions", "mt-6 flex gap-3")}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={cx(
                    "lic-action-button lic-action-button-secondary",
                    "h-10 flex-1 rounded-full border border-[color:var(--lic-outline)] px-4 text-sm font-medium text-[color:var(--lic-primary)] transition-all hover:bg-[color:var(--lic-surface-variant)]",
                  )}
                >
                  {calendarTexts.cancel}
                </button>

                {viewMode === "days" && (
                  <button
                    onClick={() => {
                      handleDateSelect(today);
                    }}
                    disabled={isDateDisabled(today)}
                    className={cx(
                      "lic-action-button lic-action-button-primary",
                      "h-10 flex-1 rounded-full bg-[color:var(--lic-primary)] px-4 text-sm font-medium text-[color:var(--lic-on-primary)] transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {calendarTexts.today}
                  </button>
                )}

                {viewMode !== "days" && (
                  <button
                    onClick={() => {
                      if (viewMode === "years") {
                        setViewMode("months");
                      } else if (viewMode === "months") {
                        setViewMode("days");
                      }
                    }}
                    className={cx(
                      "lic-action-button lic-action-button-primary",
                      "h-10 flex-1 rounded-full bg-[color:var(--lic-primary)] px-4 text-sm font-medium text-[color:var(--lic-on-primary)] transition-all hover:shadow-md",
                    )}
                  >
                    {viewMode === "years"
                      ? calendarTexts.backToMonths
                      : calendarTexts.backToDays}
                  </button>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <style>{`
        @keyframes licScaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes licOverlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes licOverlayOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes licScaleOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
          }
        }

        .lic-host {
          position: relative;
          width: 100%;
          font-family: inherit;
        }

        .lic-input-wrap {
          position: relative;
        }

        .lic-input {
          box-sizing: border-box;
          width: 100%;
          min-height: 56px;
          padding: 0 48px 0 16px;
          border-radius: 0.5rem;
          border: 1px solid var(--lic-outline);
          background: transparent;
          color: var(--lic-on-surface);
          font-size: 1rem;
          cursor: pointer;
        }

        .lic-input:focus {
          outline: none;
        }

        .lic-input.lic-input-error {
          border-color: var(--lic-error);
          border-width: 2px;
        }

        .lic-input.lic-input-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .lic-label {
          position: absolute;
          z-index: 1;
          top: 16px;
          line-height: 1;
          padding: 0 4px;
          background: var(--lic-surface);
          color: var(--lic-on-surface);
        }

        .lic-label-rest {
          font-size: 1rem;
        }

        .lic-label-float {
          top: -8px;
          font-size: 0.75rem;
        }

        .lic-input:focus + .lic-label.lic-label-rest {
          top: -8px;
          font-size: 0.75rem;
        }

        .lic-input-icon {
          position: absolute;
          top: 16px;
          width: 20px;
          height: 20px;
          color: var(--lic-on-surface-variant);
        }

        .lic-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--lic-scrim);
        }

        .lic-overlay[data-state="open"] {
          animation: licOverlayIn 160ms ease-out;
        }

        .lic-overlay[data-state="closed"] {
          animation: licOverlayOut 120ms ease-in;
        }

        .lic-dialog {
          width: min(100%, 28rem);
          max-height: min(90vh, 760px);
          display: flex;
          flex-direction: column;
          border-radius: 2rem;
          overflow: hidden;
          background: var(--lic-surface);
          color: var(--lic-on-surface);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.35);
        }

        .lic-dialog[data-state="open"] {
          animation: licScaleIn 200ms ease-out;
        }

        .lic-dialog[data-state="closed"] {
          animation: licScaleOut 140ms ease-in;
        }

        .lic-dialog-header {
          background: var(--lic-primary);
          color: var(--lic-on-primary);
          padding: 16px;
        }

        .lic-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .lic-icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .lic-title-button {
          padding: 4px 12px;
          border: 0;
          border-radius: 0.5rem;
          background: transparent;
          color: inherit;
          font-size: 1.125rem;
          font-weight: 500;
          cursor: pointer;
        }

        .lic-range-title {
          text-align: center;
        }

        .lic-dialog-body {
          padding: 24px;
          color: var(--lic-on-surface);
        }

        .lic-scroll-area {
          max-height: calc(100vh - 220px);
          overflow-y: auto;
        }

        .lic-manual-toggle {
          border: 0;
          background: transparent;
          color: var(--lic-primary);
          cursor: pointer;
          font-weight: 500;
        }

        .lic-weekdays-grid,
        .lic-days-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 8px;
        }

        .lic-weekday-cell {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--lic-on-surface-variant);
        }

        .lic-day-button {
          aspect-ratio: 1 / 1;
          border: 0;
          border-radius: 0.5rem;
          background: transparent;
          color: var(--lic-on-surface);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease,
            transform 0.1s ease;
        }

        .lic-day-button:not(.lic-day-disabled):hover {
          background: var(--lic-surface-variant);
        }

        .lic-day-button.lic-day-outside {
          color: var(--lic-muted);
        }

        .lic-day-button.lic-day-disabled {
          opacity: 0.32;
          cursor: not-allowed;
        }

        .lic-day-button.lic-day-selected {
          background: var(--lic-primary);
          color: var(--lic-on-primary);
        }

        .lic-day-button.lic-day-today {
          border: 2px solid var(--lic-primary);
          color: var(--lic-primary);
        }

        .lic-manual-panel {
          border-radius: 0.75rem;
          background: var(--lic-surface-variant);
          margin-bottom: 16px;
          padding: 24px;
        }

        .lic-manual-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 8px;
        }

        .lic-manual-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--lic-on-surface);
          font-weight: 600;
        }

        .lic-manual-fields {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .lic-manual-input {
          box-sizing: border-box;
          width: 48px;
          height: 48px;
          border-radius: 0.375rem;
          border: 1px solid var(--lic-outline);
          background: var(--lic-surface);
          color: var(--lic-on-surface);
          text-align: center;
          font-size: 1rem;
        }

        .lic-manual-input:focus {
          outline: none;
          border-color: var(--lic-primary);
        }

        .lic-manual-input-year {
          width: 80px;
        }

        .lic-manual-apply {
          margin-top: 16px;
          width: 100%;
          height: 40px;
          border: 0;
          border-radius: 999px;
          background: var(--lic-primary);
          color: var(--lic-on-primary);
          font-weight: 600;
          cursor: pointer;
        }

        .lic-picker-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .lic-picker-button {
          aspect-ratio: 1 / 1;
          border: 0;
          border-radius: 0.5rem;
          background: transparent;
          color: var(--lic-on-surface);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .lic-picker-button:hover {
          background: var(--lic-surface-variant);
        }

        .lic-picker-button-selected {
          background: var(--lic-primary);
          color: var(--lic-on-primary);
        }

        .lic-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .lic-action-button {
          height: 40px;
          flex: 1;
          border-radius: 999px;
          padding: 0 16px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }

        .lic-action-button-secondary {
          border: 1px solid var(--lic-outline);
          background: transparent;
          color: var(--lic-primary);
        }

        .lic-action-button-secondary:hover {
          background: var(--lic-surface-variant);
        }

        .lic-action-button-primary {
          border: 0;
          background: var(--lic-primary);
          color: var(--lic-on-primary);
        }

        .lic-action-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        @media (max-width: 520px) {
          .lic-dialog {
            width: min(100%, 24rem);
            border-radius: 1.25rem;
          }

          .lic-dialog-body {
            padding: 16px;
          }

          .lic-actions {
            flex-direction: column;
          }
        }

        .lic-root {
          --lic-primary: var(--lic-light-primary);
          --lic-on-primary: var(--lic-light-on-primary);
          --lic-surface: var(--lic-light-surface);
          --lic-on-surface: var(--lic-light-on-surface);
          --lic-surface-variant: var(--lic-light-surface-variant);
          --lic-on-surface-variant: var(--lic-light-on-surface-variant);
          --lic-outline: var(--lic-light-outline);
          --lic-error: var(--lic-light-error);
          --lic-muted: var(--lic-light-muted);
          --lic-scrim: var(--lic-light-scrim);
        }

        .dark .lic-root,
        .lic-root.dark {
          --lic-primary: var(--lic-dark-primary);
          --lic-on-primary: var(--lic-dark-on-primary);
          --lic-surface: var(--lic-dark-surface);
          --lic-on-surface: var(--lic-dark-on-surface);
          --lic-surface-variant: var(--lic-dark-surface-variant);
          --lic-on-surface-variant: var(--lic-dark-on-surface-variant);
          --lic-outline: var(--lic-dark-outline);
          --lic-error: var(--lic-dark-error);
          --lic-muted: var(--lic-dark-muted);
          --lic-scrim: var(--lic-dark-scrim);
        }
      `}</style>
    </div>
  );
};

export default LabeledInputCalendar;
