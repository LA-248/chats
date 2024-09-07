export default function handleModalOutsideClick(modalRef, setIsModalOpen, isModalOpen ) {
  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsModalOpen(false);
    }
  };

  if (isModalOpen) {
    document.addEventListener('mousedown', handleOutsideClick);
  }

  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
}
