import { useEffect } from 'react';

export const useSocketErrorHandling = (socket, setErrorMessage) => {
  useEffect(() => {
    const handleCustomError = (errorResponse) => {
      setErrorMessage(errorResponse.error);
    };

    // Handle connection and custom errors
    socket.on('custom-error', handleCustomError);

    socket.on('connect_error', () => {
      setErrorMessage('Unable to connect to chat server. Please try again.');
    });

    socket.on('disconnect', () => {
      setErrorMessage(
        'Disconnected from chat server. Attempting to reconnect...'
      );
    });

    return () => {
      // Clean up error event listeners
      socket.off('custom-error', handleCustomError);
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [socket, setErrorMessage]);
};
