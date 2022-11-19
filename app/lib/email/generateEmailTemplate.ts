import {
  generateLoginEmailTemplate,
  LoginEmailTemplateOptions,
} from "lib/email/templates/generateLoginEmailTemplate";

import { render } from "@faire/mjml-react/dist/src/utils/render";
import { EmailTemplate } from "components/email/EmailTemplate";
import { ApiI18n } from "lib/i18n/api";

type GenerateEmailTemplateOptions =
  | LoginEmailTemplateOptions
  | { template: "2ndTemplate"; exampleProp1: string; exampleProp2: string };

export function generateEmailTemplate(
  options: GenerateEmailTemplateOptions,
  i18n: ApiI18n
): string {
  let element: JSX.Element;

  switch (options.template) {
    case "login":
      element = generateLoginEmailTemplate(options, i18n);
      break;
    case "2ndTemplate":
      throw new Error("TODO");
  }

  const subject = i18n(`${options.template}.subject`, { ns: "email" });

  const template = EmailTemplate({
    title: subject,
    preview: subject,
    children: element,
  });

  const result = render(template, { validationLevel: "soft" });

  if (result.errors?.length) {
    throw new Error(
      "Failed to generate email template " +
        options.template +
        ": " +
        JSON.stringify(result.errors)
    );
  }
  return result.html;
}
