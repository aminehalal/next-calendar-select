# next-caledar-select

Reusable labeled date input calendar component for React and Next.js.

## Why this package

- Standalone component without app-only hooks.
- Flexible text labels (no required i18n dependency).
- RTL support through props.
- Ships TypeScript types and ESM/CJS bundles.

## Install

```bash
npm install next-caledar-select
```

Peer dependencies:

- react >= 18
- react-dom >= 18

## Basic usage

```tsx
"use client";

import { useState } from "react";
import { LabeledInputCalendar } from "next-caledar-select";

export default function Example() {
  const [date, setDate] = useState("");

  return (
    <LabeledInputCalendar
      label="Date of birth"
      name="birthDate"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      locale="en-US"
      isOldDaysBlocked={false}
      isUpcomingDaysBlocked={false}
      isRTL={false}
      texts={{
        enterDateManually: "Enter date manually",
        applyDate: "Apply",
        cancel: "Cancel",
        today: "Today",
      }}
    />
  );
}
```

## Props

```ts
interface LabeledInputCalendarProps {
  label?: string;
  name: string;
  value: string; // format: YYYY-MM-DD
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isError?: boolean;
  bgColor?: string;
  isDisabled?: boolean;
  isOldDaysBlocked?: boolean;
  isUpcomingDaysBlocked?: boolean;
  className?: string;
  locale?: string; // default: en-US
  isRTL?: boolean; // default: false
  texts?: Partial<LabeledInputCalendarTexts>;
}
```

## Styling note

This component uses utility-first class names (Tailwind style classes). For best visual results, use it in a project that already supports utility classes.

## Project structure

```text
next-calendar-select/
├─ src/
│  ├─ LabeledInputCalendar.tsx
│  └─ index.ts
├─ index.ts
├─ package.json
├─ tsconfig.json
├─ tsup.config.ts
├─ README.md
└─ LICENSE
```

## Local development

```bash
npm install
npm run typecheck
npm run build
```

Build output goes to `dist/`.

## Publish to npm

1. Update `name`, `author`, and `version` in `package.json`.
2. Make sure you are logged in:

```bash
npm login
```

3. Build and publish:

```bash
npm run build
npm publish --access public
```

4. Push your code and tags to GitHub:

```bash
git add .
git commit -m "chore: prepare next-caledar-select package"
git push origin main
```
