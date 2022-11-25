import { useUser } from "hooks/useUser";
import { switchRouterLocale } from "lib/utils";
import { useRouter } from "next/router";

export function useUserLocale() {
  const { data: user } = useUser();
  const router = useRouter();
  if (user && user.locale !== router.locale) {
    switchRouterLocale(router, user.locale);
  }
}
