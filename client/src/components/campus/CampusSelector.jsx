import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCampuses, selectCampuses, selectCampusLoading } from "../../redux/slices/campusSlice";

export default function CampusSelector({ value, onChange, disabled }) {
  const dispatch = useDispatch();
  const campuses = useSelector(selectCampuses);
  const loading = useSelector(selectCampusLoading);

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

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#c9d1d9]">
          Select Your Campus <span className="text-[#f85149]">*</span>
        </label>
        <button
          type="button"
          onClick={handleToggleMode}
          className="text-xs text-[#58a6ff] hover:text-[#79c0ff] transition-colors"
        >
          {isRequesting ? "Back to list" : "Campus not listed?"}
        </button>
      </div>

      {!isRequesting ? (
        <select
          value={value === "REQUEST_NEW" ? "" : (value || "")}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-colors disabled:opacity-50"
          required
        >
          <option value="" disabled>
            {loading ? "Loading campuses..." : (campuses?.length === 0 ? "No campuses found" : "Choose a campus")}
          </option>
          {Array.isArray(campuses) && campuses.map((campus) => (
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
          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-colors"
          required
          autoFocus
        />
      )}
    </div>
  );
}
