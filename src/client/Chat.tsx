import "./Chat.css";
import { useState, type FormEvent } from "react";
import useChatSession from "./hooks/useChatSession";
import Message from "./components/Message/Message";
import JoinDialog from "./components/JoinDialog/JoinDialog";
import UsersSidebar from "./components/UsersSidebar/UsersSidebar";

export default function Chat() {
  const { chat, username, join, connectedUsers } = useChatSession();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleMessageSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = new FormData(e.currentTarget);
    const message = formdata.get("message") as string;
    e.currentTarget.reset();

    chat.sendMessage(message);
  };

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  return (
    <>
      <header className="header">
        <h1 className="title">Dumb Chat</h1>
        <button
          id="toggle-sidebar"
          className="icon-btn"
          style={{marginRight: "1em"}}
          onClick={toggleSidebar}
          aria-expanded={sidebarVisible}
          aria-controls="users-sidebar"
        >
          <span className="material-symbols-rounded">group</span>
        </button>
      </header>
      <div className="chat">
        <div className="chat-container">
          <main className="messages">
            {username ? (
              chat.messages.map(({ status, data: { id, author, content } }) => (
                <Message
                  key={id}
                  author={author}
                  content={content}
                  status={status}
                />
              ))
            ) : null}
          </main>
          <div className="message-box">
            <form
              onSubmit={handleMessageSubmit}
              className="message-box--form"
              autoComplete="off"
            >
              <input
                type="text"
                name="message"
                id="message"
                placeholder="Mensaje"
                className="textinput"
              />
              <button className="button" type="submit" disabled={!username}>
                Enviar
              </button>
            </form>
          </div>
        </div>
        <UsersSidebar
          id="users-sidebar"
          visible={sidebarVisible}
          username={username}
          users={connectedUsers}
        />
      </div>
      <JoinDialog show={!username} onSubmit={(username) => join(username)} />
    </>
  );
}
