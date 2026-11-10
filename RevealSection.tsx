import React, { useEffect, useRef, useState } from 'react';
import { getSectionRevealClasses } from '../utils/spiderPhysics';

interface RevealSectionProps {
  id?: string;
  className?: string;
  delayMs?: 0 | 100 | 150 | 200;
  initiallyVisible?: boolean;
  children: React.ReactNode;
}

/**
 * Reusable section wrapper that applies a subtle, cinematic fade-in and slide-up
 * entrance animation using Tailwind CSS transitions when scrolled into view.
 */
export const RevealSection: React.FC<RevealSectionProps> = ({
  id,
  className = '',
  delayMs = 0,
  initiallyVisible = false,
  children,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(initiallyVisible);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // Respect prefers-reduced-motion or missing IntersectionObserver
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
        typeof IntersectionObserver === 'undefined')
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: '0px 0px -10px 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const revealClasses = getSectionRevealClasses(isVisible, delayMs);

  return (
    <section
      ref={sectionRef}
      id={id}
      data-reveal-section={id || 'hero'}
      data-reveal-state={isVisible ? 'visible' : 'hidden'}
      className={`${revealClasses} ${className}`.trim()}
    >
      {children}
    </section>
  );
};
