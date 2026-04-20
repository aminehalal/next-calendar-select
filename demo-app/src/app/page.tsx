"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  LabeledInputCalendar,
  type LabeledInputCalendarColors,
} from "next-calendar-select";

const DEMO_CALENDAR_COLORS: LabeledInputCalendarColors = {
  light: {
    primary: "#d97706",
    onPrimary: "#fffdf7",
    surface: "#fffaf0",
    onSurface: "#2f2414",
    surfaceVariant: "#fff2db",
    onSurfaceVariant: "#7c5b23",
    outline: "#ebc889",
    error: "#dc2626",
    muted: "#b68d4e",
    scrim: "rgba(42, 29, 9, 0.45)",
  },
  dark: {
    primary: "#f59e0b",
    onPrimary: "#1f1302",
    surface: "#1f1608",
    onSurface: "#fff6e5",
    surfaceVariant: "#2e220f",
    onSurfaceVariant: "#f1c777",
    outline: "#7b5d2b",
    error: "#f87171",
    muted: "#8a6a3a",
    scrim: "rgba(0, 0, 0, 0.6)",
  },
};

export default function Home() {
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      Swal.fire({
        icon: "warning",
        title: "No date selected",
        text: "Please select a date.",
      });
      return;
    }
    const parsed = Date.parse(date);
    if (Number.isNaN(parsed)) {
      Swal.fire({
        icon: "error",
        title: "Invalid date",
        text: "Please enter a valid date.",
      });
      return;
    }
    const iso = new Date(parsed).toISOString().split("T")[0];
    Swal.fire({
      icon: "success",
      title: "Selected date",
      text: iso,
    });
  };

  return (
    <main className="demo-shell min-h-screen flex justify-center items-center p-6 sm:p-10">
      <section className="mx-auto w-full max-w-5xl rounded-[2rem] border border-white/40 bg-white/80 p-6 shadow-[0_26px_80px_-35px_rgba(124,75,20,0.55)] backdrop-blur-sm sm:p-10">
        <div className="mb-8 grid gap-2">
          <p className="demo-kicker">next-calendar-select</p>
          <h1 className="text-3xl font-bold tracking-tight text-amber-950 sm:text-4xl">
            Pick A Date With Style
          </h1>
          <p className="max-w-2xl text-sm text-amber-900/80 sm:text-base">
            Click the field below to open the calendar modal. This demo also
            includes manual date entry and accessible dialog metadata.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid w-full gap-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-7"
        >
          <label className="text-sm font-semibold uppercase tracking-[0.08em] text-amber-900/70">
            Reservation Date
          </label>
          <LabeledInputCalendar
            label="Date"
            name="date"
            value={date}
            onChange={handleChange}
            locale="en"
            colors={DEMO_CALENDAR_COLORS}
            texts={{
              applyDate: "Apply",
              cancel: "Cancel",
              today: "Today",
              dialogTitle: "Choose your reservation date",
              dialogDescription:
                "Navigate months and years, then select a day or type the date manually.",
            }}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-amber-700"
            >
              Submit
            </button>
            <button
              type="button"
              className="rounded-full border border-amber-300 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
              onClick={() => setDate("")}
            >
              Clear
            </button>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white/70 p-4 text-sm text-amber-900/80">
            <span className="font-semibold text-amber-900">Current value:</span>{" "}
            {date || "No date selected yet"}
          </div>
        </form>
      </section>
    </main>
  );
}
