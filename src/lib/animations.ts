
import { useState, useEffect } from 'react';

export function usePageTransition() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return {
    className: isVisible 
      ? "animate-scale-in opacity-100 transition-opacity duration-300" 
      : "opacity-0",
  };
}

export function useTransitionEffect(show: boolean, duration = 300) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (show) {
      setShouldRender(true);
    } else {
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [show, duration]);

  const transitionStyles = {
    entering: { opacity: 1, transform: 'translateY(0)' },
    entered: { opacity: 1, transform: 'translateY(0)' },
    exiting: { opacity: 0, transform: 'translateY(10px)' },
    exited: { opacity: 0, transform: 'translateY(10px)' },
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
  };

  return {
    shouldRender,
    transitionStyles,
  };
}
