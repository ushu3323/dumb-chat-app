import './UsernamePrompt.css';
import { FormEvent } from "react";

export default function UsernamePrompt(props: { onSubmit?: (username: string) => void }) {
  const { onSubmit } = props;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    onSubmit?.(username);
  };

  return (
    <form className="username-prompt" onSubmit={handleSubmit}>
      <input name="username" type="text" className="textinput" />
      <input className="username-prompt--submit-input" type="submit" value="Join"/>
    </form>
  );
}
