import {
  generateLoginEmailTemplate,
  LoginEmailTemplateOptions,
} from "lib/email/templates/generateLoginEmailTemplate";

import { render } from "@faire/mjml-react/dist/src/utils/render";

type GenerateEmailTemplateOptions =
  | LoginEmailTemplateOptions
  | { template: "2ndTemplate"; exampleProp1: string; exampleProp2: string };

export function generateEmailTemplate(
  options: GenerateEmailTemplateOptions
): string {
  let element: JSX.Element;

  switch (options.template) {
    case "login":
      element = generateLoginEmailTemplate(options);
      break;
    case "2ndTemplate":
      throw new Error("TODO");
  }

  const result = render(element, { validationLevel: "soft" });

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
