import { Button, Row, Spacer, Text } from "@nextui-org/react";
import { useTranslation } from "next-i18next";
import EmailSignIn from "pages/auth/signin/email";
import LnurlAuthSignIn from "pages/auth/signin/lnurl";
import PhoneSignIn from "pages/auth/signin/phone";
import React, { useState } from "react";
import { LoginMethod, loginMethods } from "types/LoginMethod";

type LoginProps = {
  instructionsText?(loginMethod: LoginMethod): string;
  submitText?: string;
  callbackUrl?: string;
  tipId?: string;
  defaultLoginMethod: LoginMethod;
  allowedLoginMethods?: LoginMethod[];
  isPreview?: boolean;
};

export function Login({
  submitText,
  callbackUrl,
  instructionsText,
  tipId,
  defaultLoginMethod,
  allowedLoginMethods,
  isPreview,
}: LoginProps) {
  const { t } = useTranslation(["common", "login"]);
  const [loginMethod, setLoginMethod] =
    useState<LoginMethod>(defaultLoginMethod);

  const alternativeMethods = React.useMemo(
    () =>
      (allowedLoginMethods || loginMethods).filter(
        (method) => method !== loginMethod
      ),
    [allowedLoginMethods, loginMethod]
  );

  return (
    <>
      {instructionsText && (
        <>
          <Text>{instructionsText(loginMethod)}</Text>
          <Spacer />
        </>
      )}
      <Text size="small">
        By authenticating, you agree to our{" "}
        <a href="/terms" target="_blank">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" target="_blank">
          Privacy Policy
        </a>
        .
      </Text>
      <Spacer y={2} />
      {loginMethod === "phone" && (
        <PhoneSignIn
          callbackUrl={callbackUrl}
          submitText={submitText}
          tipId={tipId}
          isPreview={isPreview}
        />
      )}
      {loginMethod === "email" && (
        <EmailSignIn
          callbackUrl={callbackUrl}
          submitText={submitText}
          isPreview={isPreview}
        />
      )}
      {loginMethod === "lightning" && (
        <>
          <LnurlAuthSignIn callbackUrl={callbackUrl} isPreview={isPreview} />
        </>
      )}
      {alternativeMethods.length > 0 && (
        <>
          <Spacer y={1.5} />
          <Text color="$gray800" size="$sm">
            {t(`common:alternativeWaysToSignIn`)}
          </Text>
          <Spacer y={0.5} />
          {alternativeMethods.map((method) => {
            return (
              <React.Fragment key={method}>
                <Row justify="center" align="center">
                  <Button
                    bordered
                    css={{
                      margin: "$5",
                      width: "100%",
                    }}
                    onClick={() => setLoginMethod(method)}
                  >
                    {t(`common:${method}`)}
                  </Button>
                </Row>
              </React.Fragment>
            );
          })}
        </>
      )}
    </>
  );
}
