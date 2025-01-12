import { useContext, useEffect } from 'react';
import { MessageContext } from '../contexts/MessageContext';

export default function useClearErrorMessage(errorMessage, setErrorMessage) {
  const { recipientId } = useContext(MessageContext);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);

  // Clear error message when the user changes chat
  useEffect(() => {
    setErrorMessage('');
  }, [recipientId, setErrorMessage]);
}
