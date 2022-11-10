import { UserCard } from "components/UserCard";
import { useRouter } from "next/router";

export default function UserPublicProfile() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <UserCard userId={id as string} />
    </>
  );
}
