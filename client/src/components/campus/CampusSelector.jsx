import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCampuses,
  selectCampuses,
  selectCampusLoading,
} from "../../redux/slices/campusSlice";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function CampusSelector({ value, onChange, disabled }) {
  const dispatch = useDispatch();
  const campuses = useSelector(selectCampuses);
  const loading = useSelector(selectCampusLoading);
  const isDark = useHomeTheme();

  const [hasFetched, setHasFetched] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!hasFetched && campuses.length === 0) {
      dispatch(fetchCampuses());
      setHasFetched(true);
    }
  }, [dispatch, campuses.length, hasFetched]);

  const handleToggleMode = () => {
    const nextMode = !isRequesting;
    setIsRequesting(nextMode);
    onChange(nextMode ? "REQUEST_NEW" : "");
  };

  const labelClasses = isDark ? "text-[#c9d1d9]" : "text-slate-700";
  const requiredClasses = isDark ? "text-[#f85149]" : "text-rose-500";
  const toggleClasses = isDark
    ? "text-[#58a6ff] hover:text-[#79c0ff]"
    : "text-sky-600 hover:text-sky-700";
  const fieldClasses = isDark
    ? "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] focus:border-[#58a6ff] focus:ring-[#58a6ff] disabled:bg-[#161b22]"
    : "border-slate-200 bg-white text-slate-900 shadow-sm focus:border-sky-500 focus:ring-sky-500 disabled:bg-slate-100";
  const baseFieldClasses =
    "w-full rounded-md border px-3 py-2 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50";

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className={`block text-sm font-medium ${labelClasses}`}>
          Select Your Campus <span className={requiredClasses}>*</span>
        </label>
        <button
          type="button"
          onClick={handleToggleMode}
          className={`text-xs transition-colors ${toggleClasses}`}
        >
          {isRequesting ? "Back to list" : "Campus not listed?"}
        </button>
      </div>

      {!isRequesting ? (
        <select
          value={value === "REQUEST_NEW" ? "" : (value || "")}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className={`${baseFieldClasses} ${fieldClasses}`}
          required
        >
          <option value="" disabled>
            {loading
              ? "Loading campuses..."
              : campuses?.length === 0
                ? "No campuses found"
                : "Choose a campus"}
          </option>
          {Array.isArray(campuses) &&
            campuses.map((campus) => (
              <option key={campus._id} value={campus._id}>
                {campus.name}
              </option>
            ))}
        </select>
      ) : (
        <input
          type="text"
          placeholder="Type your campus name..."
          value={value === "REQUEST_NEW" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseFieldClasses} ${fieldClasses}`}
          required
          autoFocus
        />
      )}
    </div>
  );
}
