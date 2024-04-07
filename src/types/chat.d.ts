export type Status =
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

export type UpdatePayload = { id: Message["id"] } & Partial<{
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

export type Message = {
  id: string;
  author: string;
  content: string;
};

export type MessageWithStatus = Status & {
  data: Message;
};

export type User = {
  id: string;
  username: string;
}