import type { FormEvent } from "react";
import "./App.css";
import Message from "./components/Message/Message";
import useChat from "./hooks/useChat";

function App() {
  const chat = useChat();

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
      </header>
      <main className="chat">
        {chat.messages.map(({status, data: { id, author_id, content }}) => (
          <Message
            key={id}
            author={author_id}
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
            className="input"
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </>
  );
}

export default App;
