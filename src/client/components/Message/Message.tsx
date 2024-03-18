import "./Message.css";

interface Props {
  author: string;
  content: string;
  status: "pending" | "success" | "error";
}

export default function Message(props: Props) {
  const { author, content, status } = props;

  return (
    <div className={`message ${status}`}>
      <h2 className="message-author">{author}</h2>
      <p className="message-content">{content}</p>
    </div>
  );
}
