import { ForwardIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
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
    tippeeLocale: DEFAULT_LOCALE,
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
    watchedQuantity = 1;
  }
  const watchedCurrency = watch("currency");
  const watchedTippeeLocale = watch("tippeeLocale");
  const watchedSkipOnboarding = watch("skipOnboarding");
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
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          {mode === "create" && (
            <>
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
            </>
          )}

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
                  value={watchedTippeeLocale}
                  onChange={setDropdownSelectedTippeeLocale}
                  width="100px"
                />

                <Spacer x={0.5} />
                {exchangeRateSelectOptions && (
                  <CustomSelect
                    options={exchangeRateSelectOptions}
                    value={watchedCurrency}
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
            </>
          )}
          {mode === "update" && (
            <>
              <Controller
                name="tippeeName"
                control={control}
                render={({ field }) =>
                  quantity > 1 ? (
                    <Textarea
                      {...field}
                      label={"Recipient names (one per line)"}
                      placeholder={`Hal Finney
Micheal Saylor`}
                      fullWidth
                      bordered
                      rows={quantity}
                    />
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
                      quantity > 1 ? "Note to recipients" : "Note to recipient"
                    }
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
            </>
          )}
        </Card.Body>
      </Card>
      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          <Row align="center">
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
          <Row
            align="center"
            justify="center"
            css={{
              background: watchedSkipOnboarding ? "$warningShadow" : undefined,
              p: "$10",
              borderRadius: "$lg",
            }}
          >
            <Icon>
              <ForwardIcon />
            </Icon>
            <Spacer x={0.5} />
            <Text weight="medium">Skip Onboarding</Text>
            <Spacer x={0.5} />
            <Tooltip
              placement="top"
              content={
                <Col>
                  <Row justify="center">
                    <Text>
                      Check this if your recipient already knows about Bitcoin
                      and already has a wallet.
                    </Text>
                  </Row>
                  <Row justify="center">
                    <Text>
                      They will be linked directly to the withdrawal page
                      without needing to authenticate first.
                    </Text>
                  </Row>
                </Col>
              }
            >
              <Text color="primary">
                <Icon
                  width={16}
                  height={16}
                  color={watchedSkipOnboarding ? "white" : undefined}
                >
                  <InformationCircleIcon />
                </Icon>
              </Text>
            </Tooltip>

            <Spacer />
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
          </Row>
        </Card.Body>
      </Card>
      <Spacer y={2} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loading color="currentColor" size="sm" />
        ) : (
          <>
            {quantity > 1 || watchedQuantity > 1
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
