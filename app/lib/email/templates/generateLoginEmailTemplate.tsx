import {
  Mjml,
  MjmlBody,
  MjmlButton,
  MjmlColumn,
  MjmlHead,
  MjmlImage,
  MjmlPreview,
  MjmlSection,
  MjmlText,
  MjmlTitle,
} from "@faire/mjml-react";

export type LoginEmailTemplateOptions = {
  template: "login";
  title: string;
  preview: string;
  message: string;
  verifyButtonText: string;
  verifyUrl: string;
};

export function generateLoginEmailTemplate({
  title,
  preview,
  message,
  verifyButtonText,
  verifyUrl,
}: LoginEmailTemplateOptions) {
  return (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>{title}</MjmlTitle>
        <MjmlPreview>{preview}</MjmlPreview>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor="#efefef">
          <MjmlColumn>
            <MjmlImage
              width={128}
              src={`${process.env.APP_URL}/icons/icon-128x128.png`}
            />
            <MjmlText align="center">{message}</MjmlText>
            <MjmlButton
              padding="20px"
              backgroundColor="#346DB7"
              href={verifyUrl}
            >
              {verifyButtonText}
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
}
