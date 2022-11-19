import {
  MjmlButton,
  MjmlColumn,
  MjmlImage,
  MjmlSection,
  MjmlText,
} from "@faire/mjml-react";
import { CommonEmailTemplateProps } from "types/CommonEmailTemplateProps";

export type LoginEmailTemplateProps = CommonEmailTemplateProps & {
  template: "login";
  verifyUrl: string;
};

export function LoginEmailTemplate({
  verifyUrl,
  i18n,
}: LoginEmailTemplateProps) {
  return (
    <>
      <MjmlSection
        backgroundColor="#FFF"
        paddingBottom={0}
        paddingTop={0}
        padding="20px 0"
        textAlign="center"
      >
        <MjmlColumn>
          <MjmlImage
            align="center"
            border={0}
            width={200}
            padding="10px 25px"
            src={`${process.env.APP_URL}/images/seed.png`}
            target="_blank"
          ></MjmlImage>
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection backgroundColor="#FFF" padding="20px 0" textAlign="center">
        <MjmlColumn>
          <MjmlText
            fontSize={26}
            align="center"
            fontWeight="bold"
            fontFamily="Inter, Arial"
          >
            {i18n("login.title", { ns: "email" })}
          </MjmlText>
          <MjmlText fontSize={14} align="center" fontFamily="Inter, Arial">
            {i18n("login.text", { ns: "email" })}
          </MjmlText>
          <MjmlButton
            fontFamily="Inter, Arial"
            href={verifyUrl}
            color="#FFF"
            backgroundColor="#2E74ED"
            padding={10}
            paddingBottom={20}
          >
            {i18n("login.buttonText", { ns: "email" })}
          </MjmlButton>
          <MjmlText
            fontFamily="Inter, Arial"
            color="#AAA"
            align="center"
            paddingTop={40}
          >
            {"Link won't open? Open this URL in your browser:"}
            <br />
            <br />
            <a href={verifyUrl} style={{ color: "#AAA" }}>
              {verifyUrl}
            </a>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>
    </>
  );
}
