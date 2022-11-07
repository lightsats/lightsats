import { Button, Input, Loading, Spacer } from "@nextui-org/react";
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

type PhoneFormData = {
  phone: string;
};

type PhoneSignInProps = {
  callbackUrl?: string;
  submitText?: React.ReactNode;
};

// type TokenFormData = {
//   token: string;
// };

export default function PhoneSignIn({
  callbackUrl,
  submitText,
}: PhoneSignInProps) {
  const { t } = useTranslation("common");
  const { control, handleSubmit, setFocus } = useForm<PhoneFormData>();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const callbackUrlWithFallback =
    callbackUrl || (router.query["callbackUrl"] as string) || Routes.home;

  console.log("callbackUrlWithFallback", callbackUrlWithFallback);

  React.useEffect(() => {
    setFocus("phone");
  }, [setFocus]);

  const onSubmit = React.useCallback(
    (data: PhoneFormData) => {
      if (isSubmitting) {
        return;
      }
      if (!data.phone) {
        alert("Please enter a valid phone address");
        return;
      }
      setSubmitting(true);
      (async () => {
        try {
          const twoFactorLoginRequest: TwoFactorLoginRequest = {
            phoneNumber: data.phone,
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
              "Failed to create phone login link: " + result.status
            );
            alert("Something went wrong. Please try again.");
          }
          router.push(Routes.checkPhone);
        } catch (error) {
          console.error(error);
          alert("login failed");
        }

        setSubmitting(false);
      })();
    },
    [callbackUrlWithFallback, isSubmitting, router]
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              bordered
              {...field}
              label={t("phone")}
              type="tel"
              placeholder="+66612345678"
              autoComplete="tel"
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
    </>
  );
}
