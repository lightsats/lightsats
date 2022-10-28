import { Button, Input, Loading, Spacer, Text } from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { Routes } from "lib/Routes";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";

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

export default function EmailSignIn({
  inline,
  callbackUrl,
  submitText,
}: EmailSignInProps) {
  const { control, handleSubmit, setFocus } = useForm<EmailFormData>();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  callbackUrl = callbackUrl ?? (router.query["callbackUrl"] as string);

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
          const result = await signIn("email", {
            email: data.email,
            redirect: false,
            callbackUrl: callbackUrl ?? Routes.home,
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

        setSubmitting(false);
      })();
    },
    [callbackUrl, isSubmitting, router]
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
              label="Email"
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
