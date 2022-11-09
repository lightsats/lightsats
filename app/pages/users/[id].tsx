import { Loading } from "@nextui-org/react";
import { UserCard } from "components/UserCard";
import { defaultFetcher } from "lib/swr";
import { useRouter } from "next/router";
import useSWR from "swr";
import { PublicUser } from "types/PublicUser";

export default function UserPublicProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: publicUser } = useSWR<PublicUser>(
    id ? `/api/users/${id}?publicProfile=true` : undefined,
    defaultFetcher
  );

  if (!publicUser) {
    return (
      <>
        <Loading type="points" color="currentColor" size="sm" />
      </>
    );
  }

  return (
    <>
      <UserCard user={publicUser} />
    </>
  );
}
