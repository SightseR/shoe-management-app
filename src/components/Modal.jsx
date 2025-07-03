import React from 'react';


const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          {/* Close button */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {/* Modal Body */}
        <div className="py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
