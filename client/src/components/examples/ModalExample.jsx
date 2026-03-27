import React from 'react';
import { useModal } from '@/hooks';  // ✅ Named import

/**
 * Example component demonstrating useModal hook usage
 * 
 * Shows how to use the useModal hook to control modal visibility
 * with open, close, and toggle functionality
 */
const ModalExample = () => {
  const { isOpen, openModal, closeModal, toggleModal } = useModal();

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Modal Example</h2>

      {/* Control Buttons */}
      <div className="space-x-2 mb-4">
        <button
          onClick={openModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Open Modal
        </button>
        <button
          onClick={toggleModal}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Toggle Modal
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Modal is currently: <strong>{isOpen ? 'Open' : 'Closed'}</strong>
      </p>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Modal Title</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                This is a modal dialog. Click outside the modal or press the close button to dismiss it.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Action confirmed!');
                  closeModal();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalExample;
