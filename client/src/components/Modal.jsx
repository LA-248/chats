import { useEffect, useRef } from 'react';
import handleModalOutsideClick from '../utils/ModalOutsideClick';
import clearErrorMessage from '../utils/ErrorMessageTimeout';

export default function Modal({
  isModalOpen,
  setIsModalOpen,
  errorMessage,
  setErrorMessage,
  children,
}) {
  const modalRef = useRef();

  useEffect(() => {
    handleModalOutsideClick(modalRef, setIsModalOpen, isModalOpen);
  }, [setIsModalOpen, isModalOpen]);

  // Clear error message after a certain amount of time
  useEffect(() => {
    clearErrorMessage(errorMessage, setErrorMessage);
  }, [errorMessage, setErrorMessage]);

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        {children}

        {errorMessage ? (
          <div className="error-message">{errorMessage}</div>
        ) : null}
      </div>
    </div>
  );
}
