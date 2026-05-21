import React from 'react';
import Button from "../common/Button";
import IconButton from "../common/IconButton";

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function SchedulePicker({ value = [], onChange }) {
  const addSlot = () => {
    onChange([...value, { day: 1, startTime: '18:00', endTime: '19:00' }]);
  };

  const removeSlot = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, newValue) => {
    const updated = value.map((slot, i) => 
      i === index ? { ...slot, [field]: newValue } : slot
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">Meeting Schedule</label>
        <Button type="button" variant="ghost" size="sm" onClick={addSlot}>
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add Slot
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs italic text-text-secondary">
          No schedule added. Click "Add Slot" to define meeting times.
        </p>
      ) : (
        <div className="space-y-3">
          {value.map((slot, index) => (
            <div 
              key={index} 
              className="animate-in fade-in slide-in-from-top-1 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-3 duration-200"
            >
              <div className="flex-1 min-w-[120px]">
                <select
                  value={slot.day}
                  onChange={(e) => updateSlot(index, 'day', parseInt(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {DAYS.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <span className="text-xs text-text-secondary">to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <IconButton
                type="button"
                onClick={() => removeSlot(index)}
                title="Remove slot"
                label="Remove slot"
                variant="danger"
                size="sm"
                icon="delete"
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-text-secondary">
        Meetings will be visible to all members. Ensure times are in your local timezone.
      </p>
    </div>
  );
}
