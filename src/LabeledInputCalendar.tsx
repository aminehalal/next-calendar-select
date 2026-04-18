"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
}) => {
  const calendarTexts = { ...DEFAULT_TEXTS, ...texts };
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
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="mb-4 text-center">
            <button
              onClick={() => setShowManualEntry(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:underline dark:text-slate-200"
            >
              <Edit3 className="h-4 w-4" />
              {calendarTexts.enterDateManually}
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
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
                  className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                    !currentMonthDay ? "text-slate-400 dark:text-slate-600" : ""
                  } ${
                    disabled
                      ? "cursor-not-allowed opacity-30"
                      : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  } ${
                    selected
                      ? "bg-blue-600 text-white"
                      : todayDate
                        ? "border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                        : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showManualEntry && (
        <div className="mb-4 rounded-lg bg-slate-100 p-6 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-slate-100">
              <Edit3 className="h-5 w-5" />
              {calendarTexts.enterDateManually}
            </div>
            <button
              onClick={() => setShowManualEntry(false)}
              className="rounded-full p-2 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <input
              ref={dayRef}
              type="text"
              placeholder="DD"
              value={manualInput.day}
              onChange={(e) => handleManualInputChange("day", e.target.value)}
              maxLength={2}
              className="h-12 w-12 rounded border border-slate-300 bg-white text-center text-base text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
            />
            <span className="text-xl text-slate-500 dark:text-slate-400">
              /
            </span>

            <input
              ref={monthRef}
              type="text"
              placeholder="MM"
              value={manualInput.month}
              onChange={(e) => handleManualInputChange("month", e.target.value)}
              maxLength={2}
              className="h-12 w-12 rounded border border-slate-300 bg-white text-center text-base text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
            />
            <span className="text-xl text-slate-500 dark:text-slate-400">
              /
            </span>

            <input
              ref={yearRef}
              type="text"
              placeholder="YYYY"
              value={manualInput.year}
              onChange={(e) => handleManualInputChange("year", e.target.value)}
              maxLength={4}
              className="h-12 w-20 rounded border border-slate-300 bg-white text-center text-base text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
            />
          </div>
          <button
            onClick={applyManualDate}
            className="mt-4 h-10 w-full rounded-full bg-blue-600 text-sm font-medium text-white transition-all hover:shadow-md dark:bg-blue-500"
          >
            {calendarTexts.applyDate}
          </button>
        </div>
      )}
    </>
  );

  const renderMonthsView = () => (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-4 gap-3">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => handleMonthSelect(index)}
            className={`aspect-square rounded-lg text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              currentMonth.getMonth() === index
                ? "bg-blue-600 text-white"
                : "text-slate-900 dark:text-slate-100"
            }`}
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
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid grid-cols-4 gap-3">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className={`aspect-square rounded-lg text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                currentYear === year
                  ? "bg-blue-600 text-white"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${className} flex flex-col`}>
      <div className="relative">
        <input
          id={name}
          type="text"
          readOnly
          name={name}
          value={value ? formatDisplayDate(value) : ""}
          onClick={() => !isDisabled && setIsOpen(true)}
          className={`peer h-14 w-full cursor-pointer rounded border bg-transparent px-4 pr-12 text-base text-slate-900 focus:outline-none dark:text-slate-100 ${
            isError
              ? "border-2 border-red-500 dark:border-red-400"
              : "border-slate-300 dark:border-slate-600"
          } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
        />
        <label
          htmlFor={name}
          className={`pointer-events-none absolute ${isRTL ? "right-4" : "left-4"} transform transition-all duration-200 ${
            value
              ? "-top-2 px-1 text-xs"
              : "top-[16px] px-1 text-base peer-focus:-top-2 peer-focus:text-xs"
          } ${bgColor} text-slate-700 dark:text-slate-200`}
        >
          {label || ""}
        </label>
        <Calendar
          className={`pointer-events-none absolute ${isRTL ? "left-4" : "right-4"} top-[16px] h-5 w-5 text-slate-500 dark:text-slate-400`}
        />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="mx-4 flex w-full max-w-md flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "scaleIn 0.2s ease-out" }}
          >
            <div className="bg-blue-600 p-4 text-white dark:bg-blue-500">
              {viewMode === "days" && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevMonth}
                    className="rounded-full p-2 transition-all hover:bg-white/10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setViewMode("months");
                        setShowManualEntry(false);
                      }}
                      className="rounded-lg px-3 py-1 text-lg font-medium transition-all hover:bg-white/10"
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
                      className="rounded-lg px-3 py-1 text-lg font-medium transition-all hover:bg-white/10"
                    >
                      {currentMonth.getFullYear()}
                    </button>
                  </div>

                  <button
                    onClick={handleNextMonth}
                    className="rounded-full p-2 transition-all hover:bg-white/10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}

              {viewMode === "months" && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevYear}
                    className="rounded-full p-2 transition-all hover:bg-white/10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={() => setViewMode("years")}
                    className="rounded-lg px-3 py-1 text-lg font-medium transition-all hover:bg-white/10"
                  >
                    {currentMonth.getFullYear()}
                  </button>

                  <button
                    onClick={handleNextYear}
                    className="rounded-full p-2 transition-all hover:bg-white/10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}

              {viewMode === "years" && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevYearRange}
                    className="rounded-full p-2 transition-all hover:bg-white/10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <div className="text-lg font-medium">
                    {getYearsRange()[0]} -{" "}
                    {getYearsRange()[getYearsRange().length - 1]}
                  </div>

                  <button
                    onClick={handleNextYearRange}
                    className="rounded-full p-2 transition-all hover:bg-white/10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              {viewMode === "days" && renderDaysView()}
              {viewMode === "months" && renderMonthsView()}
              {viewMode === "years" && renderYearsView()}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-10 flex-1 rounded-full border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {calendarTexts.cancel}
                </button>

                {viewMode === "days" && (
                  <button
                    onClick={() => {
                      handleDateSelect(today);
                    }}
                    disabled={isDateDisabled(today)}
                    className="h-10 flex-1 rounded-full bg-blue-600 px-4 text-sm font-medium text-white transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500"
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
                    className="h-10 flex-1 rounded-full bg-blue-600 px-4 text-sm font-medium text-white transition-all hover:shadow-md dark:bg-blue-500"
                  >
                    {viewMode === "years"
                      ? calendarTexts.backToMonths
                      : calendarTexts.backToDays}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LabeledInputCalendar;
