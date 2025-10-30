import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PopoverProps {
  // Fix: Specify that the trigger element can accept an onClick prop to resolve typing errors.
  trigger: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  children: (close: () => void) => React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
      contentRef.current && !contentRef.current.contains(event.target as Node)
    ) {
      closePopover();
    }
  }, [closePopover]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const triggerWithProps = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      handleToggle();
      if (trigger.props.onClick) {
        trigger.props.onClick(e);
      }
    },
  });

  return (
    <div className="relative inline-block w-full">
      <div ref={triggerRef}>{triggerWithProps}</div>
      {isOpen && (
        <div
          ref={contentRef}
          className="absolute bottom-full mb-2 w-max max-w-xs z-50 animate-fade-in left-1/2 -translate-x-1/2"
        >
          <div className="bg-gray-800 border-2 border-purple-500 rounded-lg shadow-2xl shadow-purple-500/30 p-4">
            {children(closePopover)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Popover;
