export default function clearErrorMessage(errorMessage, setErrorMessage) {
  if (errorMessage) {
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }
}
