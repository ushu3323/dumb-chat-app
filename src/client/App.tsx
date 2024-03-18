import { FormEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import { createClient } from "../lib/socket-io/client";
import { Message as SocketMessage } from "../types/socket";
import Message from "./components/Message/Message";

type Message = SocketMessage & {
  status: "pending" | "success" | "error";
};

function App() {
  const socketRef = useRef(createClient({ autoConnect: false }));
  const socket = socketRef.current;

  const [messages, setMessages] = useState<Message[]>([]);

  const handleMessageSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = new FormData(e.currentTarget);
    const message = formdata.get("message") as string;
    e.currentTarget.reset();
    sendMessage(message);
  };

  const sendMessage = (content: string) => {
    const newMessage: Message = {
      id: new Date().getTime().toString(),
      content,
      author_id: socket.id!,
      status: "pending",
    };

    setMessages([...messages, newMessage]);
  };

  const updateMessage = (props: Partial<Message> & { id: Message["id"] }) => {
    const { id, ...update } = props;
    const index = messages.findIndex((x) => x.id === id);
    if (index === -1) {
      console.warn("MessageUpdateError: Message not found");
      return;
    }

    setMessages((messages) => {
      const copy = [...messages];

      copy[index] = {
        ...copy[index],
        ...update,
      };
      return copy;
    });
  };

  useEffect(() => {
    socket.on("message", (payload) => {
      const message: Message = {
        ...payload,
        status: "success",
      };
      setMessages((messages) => [...messages, message]);
    });
    socket.connect();
    return () => {
      socket.disconnect();
      socket.off('message')
    };
  }, []);

  useEffect(() => {
    const messagePending = messages.find((msg) => msg.status === "pending");
    if (messagePending) {
      const { id, content } = messagePending;
      const payload = {
        id,
        content,
      };

      socket.emit("message", payload, (result) => {
        console.log(result);
        console.log(messages);
        if (result.status === "INTERNAL_SERVER_ERROR") {
          alert("Hubo un error interno del servidor");
          return updateMessage({
            id: payload.id,
            status: "error",
          });
        }
        updateMessage({
          id: payload.id,
          status: "success",
        });
      });
    }
  }, [messages]);

  return (
    <>
      <header className="header">
        <h1 className="title">Dumb Chat</h1>
      </header>
      <main className="chat">
        {messages.map(({ id, author_id, content, status }) => (
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
