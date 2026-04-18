import React, { useState } from "react";
import {
  LabeledInputCalendar,
  type LabeledInputCalendarColors,
} from "next-calendar-select";

const CALENDAR_COLORS: LabeledInputCalendarColors = {
  light: {
    primary: "#0f766e",
    onPrimary: "#f8fffe",
    surface: "#ffffff",
    onSurface: "#0b1d24",
    surfaceVariant: "#ecf8f6",
    onSurfaceVariant: "#47616d",
    outline: "#bfd9d4",
    error: "#b42318",
    muted: "#8aa6a0",
    scrim: "rgba(11, 29, 36, 0.45)",
  },
  dark: {
    primary: "#14b8a6",
    onPrimary: "#042a25",
    surface: "#092028",
    onSurface: "#e6fbf7",
    surfaceVariant: "#10313c",
    onSurfaceVariant: "#9cc6c0",
    outline: "#2a5560",
    error: "#fda29b",
    muted: "#3d6973",
    scrim: "rgba(0, 0, 0, 0.65)",
  },
};

export default function App() {
  const [date, setDate] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? "app-shell dark" : "app-shell"}>
      <main className="demo-layout">
        <section className="demo-panel">
          <header className="panel-header">
            <p className="eyebrow">next-calendar-select</p>
            <h1>Calendar Form Playground</h1>
            <p className="subtitle">
              Better demo styling with light and dark palettes from the calendar
              color API.
            </p>
            <button
              type="button"
              className="mode-toggle"
              onClick={() => setIsDark((prev) => !prev)}
            >
              {isDark ? "Switch to light mode" : "Switch to dark mode"}
            </button>
          </header>

          <form
            className="demo-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(date || "(none)");
            }}
          >
            <LabeledInputCalendar
              label="Pick a date"
              name="demoDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              texts={{
                applyDate: "Apply date",
                cancel: "Close",
                today: "Today",
              }}
              colors={CALENDAR_COLORS}
              className={isDark ? "dark" : ""}
            />

            <div className="actions">
              <button type="submit" className="submit-btn">
                Submit form
              </button>
            </div>
          </form>

          <div className="result-grid">
            <article className="result-card">
              <span>Selected value</span>
              <strong>{date || "-"}</strong>
            </article>
            <article className="result-card">
              <span>Last submitted</span>
              <strong>{submitted || "-"}</strong>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
