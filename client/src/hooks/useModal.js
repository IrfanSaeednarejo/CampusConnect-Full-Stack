import { useState, useCallback } from 'react';

/**
 * Custom hook to manage modal visibility state
 * 
 * @returns {Object} Object containing modal state and control functions
 * @returns {boolean} isOpen - Current modal visibility state
 * @returns {Function} openModal - Function to open the modal
 * @returns {Function} closeModal - Function to close the modal
 * @returns {Function} toggleModal - Function to toggle modal state
 * 
 * @example
 * const { isOpen, openModal, closeModal } = useModal();
 * 
 * return (
 *   <>
 *     <button onClick={openModal}>Open Modal</button>
 *     {isOpen && <Modal onClose={closeModal}>Content</Modal>}
 *   </>
 * );
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};
