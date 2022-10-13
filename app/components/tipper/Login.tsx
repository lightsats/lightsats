import { useSession, signIn, signOut } from "next-auth/react";
import { NewTipButton } from "./NewTipButton";
import { Tips } from "./Tips";

export function Login() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
        <NewTipButton />
        <Tips />
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
