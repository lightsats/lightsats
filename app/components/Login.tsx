import { Link, Row, Spacer, Text } from "@nextui-org/react";
import { useTranslation } from "next-i18next";
import EmailSignIn from "pages/auth/signin/email";
import LnurlAuthSignIn from "pages/auth/signin/lnurl";
import PhoneSignIn from "pages/auth/signin/phone";
import { useState } from "react";

type LoginProps = {
  instructionsText?(loginMethod: LoginMethod): string;
  submitText?: string;
  callbackUrl?: string;
  tipId?: string;
  defaultLoginMethod: LoginMethod;
};

const loginMethods = ["phone", "email", "lightning"] as const;
type LoginMethod = typeof loginMethods[number];

export function Login({
  submitText,
  callbackUrl,
  instructionsText,
  tipId,
  defaultLoginMethod,
}: LoginProps) {
  const { t } = useTranslation(["claim", "common"]);
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
          <Spacer />
          <LnurlAuthSignIn callbackUrl={callbackUrl} />
        </>
      )}

      <Spacer y={1} />
      <Row justify="center" align="center">
        <Text>Use &nbsp;</Text>
        {loginMethods
          .filter((method) => method !== loginMethod)
          .map((method, i) => {
            return (
              <>
                <Link onClick={() => setLoginMethod(method)}>
                  {t(`common:${method}`)}
                </Link>
                {i === 0 && <Text>&nbsp;{t("or")}&nbsp;</Text>}
              </>
            );
          })}
      </Row>
    </>
  );
}
