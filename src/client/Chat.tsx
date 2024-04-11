import "./Chat.css";
import { type FormEvent } from "react";
import useChatSession from "./hooks/useChatSession";
import Message from "./components/Message/Message";
import UsernamePrompt from "./components/UsernamePrompt/UsernamePrompt";
import UsersSidebar from "./components/UsersSidebar/UsersSidebar";

const USERS = ["Steve", "Alex"];

export default function Chat() {
  const { chat, username, join } = useChatSession();

  const handleMessageSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = new FormData(e.currentTarget);
    const message = formdata.get("message") as string;
    e.currentTarget.reset();

    chat.sendMessage(message);
  };

  return (
    <>
      <header className="header">
        <h1 className="title">Dumb Chat</h1>
        <div className="username">
          <span>Username:</span>
          {username || (
            <UsernamePrompt onSubmit={(username) => join(username)} />
          )}
        </div>
      </header>
      <div className="chat">
        <div className="chat-container">
          <main className="messages">
            {chat.messages.map(({ status, data: { id, author, content } }) => (
              <Message
                key={id}
                author={author}
                content={content}
                status={status}
              />
            ))}
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
              <button type="submit" disabled={!username}>
                Enviar
              </button>
            </form>
          </div>
        </div>
        <UsersSidebar users={USERS} />
      </div>
    </>
  );
}
