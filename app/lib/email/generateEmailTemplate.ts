import {
  LoginEmailTemplate,
  LoginEmailTemplateProps,
} from "lib/email/templates/LoginEmailTemplate";

import { render } from "@faire/mjml-react/dist/src/utils/render";
import { EmailTemplate } from "lib/email/templates/EmailTemplate";
import { CommonEmailTemplateProps } from "types/CommonEmailTemplateProps";

type GenerateEmailTemplateProps =
  | LoginEmailTemplateProps
  | (CommonEmailTemplateProps & {
      template: "2ndTemplate";
      exampleProp1: string;
      exampleProp2: string;
    });

export function generateEmailTemplate(
  props: GenerateEmailTemplateProps
): string {
  let element: JSX.Element;

  switch (props.template) {
    case "login":
      element = LoginEmailTemplate(props);
      break;
    case "2ndTemplate":
      throw new Error("TODO");
  }

  const subject = props.i18n(`${props.template}.subject`, { ns: "email" });

  const template = EmailTemplate({
    title: subject,
    preview: subject,
    children: element,
  });

  const result = render(template, { validationLevel: "soft" });

  if (result.errors?.length) {
    throw new Error(
      "Failed to generate email template " +
        props.template +
        ": " +
        JSON.stringify(result.errors)
    );
  }
  return result.html;
}
