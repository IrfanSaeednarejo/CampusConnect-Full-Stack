import React from 'react';

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
        <label className="text-sm font-medium text-[#c9d1d9]">Meeting Schedule</label>
        <button
          type="button"
          onClick={addSlot}
          className="text-xs font-semibold text-[#3fb950] hover:text-[#2ea043] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add Slot
        </button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-[#8b949e] italic border border-dashed border-[#30363d] rounded-lg p-3 text-center">
          No schedule added. Click "Add Slot" to define meeting times.
        </p>
      ) : (
        <div className="space-y-3">
          {value.map((slot, index) => (
            <div 
              key={index} 
              className="flex flex-wrap items-center gap-3 p-3 bg-[#161b22] border border-[#30363d] rounded-lg animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex-1 min-w-[120px]">
                <select
                  value={slot.day}
                  onChange={(e) => updateSlot(index, 'day', parseInt(e.target.value))}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-1.5 text-sm text-[#c9d1d9] focus:border-[#238636] outline-none transition-colors"
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
                  className="bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-1.5 text-sm text-[#c9d1d9] focus:border-[#238636] outline-none transition-colors"
                />
                <span className="text-[#8b949e] text-xs">to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                  className="bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-1.5 text-sm text-[#c9d1d9] focus:border-[#238636] outline-none transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="p-1.5 text-[#8b949e] hover:text-[#f85149] transition-colors"
                title="Remove slot"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-[#8b949e]">
        Meetings will be visible to all members. Ensure times are in your local timezone.
      </p>
    </div>
  );
}
