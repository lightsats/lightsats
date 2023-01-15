import { InformationCircleIcon } from "@heroicons/react/24/solid";
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  Loading,
  Row,
  Spacer,
  Switch,
  Text,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { Divider } from "components/Divider";
import { FiatPrice } from "components/FiatPrice";
import { Icon } from "components/Icon";
import { useExchangeRates } from "hooks/useExchangeRates";
import { useTips } from "hooks/useTips";
import {
  appName,
  FEE_PERCENT,
  MAX_TIP_GROUP_QUANTITY,
  MAX_TIP_SATS,
  MINIMUM_FEE_SATS,
  MIN_TIP_SATS,
  USE_PREV_TIP_PROPERTIES,
} from "lib/constants";
import { getNativeLanguageName } from "lib/i18n/iso6391";
import { locales } from "lib/i18n/locales";
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
const tippeeLocaleSelectOptions: SelectOption[] = locales.map((locale) => ({
  value: locale,
  label: getNativeLanguageName(locale),
}));

export type TipFormData = {
  amount: number;
  quantity: number;
  amountString: string;
  currency: string;
  note: string | undefined;
  expiresIn: number;
  expiryUnit: ExpiryUnit;
  tippeeName: string | undefined;
  tippeeLocale: string;
  skipOnboarding: boolean;
  enterIndividualNames: boolean;
  showAdvancedOptions: boolean;
};

export type TipFormSubmitData = Omit<
  TipFormData,
  "enterIndividualNames" | "showAdvancedOptions"
> & {
  satsAmount: number;
};

type InputMethod = "fiat" | "sats";

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "320px",
  maxWidth: "100%",
};

type TipFormProps = {
  onSubmit(formData: TipFormSubmitData): Promise<void>;
  defaultValues?: Partial<TipFormData>;
  mode: "create" | "update";
  quantity?: number;
};

export function TipForm({
  onSubmit: onSubmitProp,
  defaultValues = {
    quantity: 1,
    amountString: "1",
    currency: "USD",
    expiresIn: 21,
    expiryUnit: "days",
    tippeeLocale: undefined,
    enterIndividualNames: false,
    showAdvancedOptions: false,
  },
  mode,
  quantity = 1,
}: TipFormProps) {
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [inputMethod, setInputMethod] = React.useState<InputMethod>("fiat");
  const { data: tips } = useTips(
    USE_PREV_TIP_PROPERTIES ? "tipper" : undefined
  );
  const prevTip = React.useMemo(
    () => (mode === "update" ? tips?.[1] : tips?.[0]),
    [mode, tips]
  );

  const { data: exchangeRates } = useExchangeRates();

  const { control, handleSubmit, watch, setValue, setFocus, register } =
    useForm<TipFormData>({
      defaultValues,
    });

  React.useEffect(() => {
    setFocus("amount");
  }, [setFocus]);

  React.useEffect(() => {
    if (prevTip?.currency && mode === "create") {
      setValue("currency", prevTip.currency);
    }
    if (prevTip?.tippeeLocale && mode === "update") {
      setValue("tippeeLocale", prevTip.tippeeLocale);
    }
  }, [mode, prevTip, setValue]);

  const watchedAmountString = watch("amountString");
  const watchedAmount = watch("amount");
  let watchedQuantity = watch("quantity");
  if (isNaN(watchedQuantity)) {
    watchedQuantity = quantity;
  }
  const watchedCurrency = watch("currency");
  const watchedTippeeLocale = watch("tippeeLocale");
  const watchedTippeeName = watch("tippeeName");
  const watchedSkipOnboarding = watch("skipOnboarding");
  const watchedEnterIndividualNames = watch("enterIndividualNames");
  const watchedShowAdvancedOptions = watch("showAdvancedOptions");
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
      {mode === "create" && (
        <>
          <Card css={{ dropShadow: "$sm", w: "100%" }}>
            <Card.Body>
              <Row justify="space-between" align="center">
                <Col>Currency</Col>
                <Col>
                  {exchangeRateSelectOptions && (
                    <CustomSelect
                      options={exchangeRateSelectOptions}
                      value={watchedCurrency}
                      onChange={setDropdownSelectedCurrency}
                    />
                  )}
                </Col>
              </Row>
              <Divider />
              <Spacer />
              <Row>
                <Col>
                  Amount
                  <br />
                  <Text small css={{ position: "relative", top: "-5px" }}>
                    in {inputMethod === "fiat" ? watchedCurrency : inputMethod}
                  </Text>
                </Col>
                <Col>
                  <Row justify="flex-end">
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
                          step={inputMethod === "fiat" ? 0.01 : 1}
                          type="number"
                          inputMode="decimal"
                          aria-label="amount"
                          css={{ width: "160px" }}
                          size="lg"
                          fullWidth
                          bordered
                          autoFocus
                          contentLeft={
                            <Button
                              size="xs"
                              auto
                              css={{
                                px: "4px",
                              }}
                              onClick={toggleInputMethod}
                            >
                              <div style={{ width: "20px" }}>
                                {inputMethod === "fiat"
                                  ? getSymbolFromCurrencyWithFallback(
                                      watchedCurrency
                                    )
                                  : "⚡"}
                              </div>
                            </Button>
                          }
                        />
                      )}
                    />
                  </Row>
                </Col>
              </Row>
              <Spacer />
              <Row align="center">
                <Row align="center">
                  <Tooltip
                    placement="right"
                    content={`Create and print tips in bulk!`}
                  >
                    <Text>Quantity</Text>
                  </Tooltip>
                  <Spacer x={0.125} />
                  <Badge size="sm" color="warning">
                    BETA
                  </Badge>
                </Row>
                <Col>
                  <Row justify="flex-end">
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          {...register("quantity", {
                            valueAsNumber: true,
                          })}
                          min={1}
                          max={MAX_TIP_GROUP_QUANTITY}
                          step={1}
                          type="number"
                          inputMode="numeric"
                          aria-label="quantity"
                          css={{ width: "100px" }}
                          size="lg"
                          fullWidth
                          bordered
                          autoFocus
                        />
                      )}
                    />
                  </Row>
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col>
                  <Row>
                    Fees &nbsp;
                    <Tooltip
                      placement="right"
                      content={`The ${FEE_PERCENT}% (minimum ${MINIMUM_FEE_SATS} sats) fee covers outbound routing and ${appName} infrastructure costs`}
                    >
                      <Text color="primary">
                        <Icon width={16} height={16}>
                          <InformationCircleIcon />
                        </Icon>
                      </Text>
                    </Tooltip>
                  </Row>
                </Col>
                <Col css={{ ta: "right", alignItems: "flex-end", fd: "row" }}>
                  {watchedExchangeRate ? (
                    <>
                      <Text>
                        <FiatPrice
                          sats={
                            !isNaN(watchedAmountFee)
                              ? watchedAmountFee * watchedQuantity
                              : 0
                          }
                          currency={watchedCurrency}
                          exchangeRate={watchedExchangeRate}
                        />
                      </Text>
                      <Text small css={{ position: "relative", top: "-5px" }}>
                        {!isNaN(watchedAmountFee)
                          ? watchedAmountFee * watchedQuantity
                          : 0}
                        {" sats"}
                      </Text>
                    </>
                  ) : (
                    <Loading color="currentColor" size="sm" />
                  )}
                </Col>
              </Row>
              <Divider />
              {exchangeRates && watchedExchangeRate && (
                <Row>
                  <Col>
                    <Text b>Total</Text>
                  </Col>
                  <Col css={{ ta: "right" }}>
                    <Text css={{ fontWeight: "bold" }}>
                      <FiatPrice
                        currency={watchedCurrency}
                        exchangeRate={exchangeRates[watchedCurrency]}
                        sats={
                          !isNaN(watchedAmount)
                            ? ((inputMethod === "fiat"
                                ? getSatsAmount(
                                    watchedAmount,
                                    watchedExchangeRate
                                  )
                                : watchedAmount) +
                                watchedAmountFee) *
                              watchedQuantity
                            : 0
                        }
                      />
                    </Text>
                    <Text small css={{ position: "relative", top: "-5px" }}>
                      {((inputMethod === "sats"
                        ? watchedAmount
                        : getSatsAmount(watchedAmount, watchedExchangeRate)) +
                        watchedAmountFee) *
                        watchedQuantity}{" "}
                      sats
                    </Text>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
          <Spacer />
        </>
      )}

      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          {mode === "create" && (
            <Row align="center" justify="space-between">
              <Text>Advanced Options</Text>
              <Switch
                checked={watchedShowAdvancedOptions}
                onChange={(e) =>
                  setValue("showAdvancedOptions", e.target.checked)
                }
              />
            </Row>
          )}

          {watchedShowAdvancedOptions && (
            <>
              {mode === "create" && <Spacer />}
              <Row align="flex-start">
                <Col>
                  <Text>⌛ Tip expiry</Text>
                  <Text
                    small
                    css={{ mt: 6, lineHeight: 1.2, display: "inline-block" }}
                  >
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
                css={{ mt: 0, mb: 6, lineHeight: 1.2, display: "inline-block" }}
              >
                Allow your recipient to directly withraw without logging in.
              </Text>
              <Divider />
              <Controller
                name="tippeeName"
                control={control}
                render={({ field }) =>
                  watchedQuantity > 1 ? (
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
                          &nbsp;/&nbsp;{watchedQuantity} names
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
                        rows={
                          watchedEnterIndividualNames
                            ? watchedQuantity
                            : undefined
                        }
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
                    label={
                      watchedQuantity > 1
                        ? "Note to recipients"
                        : "Note to recipient"
                    }
                    placeholder={
                      watchedQuantity > 1
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
                onChange={setDropdownSelectedTippeeLocale}
                width="100px"
              />
            </>
          )}
        </Card.Body>
      </Card>
      <Spacer />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loading color="currentColor" size="sm" />
        ) : (
          <>
            {watchedQuantity > 1
              ? mode === "create"
                ? "Create tips"
                : "Update tips"
              : mode === "create"
              ? "Create tip"
              : "Update tip"}
          </>
        )}
      </Button>
    </form>
  );
}
