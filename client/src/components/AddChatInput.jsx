export default function AddChatInput({ inputUsername, setInputUsername, handleAddChat, errorMessage, setErrorMessage}) {
  return (
    <div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
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
    </div>
  );
}
