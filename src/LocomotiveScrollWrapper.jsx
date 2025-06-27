import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

const LocomotiveScrollWrapper = ({ children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const scroll = new LocomotiveScroll({
      el: containerRef.current,
      smooth: true,
      multiplier: 1,
      lerp: 0.1,
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <div
      data-scroll-container
      ref={containerRef}
      className="relative"
    >
      {children}
    </div>
  );
};

export default LocomotiveScrollWrapper;
