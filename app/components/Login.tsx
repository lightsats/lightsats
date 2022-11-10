import { Link, Row, Spacer, Text } from "@nextui-org/react";
import { LightningLoginButton } from "components/LightningLoginButton";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import EmailSignIn from "pages/auth/signin/email";
import PhoneSignIn from "pages/auth/signin/phone";
import { useState } from "react";

type LoginProps = {
  submitText?: string;
};

const loginMethods = ["phone", "email", "lightning"] as const;
type LoginMethod = typeof loginMethods[number];

export function Login(props: LoginProps) {
  const { t } = useTranslation(["claim", "common"]);
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");

  return (
    <>
      {loginMethod === "phone" && (
        <PhoneSignIn
          callbackUrl={router.pathname}
          submitText={props.submitText}
        />
      )}
      {loginMethod === "email" && (
        <EmailSignIn
          callbackUrl={router.pathname}
          submitText={props.submitText}
        />
      )}
      {loginMethod === "lightning" && (
        <>
          <Spacer />
          <LightningLoginButton />
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
        <Text></Text>
      </Row>
    </>
  );
}
