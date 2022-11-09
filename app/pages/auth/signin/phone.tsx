import {
  Button,
  FormElement,
  Input,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { notifyError } from "components/Toasts";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput, {
  Country,
  DefaultInputComponentProps,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import useSWR from "swr";
import { TwoFactorLoginRequest } from "types/TwoFactorLoginRequest";

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

type PhoneFormData = {
  phone: string;
};

type PhoneSignInProps = {
  callbackUrl?: string;
  submitText?: React.ReactNode;
};

type MyIp = { country: Country; ip: string };

export default function PhoneSignIn({
  callbackUrl,
  submitText,
}: PhoneSignInProps) {
  const { data: myIp } = useSWR<MyIp>("https://api.country.is", defaultFetcher);
  const { t } = useTranslation("common");
  const { control, handleSubmit, setFocus } = useForm<PhoneFormData>();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const callbackUrlWithFallback =
    callbackUrl || (router.query["callbackUrl"] as string) || Routes.home;

  console.log("callbackUrlWithFallback", callbackUrlWithFallback);

  React.useEffect(() => {
    setFocus("phone");
  }, [setFocus]);

  const onSubmit = React.useCallback(
    (data: PhoneFormData) => {
      if (isSubmitting) {
        return;
      }
      if (!data.phone) {
        notifyError("Please enter a valid phone address");
        return;
      }
      setSubmitting(true);
      (async () => {
        try {
          const twoFactorLoginRequest: TwoFactorLoginRequest = {
            phoneNumber: data.phone,
            callbackUrl: callbackUrlWithFallback,
            locale: router.locale ?? DEFAULT_LOCALE,
          };

          const result = await fetch(`/api/auth/2fa/send`, {
            method: "POST",
            body: JSON.stringify(twoFactorLoginRequest),
            headers: { "Content-Type": "application/json" },
          });
          if (!result.ok) {
            console.error(
              "Failed to create phone login link: " + result.status
            );
            notifyError("Something went wrong. Please try again.");
          }
          router.push(Routes.checkPhone);
        } catch (error) {
          console.error(error);
          notifyError("login failed");
        }

        setSubmitting(false);
      })();
    },
    [callbackUrlWithFallback, isSubmitting, router]
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
        <Row>
          <Text>{t("phone")}</Text>
        </Row>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              {...field}
              placeholder="Enter phone number"
              defaultCountry={myIp?.country}
              inputComponent={ForwardedPhoneInput}
              style={{
                width: "100%",
              }}
            />
          )}
        />

        <Spacer />
        <Button
          css={{ width: "100%" }}
          color="primary"
          type="submit"
          auto
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loading type="points" color="currentColor" size="sm" />
          ) : (
            <>{submitText ?? "Login"}</>
          )}
        </Button>
      </form>
    </>
  );
}

const ForwardedPhoneInput = React.forwardRef<
  unknown,
  DefaultInputComponentProps
>((props, ref) => {
  const { className, ...otherProps } = props;
  className; //  don't use the classname prop - use NextUI styling
  return (
    <Input
      {...otherProps}
      ref={ref as React.Ref<FormElement>}
      bordered
      aria-label="phone"
      placeholder="0661234568"
      fullWidth
    />
  );
});
ForwardedPhoneInput.displayName = "ForwardedInput";
