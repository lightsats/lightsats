import { User } from "@prisma/client";
import { useIsPWA } from "hooks/useIsPWA";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR from "swr";

export function useUser() {
  const isPWA = useIsPWA();
  const { data: session } = useSession();
  return useSWR<User>(
    session ? `/api/users/${session.user.id}?isPWA=${isPWA}` : null,
    defaultFetcher
  );
}
