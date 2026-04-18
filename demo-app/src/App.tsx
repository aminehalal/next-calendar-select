import React, { useState } from 'react'
import { LabeledInputCalendar } from 'next-calendar-select'

export default function App() {
  const [date, setDate] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)

  return (
    <div className="container">
      <h1>next-calendar-select Demo</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(date || '(none)')
        }}
      >
        <LabeledInputCalendar
          label="Pick a date"
          name="demoDate"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          texts={{ applyDate: 'Apply date', cancel: 'Close', today: 'Today' }}
        />

        <div style={{ marginTop: 16 }}>
          <button type="submit">Submit</button>
        </div>
      </form>

      <div style={{ marginTop: 20 }}>
        <strong>Selected value:</strong> {date || '(none)'}
      </div>

      {submitted && (
        <div style={{ marginTop: 12 }}>
          <strong>Last submitted:</strong> {submitted}
        </div>
      )}
    </div>
  )
}
