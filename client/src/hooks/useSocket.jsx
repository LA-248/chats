import { useContext } from 'react';
import { SocketContext } from '../pages/home';

export const useSocket = () => {
  return useContext(SocketContext);
};
