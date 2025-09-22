import React, { useState, useRef, useEffect } from "react";

const CampaignOptions = ({ isApproved, onEdit, onDelete, onViewDetails }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 focus:outline-none cursor-pointer"
      >
        {/* Three dot icon */}
        <svg
          className="w-6 h-6"
          fill="white"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 3a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 0110 3zM10 8a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 0110 8zM10 13a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 0110 13z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-10">
          {isApproved ? (
            <button
              onClick={() => {
                setOpen(false);
                onViewDetails();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              View Details
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignOptions;
