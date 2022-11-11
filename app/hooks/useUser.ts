import { User } from "@prisma/client";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR from "swr";

export function useUser() {
  const { data: session } = useSession();
  return useSWR<User>(
    session ? `/api/users/${session.user.id}` : null,
    defaultFetcher
  );
}
