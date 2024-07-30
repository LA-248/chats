import { format } from 'date-fns';

function retrieveCurrentTime() {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');

  const formattedTime = `${hours}:${minutes}`;
  const formattedDate = format(new Date(currentTime), 'dd/MM/yyyy');

  return `${formattedDate} - ${formattedTime}`;
}

function retrieveCurrentTimeWithSeconds() {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');

  const formattedTime = `${hours}:${minutes}:${seconds}`;
  const formattedDate = format(new Date(currentTime), 'dd/MM/yyyy');

  return `${formattedDate} - ${formattedTime}`;
}

export { retrieveCurrentTime, retrieveCurrentTimeWithSeconds };
