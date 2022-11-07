import { Loading } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

export default function Verify2FA() {
  const router = useRouter();
  const { callbackUrl: encodedCallbackUrl, token } = router.query;
  const callbackUrl = decodeURIComponent(encodedCallbackUrl as string);

  React.useEffect(() => {
    if (callbackUrl && token) {
      console.log("callbackUrl", callbackUrl);
      (async () => {
        try {
          const result = await signIn("2fa", {
            token,
            callbackUrl,
            redirect: false,
          });

          if (result && result.ok && result.url) {
            router.push(result.url);
          } else {
            throw new Error("Unexpected login result: " + result?.error);
          }
        } catch (error) {
          console.error(error);
          alert("login failed");
        }
      })();
    }
  }, [callbackUrl, router, token]);

  return (
    <>
      <Loading type="points" color="currentColor" size="sm" />
    </>
  );
}
