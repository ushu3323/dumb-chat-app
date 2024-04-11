import "./UsersSidebar.css";

interface Props {
  users: string[];
}

export default function UsersSidebar(props: Props) {
  const { users } = props;

  return (
    <aside className="users-sidebar">
      <ul className="users-list">
        {users.map((username) => (
          <li className="users-list--item" key={username}>{username}</li>
        ))}
      </ul>
    </aside>
  );
}
