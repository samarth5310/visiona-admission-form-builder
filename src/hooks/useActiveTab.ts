import { useLayoutEffect, useRef, useState } from 'react';

export const useActiveTab = (activeId: string, itemIds: string[]) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [bubbleX, setBubbleX] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const setItemRef = (id: string, el: HTMLButtonElement | null) => {
    itemRefs.current[id] = el;
  };

  const updateMeasurements = () => {
    const activeEl = itemRefs.current[activeId];
    const containerEl = containerRef.current;

    if (!containerEl || !activeEl) {
      setBubbleVisible(false);
      return;
    }

    const centerX = activeEl.offsetLeft + activeEl.offsetWidth / 2;
    setBubbleX(centerX);
    setBubbleVisible(true);
  };

  const ensureActiveItemVisible = () => {
    const activeEl = itemRefs.current[activeId];
    const containerEl = containerRef.current;
    if (!activeEl || !containerEl) return;

    if (containerEl.scrollWidth <= containerEl.clientWidth + 2) {
      return;
    }

    activeEl.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  useLayoutEffect(() => {
    updateMeasurements();
    ensureActiveItemVisible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, itemIds.join('|')]);

  useLayoutEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const onResize = () => updateMeasurements();
    const observer = new ResizeObserver(() => updateMeasurements());

    observer.observe(containerEl);
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIds.join('|')]);

  return {
    containerRef,
    setItemRef,
    bubbleX,
    bubbleVisible,
  };
};
