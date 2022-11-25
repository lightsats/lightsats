import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { FiatPrice } from "components/FiatPrice";
import { Icon } from "components/Icon";
import { SatsPrice } from "components/SatsPrice";
import { useExchangeRates } from "hooks/useExchangeRates";
import {
  appName,
  FEE_PERCENT,
  MAX_TIP_SATS,
  MINIMUM_FEE_SATS,
  MIN_TIP_SATS,
} from "lib/constants";
import { getNativeLanguageName } from "lib/i18n/iso6391";
import { DEFAULT_LOCALE, locales } from "lib/i18n/locales";
import {
  calculateFee,
  getFiatAmount,
  getSatsAmount,
  getSymbolFromCurrencyWithFallback,
} from "lib/utils";
import React from "react";
import { Controller, useForm } from "react-hook-form";

export const ExpiryUnitValues = ["minutes", "hours", "days"] as const;
export type ExpiryUnit = typeof ExpiryUnitValues[number];
const expiryUnitSelectOptions: SelectOption[] = ExpiryUnitValues.map(
  (expiryUnit) => ({
    value: expiryUnit,
    label: expiryUnit,
  })
);
const tippeeLocaleSelectOptions: SelectOption[] = locales.map((locale) => ({
  value: locale,
  label: getNativeLanguageName(locale),
}));

export type TipFormData = {
  amount: number;
  amountString: string;
  currency: string;
  note: string | undefined;
  expiresIn: number;
  expiryUnit: ExpiryUnit;
  tippeeName: string | undefined;
  tippeeLocale: string;
};

export type TipFormSubmitData = TipFormData & { satsAmount: number };

type InputMethod = "fiat" | "sats";

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

type TipFormProps = {
  onSubmit(formData: TipFormSubmitData): Promise<void>;
  defaultValues?: Partial<TipFormData>;
  mode: "create" | "update";
};

export function TipForm({
  onSubmit: onSubmitProp,
  defaultValues = {
    amountString: "1",
    currency: "USD",
    expiresIn: 3,
    expiryUnit: "days",
    tippeeLocale: DEFAULT_LOCALE,
  },
  mode,
}: TipFormProps) {
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [inputMethod, setInputMethod] = React.useState<InputMethod>("fiat");
  const altInputMethod: InputMethod = inputMethod === "fiat" ? "sats" : "fiat";

  const { data: exchangeRates } = useExchangeRates();

  const { control, handleSubmit, watch, setValue, setFocus, register } =
    useForm<TipFormData>({
      defaultValues,
    });

  React.useEffect(() => {
    setFocus("amount");
  }, [setFocus]);

  const watchedAmountString = watch("amountString");
  const watchedAmount = watch("amount");
  const watchedCurrency = watch("currency");
  const watchedExpiryUnit = watch("expiryUnit");
  const watchedTippeeLocale = watch("tippeeLocale");
  const watchedExchangeRate = exchangeRates?.[watchedCurrency];
  const watchedAmountFee = watchedExchangeRate
    ? calculateFee(
        inputMethod === "fiat"
          ? getSatsAmount(watchedAmount, watchedExchangeRate)
          : watchedAmount
      )
    : 0;

  React.useEffect(() => {
    const parsedValue = parseFloat(watchedAmountString);
    if (!isNaN(parsedValue)) {
      setValue("amount", parsedValue);
    }
  }, [setValue, watchedAmountString]);

  const toggleInputMethod = React.useCallback(() => {
    if (watchedExchangeRate) {
      setInputMethod(inputMethod === "fiat" ? "sats" : "fiat");
      setValue(
        "amountString",
        (inputMethod === "fiat"
          ? getSatsAmount(watchedAmount, watchedExchangeRate)
          : Math.round(
              getFiatAmount(watchedAmount, watchedExchangeRate) * 100
            ) / 100
        ).toString()
      );
    }
  }, [watchedAmount, watchedExchangeRate, inputMethod, setValue]);

  const exchangeRateSelectOptions: SelectOption[] | undefined = React.useMemo(
    () =>
      exchangeRates
        ? Object.keys(exchangeRates).map((key) => ({
            value: key,
            label: key + " (" + getSymbolFromCurrencyWithFallback(key) + ")",
          }))
        : undefined,
    [exchangeRates]
  );

  const setDropdownSelectedCurrency = React.useCallback(
    (currency: string) => setValue("currency", currency),
    [setValue]
  );

  const setDropdownSelectedExpiryUnit = React.useCallback(
    (expiryUnit: ExpiryUnit) => setValue("expiryUnit", expiryUnit),
    [setValue]
  );

  const setDropdownSelectedTippeeLocale = React.useCallback(
    (locale: string) => {
      setValue("tippeeLocale", locale);
    },
    [setValue]
  );

  const onSubmit = React.useCallback(
    (data: TipFormData) => {
      if (!watchedExchangeRate) {
        throw new Error("Exchange rates not loaded");
      }
      if (isSubmitting) {
        throw new Error("Already submitting");
      }
      const satsAmount =
        inputMethod === "fiat"
          ? getSatsAmount(data.amount, watchedExchangeRate)
          : data.amount;

      if (mode === "create") {
        if (isNaN(satsAmount)) {
          throw new Error("Invalid tip amount");
        }
        if (satsAmount < MIN_TIP_SATS) {
          throw new Error("Tip amount is too small");
        }
        if (satsAmount > MAX_TIP_SATS) {
          throw new Error(
            "Tip amount is too large. Please use a value no more than " +
              MAX_TIP_SATS +
              " satoshis"
          );
        }
        if (Math.round(satsAmount) !== satsAmount) {
          throw new Error("sat amount must be a whole value");
        }
      }
      setSubmitting(true);
      (async () => {
        await onSubmitProp({ ...data, satsAmount });
        setSubmitting(false);
      })();
    },
    [watchedExchangeRate, isSubmitting, inputMethod, mode, onSubmitProp]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          {mode === "update" && (
            <>
              <Tooltip
                content={
                  <>
                    <Text>
                      {
                        "Improve the recipient's initial experience by choosing their main language and currency."
                      }
                    </Text>
                    <Spacer />
                    <Text>
                      {
                        "They probably don't know about Bitcoin or satoshis yet!"
                      }
                    </Text>
                  </>
                }
              >
                <Text>Recipient Language & Currency</Text>
              </Tooltip>
              <Spacer y={0.25} />
              <Row justify="space-between" align="flex-end">
                <CustomSelect
                  options={tippeeLocaleSelectOptions}
                  defaultValue={watchedTippeeLocale}
                  onChange={setDropdownSelectedTippeeLocale}
                  width="100px"
                />

                <Spacer x={0.5} />
                {exchangeRateSelectOptions && (
                  <CustomSelect
                    options={exchangeRateSelectOptions}
                    defaultValue={watchedCurrency}
                    onChange={setDropdownSelectedCurrency}
                    width="100px"
                  />
                )}
              </Row>
              <Spacer />
            </>
          )}

          {mode === "create" && (
            <>
              <Row justify="flex-start" align="center">
                <Tooltip
                  content={`How much would you like to tip the recipient?`}
                >
                  <Text>
                    Amount in{" "}
                    {inputMethod === "fiat" ? watchedCurrency : inputMethod}
                  </Text>
                </Tooltip>
                <Spacer x={0.5} />
                <Button size="xs" auto onClick={toggleInputMethod}>
                  Switch to{" "}
                  {altInputMethod === "fiat" ? watchedCurrency : altInputMethod}
                  &nbsp;
                  <Icon width={16} height={16}>
                    <ArrowsRightLeftIcon />
                  </Icon>
                </Button>
              </Row>
              <Spacer y={0.25} />
              <Row align="center" justify="space-between">
                <Controller
                  name="amountString"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      // {...register("amount", {
                      //   valueAsNumber: true,
                      // }) causes iOS decimal input bug, resetting field value }
                      min={0}
                      max={MAX_TIP_SATS}
                      step="0.01"
                      type="number"
                      inputMode="decimal"
                      aria-label="amount"
                      fullWidth
                      bordered
                      autoFocus
                    />
                  )}
                />
                <Spacer />
                {exchangeRateSelectOptions && (
                  <CustomSelect
                    options={exchangeRateSelectOptions}
                    defaultValue={watchedCurrency}
                    onChange={setDropdownSelectedCurrency}
                    width="100px"
                  />
                )}
              </Row>

              <Spacer y={1.5} />
              <Row justify="center" align="center">
                <Text b size={18}>
                  {inputMethod === "sats" ? (
                    <FiatPrice
                      currency={watchedCurrency}
                      exchangeRate={exchangeRates?.[watchedCurrency]}
                      sats={!isNaN(watchedAmount) ? watchedAmount : 0}
                    />
                  ) : (
                    <SatsPrice
                      exchangeRate={exchangeRates?.[watchedCurrency]}
                      fiat={!isNaN(watchedAmount) ? watchedAmount : 0}
                    />
                  )}
                </Text>
              </Row>
              {watchedExchangeRate ? (
                <Row justify="center" align="center">
                  <Tooltip
                    content={`The ${FEE_PERCENT}% (minimum ${MINIMUM_FEE_SATS} sats) fee covers outbound routing and ${appName} infrastructure costs`}
                  >
                    <Link css={{ width: "100%" }}>
                      <Text size="small" css={{ display: "flex" }}>
                        {"+"}
                        {!isNaN(watchedAmountFee) ? watchedAmountFee : 0}
                        {" sats / "}
                        &nbsp;
                        <FiatPrice
                          sats={!isNaN(watchedAmountFee) ? watchedAmountFee : 0}
                          currency={watchedCurrency}
                          exchangeRate={watchedExchangeRate}
                        />
                        &nbsp;fee
                      </Text>
                    </Link>
                  </Tooltip>
                </Row>
              ) : (
                <Loading color="currentColor" size="sm" />
              )}
            </>
          )}
          {mode === "update" && (
            <>
              <Spacer />
              <Controller
                name="tippeeName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Recipient name"
                    placeholder="Hal Finney"
                    maxLength={255}
                    fullWidth
                    bordered
                  />
                )}
              />
              <Spacer />
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Note to recipient"
                    placeholder="Thank you for your amazing service!"
                    maxLength={255}
                    fullWidth
                    bordered
                  />
                )}
              />
            </>
          )}
          <Spacer />
          <Row>
            <Tooltip
              content={`Incentivize the recipient to accept the tip before expiry. Expired tips can reclaimed.`}
            >
              <Text>Tip expires in</Text>
            </Tooltip>
          </Row>
          <Row gap={0} justify="space-between" align="flex-end">
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
                  width="200px"
                  type="number"
                  inputMode="decimal"
                  bordered
                  color="primary"
                />
              )}
            />

            <Spacer />
            <CustomSelect
              options={expiryUnitSelectOptions}
              defaultValue={watchedExpiryUnit}
              onChange={setDropdownSelectedExpiryUnit}
              width="100px"
            />
          </Row>
        </Card.Body>
      </Card>
      <Spacer y={2} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loading color="currentColor" size="sm" />
        ) : (
          <>{mode === "create" ? "Create tip" : "Update tip"}</>
        )}
      </Button>
    </form>
  );
}
