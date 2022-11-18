import {
  MjmlButton,
  MjmlColumn,
  MjmlImage,
  MjmlSection,
  MjmlText,
} from "@faire/mjml-react";

export type LoginEmailTemplateOptions = {
  template: "login";
  // title: string;
  // preview: string;
  // message: string;
  // verifyButtonText: string;
  verifyUrl: string;
};

export function generateLoginEmailTemplate(
  { verifyUrl }: LoginEmailTemplateOptions,
  i18n: any
) {
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
            {i18n("email:login.title")}
          </MjmlText>
          <MjmlText fontSize={14} align="center" fontFamily="Inter, Arial">
            {i18n("email:login.text")}
          </MjmlText>
          <MjmlButton
            fontFamily="Inter, Arial"
            href={verifyUrl}
            color="#FFF"
            backgroundColor="#2E74ED"
            padding={10}
            paddingBottom={20}
          >
            {i18n("email:login.buttonText")}
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
