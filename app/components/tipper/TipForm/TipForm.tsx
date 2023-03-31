import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Col,
  Collapse,
  Input,
  Loading,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { Divider } from "components/Divider";
import { FiatPrice } from "components/FiatPrice";
import { FlexBox } from "components/FlexBox";
import { Icon } from "components/Icon";
import { TipFormAdvancedOptions } from "components/tipper/TipForm/TipFormAdvancedOptions";
import {
  TipFormData,
  TipFormSubmitData,
} from "components/tipper/TipForm/TipFormData";
import { useExchangeRates } from "hooks/useExchangeRates";
import { useTips } from "hooks/useTips";
import {
  appName,
  DEFAULT_TIP_PASSPHRASE_LENGTH,
  FEE_PERCENT,
  MAX_TIP_GROUP_QUANTITY,
  MAX_TIP_SATS,
  MINIMUM_FEE_SATS,
  MIN_TIP_SATS,
  USE_PREV_TIP_PROPERTIES,
} from "lib/constants";
import {
  calculateFee,
  getFiatAmount,
  getSatsAmount,
  getSymbolFromCurrencyWithFallback,
} from "lib/utils";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

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
    anonymousTipper: false,
    passphraseLength: DEFAULT_TIP_PASSPHRASE_LENGTH,
    inputMethod: "fiat",
    onboardingFlow: "DEFAULT",
  },
  mode,
  quantity = 1,
}: TipFormProps) {
  const [isSubmitting, setSubmitting] = React.useState(false);
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
  const watchedInputMethod = watch("inputMethod");
  const watchedCurrency = watch("currency");
  const watchedShowAdvancedOptions = watch("showAdvancedOptions");
  const watchedExchangeRate = exchangeRates?.[watchedCurrency];
  const watchedAmountInSats =
    watchedInputMethod === "fiat" && watchedExchangeRate
      ? getSatsAmount(watchedAmount, watchedExchangeRate)
      : watchedAmount;
  const watchedFeeInSats = watchedExchangeRate
    ? calculateFee(watchedAmountInSats)
    : 0;

  React.useEffect(() => {
    const parsedValue = parseFloat(watchedAmountString);
    if (!isNaN(parsedValue)) {
      setValue("amount", parsedValue);
    }
  }, [setValue, watchedAmountString]);

  const toggleInputMethod = React.useCallback(() => {
    if (watchedExchangeRate) {
      setValue("inputMethod", watchedInputMethod === "fiat" ? "sats" : "fiat");
      setValue(
        "amountString",
        (watchedInputMethod === "fiat"
          ? getSatsAmount(watchedAmount, watchedExchangeRate)
          : Math.round(
              getFiatAmount(watchedAmount, watchedExchangeRate) * 100
            ) / 100
        ).toString()
      );
    }
  }, [watchedAmount, watchedExchangeRate, watchedInputMethod, setValue]);

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

  const onSubmit = React.useCallback(
    (data: TipFormData) => {
      let satsAmount = 0;
      try {
        if (!watchedExchangeRate) {
          throw new Error("Exchange rates not loaded");
        }
        if (isSubmitting) {
          throw new Error("Already submitting");
        }
        satsAmount =
          watchedInputMethod === "fiat"
            ? getSatsAmount(data.amount, watchedExchangeRate)
            : data.amount;

        if (mode === "create") {
          if (isNaN(satsAmount)) {
            throw new Error("Invalid tip amount");
          }
          if (isNaN(data.quantity) || data.quantity < 1) {
            throw new Error("Invalid tip quantity");
          }
          if (satsAmount < MIN_TIP_SATS) {
            throw new Error("Tip amount is too small");
          }
          if (
            (satsAmount + calculateFee(satsAmount)) * data.quantity >
            MAX_TIP_SATS
          ) {
            throw new Error(
              "The total amount must not exceed " + MAX_TIP_SATS + " satoshis"
            );
          }
          if (Math.round(satsAmount) !== satsAmount) {
            throw new Error("sat amount must be a whole value");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error((error as Error).message);
        return;
      }
      setSubmitting(true);
      (async () => {
        await onSubmitProp({ ...data, satsAmount });
        setSubmitting(false);
      })();
    },
    [watchedExchangeRate, isSubmitting, watchedInputMethod, mode, onSubmitProp]
  );

  const advancedOptions = watchedShowAdvancedOptions && (
    <TipFormAdvancedOptions
      mode={mode}
      register={register}
      control={control}
      setValue={setValue}
      watch={watch}
      quantity={watchedQuantity}
      satsAmount={watchedAmountInSats}
    />
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
                    in{" "}
                    {watchedInputMethod === "fiat"
                      ? watchedCurrency
                      : watchedInputMethod}
                  </Text>
                </Col>
                <Col>
                  <Row justify="flex-end" align="center" css={{ gap: "$5" }}>
                    <FlexBox
                      style={{
                        flexDirection: "row",
                        gap: "5px",
                        overflow: "visible",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "36px",
                          position: "absolute",
                          border: "1px solid black",
                          background: "rgba(0,0,0, 0.2)",
                          borderRadius: "50%",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: -1,
                        }}
                      >
                        <Icon
                          width={12}
                          height={12}
                          color="black"
                          style={{
                            position: "absolute",
                            top: -6,
                            left: 8,
                            rotate: "-15deg",
                          }}
                        >
                          <ChevronRightIcon />
                        </Icon>
                        <Icon
                          width={12}
                          height={12}
                          color="black"
                          style={{
                            position: "absolute",
                            bottom: -6,
                            right: 8,
                            rotate: "-15deg",
                          }}
                        >
                          <ChevronLeftIcon />
                        </Icon>
                      </div>
                      <Button
                        size="xs"
                        auto
                        css={{
                          px: "4px",
                          position: "relative",
                          background:
                            watchedInputMethod !== "sats"
                              ? "$accents1"
                              : undefined,
                          border: "1px solid black",
                        }}
                        onClick={toggleInputMethod}
                      >
                        <div style={{ width: "16px" }}>{"⚡"}</div>
                      </Button>
                      <Button
                        size="xs"
                        auto
                        css={{
                          px: "4px",
                          position: "relative",
                          background:
                            watchedInputMethod !== "fiat"
                              ? "$accents1"
                              : undefined,
                          color:
                            watchedInputMethod !== "fiat"
                              ? "$accents8"
                              : undefined,
                          border: "1px solid black",
                        }}
                        onClick={toggleInputMethod}
                      >
                        <div style={{ width: "16px" }}>
                          {getSymbolFromCurrencyWithFallback(watchedCurrency)}
                        </div>
                      </Button>
                    </FlexBox>
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
                          step={watchedInputMethod === "fiat" ? 0.01 : 1}
                          type="number"
                          inputMode="decimal"
                          aria-label="amount"
                          css={{ width: "160px" }}
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
              <Spacer />
              <Row align="center">
                <Row align="center">
                  <Tooltip
                    placement="right"
                    content={`Create and print tips in bulk!`}
                  >
                    <Text>Quantity</Text>
                  </Tooltip>
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
                            !isNaN(watchedFeeInSats)
                              ? watchedFeeInSats * watchedQuantity
                              : 0
                          }
                          currency={watchedCurrency}
                          exchangeRate={watchedExchangeRate}
                        />
                      </Text>
                      <Text small css={{ position: "relative", top: "-5px" }}>
                        {!isNaN(watchedFeeInSats)
                          ? watchedFeeInSats * watchedQuantity
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
                            ? ((watchedInputMethod === "fiat"
                                ? getSatsAmount(
                                    watchedAmount,
                                    watchedExchangeRate
                                  )
                                : watchedAmount) +
                                watchedFeeInSats) *
                              watchedQuantity
                            : 0
                        }
                      />
                    </Text>
                    <Text small css={{ position: "relative", top: "-5px" }}>
                      {((watchedInputMethod === "sats"
                        ? watchedAmount
                        : getSatsAmount(watchedAmount, watchedExchangeRate)) +
                        watchedFeeInSats) *
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

      {mode === "create" ? (
        <Collapse
          css={{
            width: "100%",
            dropShadow: "$sm",
            border: "none",
            px: "$10",
            ":last-child": {
              overflow: "visible", // fix nextui collapse content getting cut off
            },
          }}
          title={<Text>Advanced Options</Text>}
          expanded={watchedShowAdvancedOptions}
          onChange={(_, __, value) => setValue("showAdvancedOptions", !!value)}
          shadow
        >
          {advancedOptions}
        </Collapse>
      ) : (
        <Card css={{ dropShadow: "$sm" }}>
          <Card.Body>{advancedOptions}</Card.Body>
        </Card>
      )}
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
