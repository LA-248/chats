import { useEffect } from 'react';

export default function useClearErrorMessage(errorMessage, setErrorMessage) {
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);
}
