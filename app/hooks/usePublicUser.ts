import { defaultFetcher } from "lib/swr";
import useSWR from "swr";
import { PublicUser } from "types/PublicUser";

export function usePublicUser(
  userId: string | undefined,
  forceAnonymous = false
) {
  return useSWR<PublicUser>(
    userId
      ? `/api/users/${userId}?publicProfile=true&forceAnonymous=${forceAnonymous}`
      : undefined,
    defaultFetcher
  );
}
