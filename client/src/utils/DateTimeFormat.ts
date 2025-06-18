export default function formatDate(timestamp) {
  const date = new Date(timestamp);

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  }).format(date);

  // Replace comma with hyphen and space
  return formattedDate;
}
