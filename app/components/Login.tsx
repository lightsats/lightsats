import { Link, Row, Spacer, Text } from "@nextui-org/react";
import { LightningLoginButton } from "components/LightningLoginButton";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import EmailSignIn from "pages/auth/signin/email";
import PhoneSignIn from "pages/auth/signin/phone";
import { useState } from "react";

type LoginProps = {
  submitText: string;
};

export function Login(props: LoginProps) {
  const { t } = useTranslation(["claim", "common"]);
  const router = useRouter();
  const [signupMethod, setSignupMethod] = useState("phone");
  const signupMethods = ["phone", "email", "lightning"];

  return (
    <>
      {signupMethod == "phone" && (
        <PhoneSignIn
          callbackUrl={router.pathname}
          submitText={props.submitText}
        />
      )}
      {signupMethod == "email" && (
        <EmailSignIn
          callbackUrl={router.pathname}
          submitText={props.submitText}
        />
      )}
      {signupMethod == "lightning" && (
        <>
          <Spacer />
          <LightningLoginButton />
        </>
      )}

      <Spacer y={1} />
      <Row justify="center" align="center">
        <Text>Use &nbsp;</Text>
        {signupMethods
          .filter((method) => method != signupMethod)
          .map((method, i) => {
            return (
              <>
                <Link onClick={() => setSignupMethod(method)}>
                  {t(`common:${method}`)}
                </Link>
                {i == 0 && <Text>&nbsp;{t("or")}&nbsp;</Text>}
              </>
            );
          })}
        <Text></Text>
      </Row>
    </>
  );
}
