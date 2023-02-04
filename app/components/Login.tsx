import React from "react";
import { Button, Row, Spacer, Text } from "@nextui-org/react";
import { useTranslation } from "next-i18next";
import EmailSignIn from "pages/auth/signin/email";
import LnurlAuthSignIn from "pages/auth/signin/lnurl";
import PhoneSignIn from "pages/auth/signin/phone";
import { useState } from "react";
import { LoginMethod, loginMethods } from "types/LoginMethod";

type LoginProps = {
  instructionsText?(loginMethod: LoginMethod): string;
  submitText?: string;
  callbackUrl?: string;
  tipId?: string;
  defaultLoginMethod: LoginMethod;
};

export function Login({
  submitText,
  callbackUrl,
  instructionsText,
  tipId,
  defaultLoginMethod,
}: LoginProps) {
  const { t } = useTranslation(["common", "login"]);
  const [loginMethod, setLoginMethod] =
    useState<LoginMethod>(defaultLoginMethod);

  return (
    <>
      {instructionsText && (
        <>
          <Text>{instructionsText(loginMethod)}</Text>
          <Spacer />
        </>
      )}
      {loginMethod === "phone" && (
        <PhoneSignIn
          callbackUrl={callbackUrl}
          submitText={submitText}
          tipId={tipId}
        />
      )}
      {loginMethod === "email" && (
        <EmailSignIn callbackUrl={callbackUrl} submitText={submitText} />
      )}
      {loginMethod === "lightning" && (
        <>
          <LnurlAuthSignIn callbackUrl={callbackUrl} />
        </>
      )}

      <Spacer />
      <Row justify="center" align="center">
        <Text>{t("login:use")} &nbsp;</Text>
        {loginMethods
          .filter((method) => method !== loginMethod)
          .map((method, i) => {
            return (
              <React.Fragment key={i}>
                <Button
                  light
                  auto
                  css={{ px: "$5" }}
                  color="primary"
                  onClick={() => setLoginMethod(method)}
                >
                  {t(`common:${method}`)}
                </Button>
                {i === 0 && <Text>&nbsp;{t("common:or")}&nbsp;</Text>}
              </React.Fragment>
            );
          })}
        <Text>&nbsp; {t("login:instead")}</Text>
      </Row>
    </>
  );
}
