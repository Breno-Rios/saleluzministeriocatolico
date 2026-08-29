"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

function breakdown(msRemaining: number) {
  const diff = Math.max(msRemaining, 0);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

export default function LaunchCountdown({ launchAt }: { launchAt: number }) {
  const cachedNow = useRef(launchAt);

  const subscribe = useCallback((callback: () => void) => {
    const id = setInterval(() => {
      cachedNow.current = Date.now();
      callback();
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const getSnapshot = useCallback(() => cachedNow.current, []);
  const getServerSnapshot = useCallback(() => launchAt, [launchAt]);

  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const timeLeft = breakdown(launchAt - now);

  const units = [
    { label: "dias", value: timeLeft.days },
    { label: "horas", value: timeLeft.hours },
    { label: "min", value: timeLeft.minutes },
    { label: "seg", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span className="font-condensed text-4xl font-bold tabular-nums text-(--color-gold) sm:text-5xl">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-xs uppercase tracking-widest text-(--color-text-muted)">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
