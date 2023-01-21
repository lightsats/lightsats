import {
  Col,
  Input,
  Row,
  Spacer,
  Switch,
  Text,
  Textarea,
} from "@nextui-org/react";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { Divider } from "components/Divider";
import { TipFormData } from "components/tipper/TipForm/TipFormData";
import { getNativeLanguageName } from "lib/i18n/iso6391";
import { locales } from "lib/i18n/locales";
import { wallets } from "lib/items/wallets";
import React from "react";
import {
  Control,
  Controller,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

const tippeeLocaleSelectOptions: SelectOption[] = locales.map((locale) => ({
  value: locale,
  label: getNativeLanguageName(locale),
}));

const recommendedWalletSelectOptions: SelectOption[] = wallets.map(
  (wallet) => ({
    value: wallet.id,
    label: wallet.name,
  })
);

type TipFormAdvancedOptionsProps = {
  mode: "create" | "update";
  register: UseFormRegister<TipFormData>;
  control: Control<TipFormData, unknown>;
  setValue: UseFormSetValue<TipFormData>;
  watch: UseFormWatch<TipFormData>;
  quantity: number;
};

export function TipFormAdvancedOptions({
  mode,
  register,
  control,
  watch,
  setValue,
  quantity,
}: TipFormAdvancedOptionsProps) {
  const watchedTippeeLocale = watch("tippeeLocale");
  const watchedrecommendedWalletId = watch("recommendedWalletId");
  const watchedTippeeName = watch("tippeeName");
  const watchedSkipOnboarding = watch("skipOnboarding");
  const watchedEnterIndividualNames = watch("enterIndividualNames");

  const setTippeeLocale = React.useCallback(
    (locale: string) => {
      setValue("tippeeLocale", locale);
    },
    [setValue]
  );

  const setrecommendedWalletId = React.useCallback(
    (recommendedWalletId: string) => {
      setValue("recommendedWalletId", recommendedWalletId);
    },
    [setValue]
  );

  return (
    <>
      {mode === "create" && <Spacer />}
      <Row align="flex-start">
        <Col>
          <Text>⌛ Tip expiry</Text>
          <Text small css={{ mt: 6, lineHeight: 1.2, display: "inline-block" }}>
            Days until the tip returns back to you.
          </Text>
        </Col>
        <Col css={{ ta: "right" }}>
          <Controller
            name="expiresIn"
            control={control}
            render={({ field }) => (
              <Input
                aria-label="Tip expires in"
                {...field}
                {...register("expiresIn", {
                  valueAsNumber: true,
                })}
                min={1}
                style={{
                  textAlign: "center",
                }}
                width="100px"
                type="number"
                inputMode="decimal"
                bordered
                color="primary"
              />
            )}
          />
        </Col>
      </Row>
      <Spacer />
      <Row align="flex-start">
        <Col>
          <Text css={{ whiteSpace: "nowrap" }}>⏭️ Skip onboarding</Text>
        </Col>
        <Col css={{ ta: "right" }}>
          <Controller
            name="skipOnboarding"
            control={control}
            render={({ field }) => (
              <Switch
                {...field}
                checked={field.value}
                color={watchedSkipOnboarding ? "warning" : undefined}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
        </Col>
      </Row>
      <Text
        small
        css={{
          mt: 0,
          mb: 6,
          lineHeight: 1.2,
          display: "inline-block",
        }}
      >
        Allow your recipient to directly withraw without logging in.
      </Text>
      <Divider />
      <Controller
        name="tippeeName"
        control={control}
        render={({ field }) =>
          quantity > 1 ? (
            <Col>
              <Row align="center" justify="space-between">
                <Row>
                  <Text>Recipient names</Text>
                </Row>
                <Row align="flex-start" justify="flex-end">
                  <Text size="small">Individual Names</Text>
                  <Spacer x={0.5} />
                  <Switch
                    size="xs"
                    checked={watchedEnterIndividualNames}
                    onChange={(e) =>
                      setValue("enterIndividualNames", e.target.checked)
                    }
                  />
                </Row>
              </Row>
              <Spacer y={0.5} />
              {watchedEnterIndividualNames && (
                <Text size="small">
                  Entered{" "}
                  {watchedTippeeName?.split("\n").filter((name) => name)
                    .length || 0}
                  &nbsp;/&nbsp;{quantity} names
                </Text>
              )}
              <Textarea
                {...field}
                aria-label={"Recipient names"}
                placeholder={
                  watchedEnterIndividualNames
                    ? `Hal Finney
Micheal Saylor`
                    : "Recipient {{index}}"
                }
                fullWidth
                bordered
                rows={watchedEnterIndividualNames ? quantity : undefined}
              />
            </Col>
          ) : (
            <Input
              {...field}
              label="Recipient name"
              placeholder="Hal Finney"
              maxLength={255}
              fullWidth
              bordered
            />
          )
        }
      />
      <Spacer />
      <Controller
        name="note"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label={quantity > 1 ? "Note to recipients" : "Note to recipient"}
            placeholder={
              quantity > 1
                ? "Thank you {{name}} for your amazing service!"
                : "Thank you for your amazing service!"
            }
            maxLength={255}
            fullWidth
            bordered
          />
        )}
      />
      <Spacer />
      <Text>Recipient Language</Text>
      <Text size="small">
        {
          "Your recipient's language is autodetected, but you can explictly set it if needed."
        }
      </Text>
      <Spacer y={0.5} />
      <CustomSelect
        options={tippeeLocaleSelectOptions}
        isClearable
        value={watchedTippeeLocale}
        onChange={setTippeeLocale}
        width="100px"
      />
      <Spacer />
      <Text>Suggested Wallet ID</Text>
      <Text size="small">
        {"The recipient will always be recommended this wallet."}
      </Text>
      <Spacer y={0.5} />
      <CustomSelect
        options={recommendedWalletSelectOptions}
        isClearable
        value={watchedrecommendedWalletId}
        onChange={setrecommendedWalletId}
        width="100px"
      />
    </>
  );
}
