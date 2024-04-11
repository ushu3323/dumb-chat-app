import { User } from "../../../types/chat";
import "./UsersSidebar.css";

interface Props {
  username: string | null;
  users: User[] | null;
}

export default function UsersSidebar(props: Props) {
  const { username, users } = props;

  return (
    <aside className="users-sidebar">
      {users ? (
        <ul className="users-list">
          <li className="users-list--item">
            {username}{" "}
            <span style={{color:"gray"}}>(me)</span>
          </li>
          {users.map((user) => (
            <li className="users-list--item" key={user.id}>
              {user.username}
            </li>
          ))}
        </ul>
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Disconnected
        </div>
      )}
    </aside>
  );
}
