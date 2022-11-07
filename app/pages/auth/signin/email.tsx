import { Button, Input, Loading, Spacer, Text } from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { Routes } from "lib/Routes";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { TwoFactorLoginRequest } from "types/TwoFactorLoginRequest";

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

type EmailFormData = {
  email: string;
};

type EmailSignInProps = {
  inline?: boolean;
  callbackUrl?: string;
  submitText?: React.ReactNode;
};

// type TokenFormData = {
//   token: string;
// };

export default function EmailSignIn({
  inline,
  callbackUrl,
  submitText,
}: EmailSignInProps) {
  const { t } = useTranslation("common");
  const { control, handleSubmit, setFocus } = useForm<EmailFormData>();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const callbackUrlWithFallback =
    callbackUrl || (router.query["callbackUrl"] as string) || Routes.home;

  console.log("callbackUrlWithFallback", callbackUrlWithFallback);

  React.useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const onSubmit = React.useCallback(
    (data: EmailFormData) => {
      if (isSubmitting) {
        return;
      }
      if (!data.email) {
        alert("Please enter a valid email address");
        return;
      }
      setSubmitting(true);
      (async () => {
        try {
          const twoFactorLoginRequest: TwoFactorLoginRequest = {
            email: data.email,
            callbackUrl: callbackUrlWithFallback,
            locale: router.locale ?? DEFAULT_LOCALE,
          };

          const result = await fetch(`/api/auth/2fa/send`, {
            method: "POST",
            body: JSON.stringify(twoFactorLoginRequest),
            headers: { "Content-Type": "application/json" },
          });
          if (!result.ok) {
            console.error(
              "Failed to create email login link: " + result.status
            );
            alert("Something went wrong. Please try again.");
          }
          router.push(Routes.checkEmail);

          /*const result = await signIn("email", {
            email: data.email,
            redirect: false,
            callbackUrl: callbackUrl ?? Routes.home,
          });*/

          /*const result = await 


          if (result && result.ok && result.url) {
            router.push(result.url);
          } else {
            throw new Error("Unexpected login result: " + result?.error);
          }*/
        } catch (error) {
          console.error(error);
          alert("login failed");
        }

        setSubmitting(false);
      })();
    },
    [callbackUrlWithFallback, isSubmitting, router.locale]
  );

  return (
    <>
      {!inline && (
        <>
          <Text>Enter your email below to login.</Text>
          <Spacer />
        </>
      )}
      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label={t("email")}
              type="email"
              placeholder="satoshin@gmx.com"
              fullWidth
              autoComplete="email"
            />
          )}
        />

        <Spacer y={0.5} />
        <Button css={{ width: "100%" }} type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loading type="points" color="currentColor" size="sm" />
          ) : (
            <>{submitText ?? "Login"}</>
          )}
        </Button>
      </form>
      {!inline && (
        <>
          <Spacer y={4} />
          <BackButton />
        </>
      )}
    </>
  );
}
