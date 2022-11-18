import {
  Mjml,
  MjmlBody,
  MjmlColumn,
  MjmlDivider,
  MjmlFont,
  MjmlHead,
  MjmlImage,
  MjmlPreview,
  MjmlSection,
  MjmlSocial,
  MjmlSocialElement,
  MjmlText,
  MjmlTitle,
} from "@faire/mjml-react";
import { ReactNode } from "react";

export type EmailTemplateOptions = {
  title: string;
  preview: string;
  children: ReactNode;
};

export function EmailTemplate({
  title,
  preview,
  children,
}: EmailTemplateOptions) {
  return (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>{title}</MjmlTitle>
        <MjmlPreview>{preview}</MjmlPreview>
        <MjmlFont
          href="https://fonts.googleapis.com/css?family=Inter"
          name="Inter"
        />
      </MjmlHead>
      <MjmlBody backgroundColor="#f8f8f8">
        <MjmlSection>
          <MjmlColumn>
            <MjmlText fontFamily="Inter, Arial" align="center">
              &nbsp;
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection backgroundColor="#ffffff" padding={0}>
          <MjmlColumn padding={0} paddingBottom={10}>
            <MjmlDivider
              borderColor="#2E74ED"
              borderStyle="solid"
              borderWidth="7px"
              padding={0}
              paddingBottom="10px"
              align="center"
            ></MjmlDivider>
            <MjmlImage
              width={150}
              href={process.env.APP_URL}
              padding="10px 25px"
              src={`${process.env.APP_URL}/images/logo.svg`}
              target="_blank"
            ></MjmlImage>
          </MjmlColumn>
        </MjmlSection>
        {children}
        <MjmlSection>
          <MjmlColumn>
            <MjmlText fontFamily="Inter, Arial" align="center">
              Stay humble. ✌️
            </MjmlText>
            <MjmlSocial padding={0}>
              <MjmlSocialElement
                backgroundColor="#2E74ED"
                name="twitter-noshare"
                href="https://twitter.com/lightsats21"
                srcset="http://saas-templates-creator.mailjet.com/saas-templates-creator/static/img/twitter_white.png"
              ></MjmlSocialElement>
            </MjmlSocial>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
}
