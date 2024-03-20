import { useEffect, useMemo, useState } from "react";
import { Message } from "../../types/socket";
import { createClient } from "../../lib/socket-io/client";

type Status =
  | {
      status: "pending";
      error: null;
    }
  | {
      status: "success";
      error: null;
    }
  | {
      status: "error";
      error: string;
    };

type UpdatePayload = { id: Message["id"] } & Partial<{
  data: Omit<Message, "id">;
}> &
  (
    | {
        status: "pending";
        error?: null;
      }
    | {
        status: "success";
        error?: null;
      }
    | {
        status: "error";
        error: string;
      }
    | {
        status?: undefined;
        error?: undefined;
      }
  );

export type MessageWithStatus = Status & {
  data: Message;
};

interface Chat {
  sendMessage: (content: string) => void;
  messages: MessageWithStatus[];
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

export default function useChat(): Chat {
  const [messages, setMessages] = useState<MessageWithStatus[]>([]);
  const socket = useMemo(() => createClient({ autoConnect: false }), []);

  const sendMessage = (content: string) => {
    const newMessage: MessageWithStatus = {
      data: {
        id: new Date().getTime().toString(),
        content,
        author_id: socket.id!,
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
    socket.connect();
    return () => {
      socket!.disconnect();
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

  return {
    sendMessage,
    messages,
  };
}
