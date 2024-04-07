import { useContext } from "react";
import type { ChatSession } from "../context/ChatSession";
import ChatSessionContext from "../context/ChatSession";

export default function useChatSession(): ChatSession {
  const ctx = useContext(ChatSessionContext);
  return ctx;
}
