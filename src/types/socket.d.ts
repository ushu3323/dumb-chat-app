export type Message = {
  id: string;
  author_id: string;
  content: string;
};

export type User = {
  id: string;
};

export type ServerToClientEvents = {
  message: (payload: Message) => void;
  userJoined: (userId: string) => void;
  userLeft: (userId: string) => void;
};

export type ClientToServerEvents = {
  message: (
    payload: Pick<Message, "content" | "id">,
    callback: (result: { status: "OK" | "INTERNAL_SERVER_ERROR" }) => void
  ) => void;
};
