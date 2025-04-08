import { useContext, useEffect } from 'react';
import { ChatContext } from '../contexts/ChatContext';

export default function useClearErrorMessage(errorMessage, setErrorMessage) {
  const { chatId } = useContext(ChatContext);

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
  }, [chatId, setErrorMessage]);
}
