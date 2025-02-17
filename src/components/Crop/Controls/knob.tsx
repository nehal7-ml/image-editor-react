import React, { useState, useRef, useEffect } from 'react';

interface KnobProps {
  onChange: (degrees: number) => void;
  minDegrees?: number;
  maxDegrees?: number;
  initialDegrees?: number;
  size?: string; // Tailwind size classes like 'w-24 h-24'
  className?: string; // Additional Tailwind classes for container
  knobClassName?: string; // Additional Tailwind classes for the knob itself
  indicatorClassName?: string; // Tailwind classes for the indicator line
}

/**
 * Knob Component: A rotatable knob control with degree output.
 */
const Knob: React.FC<KnobProps> = ({
  onChange,
  minDegrees = 0,
  maxDegrees = 360,
  initialDegrees = 0,
  size = 'w-24 h-24',
  className = '',
  knobClassName = '',
  indicatorClassName = 'bg-gray-700' // Default indicator color
}) => {
  const [rotation, setRotation] = useState<number>(initialDegrees);
  const knobRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startAngle = useRef<number>(0);

  useEffect(() => {
    setRotation(initialDegrees); // Ensure initialDegrees is applied on mount/update
  }, [initialDegrees]);

  useEffect(() => {
    onChange(rotation); // Call onChange callback whenever rotation changes
  }, [rotation, onChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    if (knobRef.current) {
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      startAngle.current = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    }
    e.preventDefault(); // Prevent text selection during drag
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !knobRef.current) return;

    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    let deltaAngle = currentAngle - startAngle.current;

    let newRotation = rotation + deltaAngle;

    // Clamp rotation within min/max degrees
    if (newRotation > maxDegrees) {
      newRotation = maxDegrees;
    } else if (newRotation < minDegrees) {
      newRotation = minDegrees;
    }

    setRotation(newRotation);
    startAngle.current = currentAngle; // Update start angle for next move
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false; // Stop dragging if mouse leaves knob area while dragging
    }
  };

  return (
    <div className={`relative flex justify-center items-center ${size} ${className}`}
      onMouseUp={handleMouseUp} // Global mouseup to catch release outside the knob
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={knobRef}
        className={`absolute rounded-full bg-gray-200 border-2 border-gray-400 cursor-grab active:cursor-grabbing touch-none ${size} ${knobClassName}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Visual indicator - a line to show rotation */}
        <div
          className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 h-1/4 w-0.5 ${indicatorClassName}`}
        />
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          {/* You can add text or icons inside the knob if needed */}
          <span>{Math.round(rotation)}°</span>
        </div>
      </div>
    </div>
  );
};

export default Knob;
