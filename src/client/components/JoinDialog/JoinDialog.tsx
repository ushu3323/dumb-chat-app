import './JoinDialog.css';
import { FormEvent, useEffect, useRef } from "react";

interface Props {
  show?: boolean;
  onSubmit?: (username: string) => void ;
}

export default function JoinDialog(props: Props) {
  const { onSubmit } = props;
  const show = props.show ?? false;

  const dialog = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    onSubmit?.(username);
  };

  useEffect(() => {
    if (show) {
      dialog.current?.classList.add("show");
    } else {
      dialog.current?.classList.remove("show");
    }
  }, [show])

  return (
    <div ref={dialog} className="join-dialog">
      <form onSubmit={handleSubmit}>
        <h2 className="title">Join to Chat!</h2>
        <input name="username" type="text" className="textinput" placeholder="Username" />
        <button type="submit" className="button">Join</button>
      </form>
    </div>
  );
}
