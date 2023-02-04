import {
  Button,
  Card,
  Divider,
  Input,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { getStaticProps } from "lib/i18n/i18next";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { PageRoutes } from "lib/PageRoutes";
import { tryGetErrorMessage } from "lib/utils";
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
    callbackUrl ||
    (router.query["callbackUrl"] as string) ||
    PageRoutes.dashboard;
  const linkExistingAccount = router.query["link"] === "true";

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
            linkExistingAccount,
          };

          const result = await fetch(`/api/auth/2fa/send`, {
            method: "POST",
            body: JSON.stringify(twoFactorLoginRequest),
            headers: { "Content-Type": "application/json" },
          });
          if (!result.ok) {
            const errorMessage = await tryGetErrorMessage(result);
            console.error(
              "Failed to create email login link: " + result.status,
              errorMessage
            );
            toast.error(errorMessage);
          } else {
            router.push(PageRoutes.checkEmail);
          }
        } catch (error) {
          console.error(error);
          toast.error("login failed");
        }

        setSubmitting(false);
      })();
    },
    [callbackUrlWithFallback, isSubmitting, linkExistingAccount, router]
  );

  return (
    <>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Header>
          <Row justify="center">
            <Text h4 css={{ fontWeight: "bold", m: 0 }}>
              {t("email")}
            </Text>
          </Row>
        </Card.Header>
        <Divider />
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  bordered
                  {...field}
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
                <Loading color="currentColor" size="sm" />
              ) : (
                <>{submitText ?? "Sign in"}</>
              )}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </>
  );
}

export { getStaticProps };
