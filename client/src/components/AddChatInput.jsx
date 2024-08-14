import { useEffect } from 'react';

export default function AddChatInput({ inputUsername, setInputUsername, handleAddChat, errorMessage, setErrorMessage}) {

  // Clear error message after a certain amount of time
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);
  
  return (
    <div className="username-form-container">
      <form id="username-form" action="" onSubmit={handleAddChat}>
        <div className="username-input-container">
          <input
            id="username-input"
            type="text"
            placeholder="Enter a username"
            value={inputUsername}
            onChange={(event) => {
              setInputUsername(event.target.value);
              setErrorMessage('');
            }}
          />
          <button className="start-chat-button" style={{ marginLeft: '10px' }}>
            Start chat
          </button>
        </div>
      </form>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
}
