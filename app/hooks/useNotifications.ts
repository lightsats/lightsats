import { Notification } from "@prisma/client";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR from "swr";

export function useNotifications() {
  const { data: session } = useSession();
  return useSWR<Notification[]>(
    session ? `/api/users/${session.user.id}/notifications` : null,
    defaultFetcher
  );
}
