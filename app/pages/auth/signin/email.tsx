import { Button, Card, Input, Loading, Spacer } from "@nextui-org/react";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { Routes } from "lib/Routes";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
  callbackUrl?: string;
  submitText?: React.ReactNode;
};

// type TokenFormData = {
//   token: string;
// };

export default function EmailSignIn({
  callbackUrl,
  submitText,
}: EmailSignInProps) {
  const { t } = useTranslation("common");
  const { control, handleSubmit, setFocus } = useForm<EmailFormData>();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const callbackUrlWithFallback =
    callbackUrl || (router.query["callbackUrl"] as string) || Routes.home;

  // console.log("callbackUrlWithFallback", callbackUrlWithFallback);

  React.useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const onSubmit = React.useCallback(
    (data: EmailFormData) => {
      if (isSubmitting) {
        return;
      }
      if (!data.email) {
        toast.error("Please enter a valid email address");
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
            toast.error("Something went wrong. Please try again.");
          } else {
            router.push(Routes.checkEmail);
          }
        } catch (error) {
          console.error(error);
          toast.error("login failed");
        }

        setSubmitting(false);
      })();
    },
    [callbackUrlWithFallback, isSubmitting, router]
  );

  return (
    <>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  bordered
                  {...field}
                  label={t("email")}
                  type="email"
                  placeholder="satoshin@gmx.com"
                  autoComplete="email"
                  fullWidth
                />
              )}
            />
            <Spacer />
            <Button
              css={{ width: "100%" }}
              color="primary"
              type="submit"
              auto
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading type="points" color="currentColor" size="sm" />
              ) : (
                <>{submitText ?? "Login"}</>
              )}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </>
  );
}
