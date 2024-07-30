import { parse } from 'date-fns';

// Parse dates so they can be sorted by most recent in the chat list
export default function parseCustomDate(dateString) {
  // Handle empty or invalid dates by setting them to the earliest possible date
  if (!dateString) {
    return new Date(0);
  }
  return parse(dateString, 'dd/MM/yyyy - HH:mm:ss', new Date());
}
