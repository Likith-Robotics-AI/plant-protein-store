// @ts-nocheck
'use client';

import { useEffect, useRef } from 'react';
import { initializeAnalytics, TimeTracker as TimeTrackerClass } from '@/lib/analytics-tracker';

interface TimeTrackerProps {
  page: string;
  productId?: string;
}

export default function TimeTracker({ page, productId }: TimeTrackerProps) {
  const trackerRef = useRef<TimeTrackerClass | null>(null);

  useEffect(() => {
    // Initialize analytics tracking
    trackerRef.current = initializeAnalytics(page, productId);

    // Track when component unmounts (user leaves page)
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
      }
    };
  }, [page, productId]);

  return null; // This component doesn't render anything
}
