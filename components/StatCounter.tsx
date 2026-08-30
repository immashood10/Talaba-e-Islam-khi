'use client';

import CountUp from 'react-countup';

interface StatCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function StatCounter({ end, duration = 2.5, suffix = '+', className }: StatCounterProps) {
  return (
    <span className={className}>
      <CountUp end={end} duration={duration} separator="," enableScrollSpy scrollSpyOnce />
      {suffix}
    </span>
  );
}
