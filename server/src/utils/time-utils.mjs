import { format } from 'date-fns';

export default function retrieveCurrentTime() {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');

  const formattedTime = `${hours}:${minutes}`;
  const formattedDate = format(new Date(currentTime), 'dd/MM/yyyy');

  return `${formattedDate} - ${formattedTime}`;
}
