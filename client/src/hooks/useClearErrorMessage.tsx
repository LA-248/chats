import { useContext, useEffect } from 'react';
import { ChatContext } from '../contexts/ChatContext';

export default function useClearErrorMessage(
  errorMessage: string,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) {
  const chatContext = useContext(ChatContext);
  if (!chatContext) {
    throw new Error();
  }
  const { chatId } = chatContext;

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);

  // Clear error message when the user changes chat
  useEffect(() => {
    setErrorMessage('');
  }, [chatId, setErrorMessage]);
}
