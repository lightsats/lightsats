import { User } from "@prisma/client";
import { useIsPWA } from "hooks/useIsPWA";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR, { SWRConfiguration } from "swr";

const pollUserConfig: SWRConfiguration = { refreshInterval: 1000 };

export function useUser(poll = false) {
  const isPWA = useIsPWA();
  const { data: session } = useSession();
  return useSWR<User>(
    session ? `/api/users/${session.user.id}?isPWA=${isPWA}` : null,
    defaultFetcher,
    poll ? pollUserConfig : undefined
  );
}
