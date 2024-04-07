import "./App.css";
import Chat from "./Chat";
import { ChatSessionProvider } from "./context/ChatSession";

function App() {
  return (
    <ChatSessionProvider>
      <Chat/>
    </ChatSessionProvider>
  )
}

export default App;
