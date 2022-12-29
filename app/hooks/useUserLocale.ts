import { useUser } from "hooks/useUser";
import { PageRoutes } from "lib/PageRoutes";
import { switchRouterLocale } from "lib/utils";
import { useRouter } from "next/router";

export function useUserLocale() {
  const { data: user } = useUser();
  const router = useRouter();
  if (
    user &&
    user.locale !== router.locale &&
    router.pathname !== PageRoutes.logout &&
    router.pathname !== PageRoutes.verifySignin &&
    router.pathname !== PageRoutes.lnurlAuthSignin &&
    router.pathname !== PageRoutes.signin
  ) {
    switchRouterLocale(router, user.locale);
  }
}
