// Display the username of the logged in user
export default function DisplayUsername({ username }) {
  return (
    <div className="account-info-container">
      <div className="account-username">{username}</div>
    </div>
  );
}
