export default function ChatSearch({
  chatSearchInputText,
  setChatSearchInputText,
}) {
  return (
    <div className='chat-search-input-container'>
      <input
        id='chat-search-input'
        type='text'
        placeholder='Find a conversation'
        value={chatSearchInputText}
        onChange={(event) => setChatSearchInputText(event.target.value)}
      ></input>
    </div>
  );
}
