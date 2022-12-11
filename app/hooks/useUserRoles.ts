import { UserRole } from "@prisma/client";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR from "swr";

export function useUserRoles() {
  const { data: session } = useSession();
  return useSWR<UserRole[]>(
    session ? `/api/users/${session.user.id}/roles` : null,
    defaultFetcher
  );
}
