import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ children, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Clean up on unmount
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {children} {/* This is where you put your button/trigger element */}
      </div>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"> {/* Dropdown container */}
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {content} {/* This is where you put the dropdown content */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;