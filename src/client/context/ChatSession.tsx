import { createContext } from "react";
import {
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../../lib/socket-io/client";
import { MessageWithStatus, Status, UpdatePayload } from "../../types/chat";

export interface Chat {
  sendMessage: (content: string) => void;
  messages: MessageWithStatus[];
}

export interface ChatSession {
  join: (username: string) => void;
  username: string | null;
  chat: Chat;
}

const ChatSessionContext = createContext<ChatSession>({} as ChatSession)

export default ChatSessionContext;

export function ChatSessionProvider({ children }: PropsWithChildren) {
  const socket = useMemo(() => createClient({ autoConnect: false }), []);
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithStatus[]>([]);

  const sendMessage = (content: string) => {
    if(!username) {
      throw new Error("Cannot send messages without an username")
    }
    const newMessage: MessageWithStatus = {
      data: {
        id: new Date().getTime().toString(),
        content,
        author: username,
      },
      status: "pending",
      error: null,
    };

    setMessages([...messages, newMessage]);
  };

  const updateMessage = (update: UpdatePayload) => {
    const index = messages.findIndex(({ data }) => data.id === update.id);
    if (index === -1) {
      console.warn("MessageUpdateError: Message not found");
      return;
    }

    setMessages((messages) => {
      const copy = [...messages];

      const original = copy[index];
      copy[index] = mergeMessages(original, update);
      return copy;
    });
  };

  useEffect(() => {
    socket.on("message", (payload) => {
      const message: MessageWithStatus = {
        data: payload,
        status: "success",
        error: null,
      };
      setMessages((messages) => [...messages, message]);
    });
    return () => {
      if (socket.active) {
        socket!.disconnect();
      }
      socket!.off("message");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pendingMessage = messages.find((msg) => msg.status === "pending");
    if (pendingMessage) {
      const {
        data: { id, content },
      } = pendingMessage;
      const payload = {
        id,
        content,
      };

      socket.emit("message", payload, (result) => {
        console.log(result);
        console.log(messages);
        if (result.status === "INTERNAL_SERVER_ERROR") {
          return updateMessage({
            id: payload.id,
            status: "error",
            error: "Error al enviar el mensaje",
          });
        }
        updateMessage({ id: payload.id, status: "success" });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const ctxValue: ChatSession = {
    join: (username) => {
      socket.auth = { username };
      socket.connect();
      setUsername(username);
    },
    username,
    chat: {
      sendMessage,
      messages,
    },
  };

  return (
    <ChatSessionContext.Provider value={ctxValue}>
      {children}
    </ChatSessionContext.Provider>
  );
}

function mergeMessages(
  original: MessageWithStatus,
  update: UpdatePayload
): MessageWithStatus {
  const { data: originalData, ...originalRest } = original;
  const { id: _updateId, data: updateData, ...preUpdateRest } = update;

  const data = {
    ...originalData,
    ...updateData,
  };

  let rest: Status;
  if (preUpdateRest.status !== undefined) {
    if (preUpdateRest.status === "error") {
      rest = {
        status: "error",
        error: preUpdateRest.error,
      };
    } else {
      rest = {
        status: preUpdateRest.status,
        error: preUpdateRest.error ?? null,
      };
    }
  } else {
    rest = originalRest;
  }

  const merged: MessageWithStatus = {
    data,
    ...rest,
  };

  return merged;
}