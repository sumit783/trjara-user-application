'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  children?: React.ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const isHorizontalSwipeRef = useRef(false);

  const threshold = 70; // Pull distance threshold to trigger refresh
  const maxPull = 120; // Maximum visual pull distance

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      // 1. Only allow if at absolute top of the page scroll
      const isAtTop = window.scrollY === 0 && document.documentElement.scrollTop === 0;
      if (!isAtTop || isRefreshing) return;

      // 2. Avoid triggering if we are pulling over an actively scrolled container inside the page
      let target = e.target as HTMLElement | null;
      let hasScrollableParent = false;
      while (target && target !== document.body) {
        const overflowY = window.getComputedStyle(target).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && target.scrollTop > 0) {
          hasScrollableParent = true;
          break;
        }
        target = target.parentElement;
      }

      if (hasScrollableParent) return;

      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      isPullingRef.current = true;
      isHorizontalSwipeRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;

      const touch = e.touches[0];
      const diffX = touch.clientX - startXRef.current;
      const diffY = touch.clientY - startYRef.current;

      // Detect if horizontal swipe dominates (e.g. user interacting with a carousel)
      if (!isPulling && !isHorizontalSwipeRef.current) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          isHorizontalSwipeRef.current = true;
          return;
        }
      }

      if (isHorizontalSwipeRef.current) return;

      // Only pull down
      if (diffY > 0) {
        setIsPulling(true);
        // Apply resistance / damping
        const rawDistance = diffY * 0.4;
        const dampedDistance = Math.min(maxPull, rawDistance);
        
        setPullDistance(dampedDistance);

        // Prevent default overscroll bounce in mobile webviews
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;
      setIsPulling(false);

      if (pullDistance >= threshold && !isRefreshing) {
        // Trigger refresh
        setIsRefreshing(true);
        setPullDistance(threshold);

        try {
          // Provide a visual minimum time to let the spinner look premium and complete a full rotation cycle
          const visualDelay = new Promise((resolve) => setTimeout(resolve, 1000));
          
          await Promise.all([
            queryClient.refetchQueries({ type: 'active' }),
            router.refresh(),
            visualDelay
          ]);

          toast.success('Updated successfully!', {
            description: 'All lists and products are up to date.',
            duration: 2000,
          });
        } catch (error) {
          console.error('Failed to reload data via query/router:', error);
          // Fallback to hard reload if needed or just show error toast
          toast.error('Could not refresh data. Tap to reload.', {
            action: {
              label: 'Reload App',
              onClick: () => window.location.reload(),
            },
          });
        } finally {
          // Smooth return to top
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Snap back
        setPullDistance(0);
      }
    };

    // Note: { passive: false } is mandatory to allow e.preventDefault() in touchmove
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, isPulling, queryClient, router]);

  // SVG drawing configuration
  const radius = 8;
  const circumference = 2 * Math.PI * radius; // ~50.26
  const pullRatio = Math.min(1, pullDistance / threshold);
  const strokeDashoffset = circumference - pullRatio * circumference;

  return (
    <>
      {/* Floating Refresh Indicator */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center justify-center"
        style={{
          top: '16px',
          transform: `translate3d(-50%, ${pullDistance - 60}px, 0) scale(${Math.min(1, pullDistance / threshold)})`,
          opacity: Math.min(1, pullDistance / 40),
          transition: isPulling 
            ? 'none' 
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="w-12 h-12 rounded-full bg-card/95 border border-border shadow-2xl backdrop-blur-md flex items-center justify-center ring-4 ring-primary/5">
          {isRefreshing ? (
            <svg
              className="w-6 h-6 text-primary animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <div
              className="relative flex items-center justify-center w-6 h-6"
              style={{
                transform: `rotate(${pullDistance * 4.5}deg)`,
                transition: isPulling ? 'none' : 'transform 0.2s ease-out',
              }}
            >
              {/* Custom SVG path showing circle filling up */}
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-muted/30"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-primary"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Small arrow centered */}
              <ArrowDown 
                className="w-3.5 h-3.5 absolute text-primary" 
                style={{
                  transform: `scale(${Math.min(1, pullDistance / (threshold * 0.6))})`,
                  opacity: Math.min(1, pullDistance / (threshold * 0.4)),
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Children content wrapper */}
      {children}
    </>
  );
}
