import { Loading } from "@nextui-org/react";
import jwt_decode from "jwt-decode";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { TwoFactorAuthToken } from "types/TwoFactorAuthToken";

export default function Verify2FA() {
  const router = useRouter();
  const { token } = router.query;

  React.useEffect(() => {
    if (token) {
      const decodedToken = jwt_decode<TwoFactorAuthToken>(token as string);
      (async () => {
        try {
          const result = await signIn("2fa", {
            token,
            callbackUrl: decodedToken.callbackUrl,
            redirect: false,
          });

          if (result && result.ok && result.url) {
            router.push(result.url);
          } else {
            throw new Error("Unexpected login result: " + result?.error);
          }
        } catch (error) {
          console.error(error);
          toast.error("login failed");
        }
      })();
    }
  }, [router, token]);

  return (
    <>
      <Loading color="currentColor" size="sm" />
    </>
  );
}
