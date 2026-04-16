import { useState, useEffect } from "react";

export default function CountdownTimer({ targetDate, onExpire, label = "Time Remaining" }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isExpired, setIsExpired] = useState(false);

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    let timer;
    if (!isExpired) {
      timer = setTimeout(() => {
        const time = calculateTimeLeft();
        setTimeLeft(time);
        if (Object.keys(time).length === 0) {
          setIsExpired(true);
          if (onExpire) setTimeout(() => onExpire(), 0);
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  });

  if (isExpired) {
    return (
      <div className="bg-[#f85149]/10 border border-[#f85149]/30 text-[#ff7b72] px-4 py-2 rounded-lg text-center font-semibold text-sm">
        Time's Up!
      </div>
    );
  }

  const formatDigit = (num) => num.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center bg-[#161b22] border border-[#30363d] rounded-lg p-3">
      {label && <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-widest mb-2">{label}</span>}
      <div className="flex items-center gap-2 text-white font-mono text-xl tabular-nums">
        <div className="flex flex-col items-center bg-[#0d1117] rounded px-3 py-1 border border-[#30363d]">
          <span>{formatDigit(timeLeft.days || 0)}</span>
          <span className="text-[10px] text-[#8b949e] uppercase mt-1">Days</span>
        </div>
        <span className="text-[#30363d] self-start mt-1">:</span>
        <div className="flex flex-col items-center bg-[#0d1117] rounded px-3 py-1 border border-[#30363d]">
          <span>{formatDigit(timeLeft.hours || 0)}</span>
          <span className="text-[10px] text-[#8b949e] uppercase mt-1">Hrs</span>
        </div>
        <span className="text-[#30363d] self-start mt-1">:</span>
        <div className="flex flex-col items-center bg-[#0d1117] rounded px-3 py-1 border border-[#30363d]">
          <span>{formatDigit(timeLeft.minutes || 0)}</span>
          <span className="text-[10px] text-[#8b949e] uppercase mt-1">Min</span>
        </div>
        <span className="text-[#30363d] self-start mt-1">:</span>
        <div className="flex flex-col items-center bg-[#0d1117] rounded px-3 py-1 border border-[#30363d]">
          <span className="text-[#1dc964]">{formatDigit(timeLeft.seconds || 0)}</span>
          <span className="text-[10px] text-[#8b949e] uppercase mt-1">Sec</span>
        </div>
      </div>
    </div>
  );
}
