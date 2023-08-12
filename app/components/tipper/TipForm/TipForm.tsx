import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  Badge,
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
import { TipType } from "@prisma/client";
import { Alert } from "components/Alert";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { Divider } from "components/Divider";
import { FlexBox } from "components/FlexBox";
import { Icon } from "components/Icon";
import { HiddenWallets } from "components/tipper/TipForm/HiddenWallets";
import {
  InputMethod,
  TipFormData,
  TipFormSubmitData,
  TipTier,
} from "components/tipper/TipForm/TipFormData";
import { useRecommendedWalletSelectOptions } from "components/tipper/TipForm/useRecommendedWalletSelectOptions";
import { useExchangeRates } from "hooks/useExchangeRates";
import { useTips } from "hooks/useTips";
import {
  DEFAULT_TIP_PASSPHRASE_LENGTH,
  FEE_PERCENT,
  MAX_TIP_GROUP_QUANTITY,
  MAX_TIP_SATS,
  MINIMUM_FEE_SATS,
  //MIN_TIP_SATS,
  USE_PREV_TIP_PROPERTIES,
  appName,
} from "lib/constants";
import { wallets } from "lib/items/wallets";
import { getSymbolFromCurrencyWithFallback } from "lib/utils";
import React from "react";
import {
  Control,
  Controller,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  useForm,
} from "react-hook-form";
//import { toast } from "react-hot-toast";

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
    tiers: [
      {
        quantity: 1,
        amountString: "1",
        amount: 1,
      },
    ],
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
}: //quantity = 1,
TipFormProps) {
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
    setFocus("tiers.0.amount");
  }, [setFocus]);

  React.useEffect(() => {
    if (prevTip?.currency && mode === "create") {
      setValue("currency", prevTip.currency);
    }
    if (prevTip?.tippeeLocale && mode === "update") {
      setValue("tippeeLocale", prevTip.tippeeLocale);
    }
  }, [mode, prevTip, setValue]);

  const watchedTipType = watch("type");
  const watchedTiers = watch("tiers");

  // FIXME: quantity
  //quantity = quantity || watchedTiers.map(t => t.quantity).reduce((a,b) => a + b, 0)

  const watchedInputMethod = watch("inputMethod");
  const watchedCurrency = watch("currency");
  const watchedShowAdvancedOptions = watch("showAdvancedOptions");
  const watchedExchangeRate = exchangeRates?.[watchedCurrency];
  const watchedAmountInSats = 0; /*
    watchedInputMethod === "fiat" && watchedExchangeRate
      ? getSatsAmount(watchedAmount, watchedExchangeRate)
      : watchedAmount;*/
  const watchedFeeInSats = 0; /*
    watchedExchangeRate && watchedTipType !== "NON_CUSTODIAL_NWC"
      ? calculateFee(watchedAmountInSats)
      : 0;*/

  /*React.useEffect(() => {
    if (watchedTipType === "NON_CUSTODIAL_NWC") {
      throw new Error("FIXME");
      setValue("quantity", 1);
    }
  }, [setValue, watchedTipType]);*/

  // const toggleInputMethod = React.useCallback(() => {
  //   if (watchedExchangeRate) {
  //     setValue("inputMethod", watchedInputMethod === "fiat" ? "sats" : "fiat");
  //     setValue(
  //       "amountString",
  //       (watchedInputMethod === "fiat"
  //         ? getSatsAmount(watchedAmount, watchedExchangeRate)
  //         : Math.round(
  //             getFiatAmount(watchedAmount, watchedExchangeRate) * 100
  //           ) / 100
  //       ).toString()
  //     );
  //     throw new Error("FIXME");
  //   }
  // }, [watchedAmount, watchedExchangeRate, watchedInputMethod, setValue]);

  React.useEffect(() => {
    // automatically change to enter in sats if the user selects "BTC" as the fiat currency
    // normally we are onboarding users who only use fiat, but for this special case it's
    // difficult to enter the amount in BTC.
    if (watchedCurrency === "BTC") {
      setValue("inputMethod", "sats");
    }
  }, [setValue, watchedCurrency]);

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

  const watchedOnboardingFlow = watch("onboardingFlow");
  const recommendedWalletSelectOptions = useRecommendedWalletSelectOptions(
    watchedAmountInSats,
    watchedOnboardingFlow
  );

  const onSubmit = () => {
    throw new Error("FIXME");
  }; /*React.useCallback(
    (data: TipFormData) => {
      let satsAmount = 0;
      try {
        if (!!data.advertisementImageUrl !== !!data.advertisementUrl) {
          throw new Error(
            "Both advertisement options must be provided, or neither"
          );
        }
        if (!watchedExchangeRate) {
          throw new Error("Exchange rates not loaded");
        }
        if (isSubmitting) {
          throw new Error("Already submitting");
        }
        throw new Error("FIXME");
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
  );*/

  const advancedOptions = /*watchedShowAdvancedOptions && (
    <TipFormAdvancedOptions
      mode={mode}
      register={register}
      control={control}
      setValue={setValue}
      watch={watch}
      quantity={watchedQuantity}
      satsAmount={watchedAmountInSats}
    />
  );*/ null;

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
              {watchedTiers.map((_, index) => (
                <TierCard
                  key={index}
                  index={index}
                  control={control}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  watchedTiers={watchedTiers}
                  //toggleInputMethod={toggleInputMethod}
                  toggleInputMethod={() => alert("FIXME")}
                  watchedCurrency={watchedCurrency}
                  watchedInputMethod={watchedInputMethod}
                  watchedTipType={watchedTipType}
                />
              ))}
              {watchedTipType !== "NON_CUSTODIAL_NWC" && (
                <>
                  <Row justify="space-between" align="flex-end">
                    <Row align="flex-end">
                      <Text>Add Tier</Text>
                      <Spacer x={0.25} />
                      <Badge color="warning">BETA</Badge>
                    </Row>
                    <Spacer x={0.5} />

                    <Button
                      onClick={() =>
                        setValue("tiers", [
                          ...watchedTiers,
                          { amount: 1, amountString: "1", quantity: 1 },
                        ])
                      }
                      auto
                      size="sm"
                    >
                      +
                    </Button>
                  </Row>
                </>
              )}
              <Divider />
              <Row>
                <Col>
                  <Row>
                    Fees &nbsp;
                    <Tooltip
                      placement="right"
                      content={
                        watchedTipType !== "NON_CUSTODIAL_NWC"
                          ? `The ${FEE_PERCENT}% (minimum ${MINIMUM_FEE_SATS} sats) fee covers outbound routing and ${appName} infrastructure costs`
                          : "Only pay routing fees for non-custodial tips 💥"
                      }
                    >
                      <Text color="primary">
                        <Icon width={16} height={16}>
                          <InformationCircleIcon />
                        </Icon>
                      </Text>
                    </Tooltip>
                  </Row>
                </Col>
                {/*<Col css={{ ta: "right", alignItems: "flex-end", fd: "row" }}>
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
                  </Col>*/}
              </Row>
              <Divider />
              {exchangeRates && watchedExchangeRate && (
                <Row>
                  {/*<Col>
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
                      </Col>*/}
                </Row>
              )}
            </Card.Body>
          </Card>
          <Spacer />
        </>
      )}

      {mode === "create" ? (
        <>
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
            onChange={(_, __, value) =>
              setValue("showAdvancedOptions", !!value)
            }
            shadow
          >
            {advancedOptions}
          </Collapse>
          {recommendedWalletSelectOptions.length < wallets.length && (
            <>
              <Spacer />
              <Row>
                <Alert>
                  <HiddenWallets
                    recommendedWalletSelectOptions={
                      recommendedWalletSelectOptions
                    }
                  />
                </Alert>
              </Row>
            </>
          )}
        </>
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
            {
              /*watchedQuantity > 1
              ? mode === "create"
                ? "Create tips"
                : "Update tips"
              : mode === "create"
              ? "Create tip"
        : "Update tip"*/ "FIXME"
            }
          </>
        )}
      </Button>
    </form>
  );
}

type TierCardProps = {
  index: number;
  control: Control<TipFormData, unknown>;
  register: UseFormRegister<TipFormData>;
  watch: UseFormWatch<TipFormData>;
  setValue: UseFormSetValue<TipFormData>;
  watchedInputMethod: InputMethod;
  watchedCurrency: string;
  watchedTipType: TipType | undefined;
  watchedTiers: TipTier[];
  toggleInputMethod(): void;
};

function TierCard({
  index,
  control,
  register,
  watch,
  setValue,
  watchedInputMethod,
  watchedCurrency,
  toggleInputMethod,
  watchedTipType,
  watchedTiers,
}: TierCardProps) {
  const amountFieldName = `tiers.${index}.amount` as const;
  const amountStringFieldName = `tiers.${index}.amountString` as const;
  const quantityFieldName = `tiers.${index}.quantity` as const;

  const watchedAmountString = watch(amountStringFieldName);
  //const watchedAmount = watch(amountFieldName);
  let watchedQuantity = watch(quantityFieldName);
  if (isNaN(watchedQuantity)) {
    watchedQuantity = 1;
  }
  React.useEffect(() => {
    const parsedValue = parseFloat(watchedAmountString);
    if (!isNaN(parsedValue)) {
      setValue(amountFieldName, parsedValue);
    }
  }, [amountFieldName, setValue, watchedAmountString]);
  return (
    <>
      <Divider />
      <Row justify="space-between">
        <Text size="small">Tier {index + 1}</Text>
        {index > 0 && (
          <Button
            auto
            size="xs"
            color="error"
            onClick={() => {
              const newTiers: TipTier[] = [];
              for (let i = 0; i < watchedTiers.length; i++) {
                if (i !== index) {
                  newTiers.push(watchedTiers[i]);
                }
              }
              setValue("tiers", newTiers);
            }}
          >
            -
          </Button>
        )}
      </Row>
      <Spacer y={0.5} />
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
                    watchedInputMethod !== "sats" ? "$accents1" : undefined,
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
                    watchedInputMethod !== "fiat" ? "$accents1" : undefined,
                  color:
                    watchedInputMethod !== "fiat" ? "$accents8" : undefined,
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
              name={amountFieldName}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  // {...register(amountFieldName, {
                  //   valueAsNumber: true,
                  // }) causes iOS decimal input bug, resetting field value }
                  min={0}
                  max={MAX_TIP_SATS}
                  step={
                    watchedInputMethod === "fiat"
                      ? watchedCurrency === "BTC"
                        ? 0.00000001
                        : 0.01
                      : 1
                  }
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
          <Tooltip placement="right" content={`Create and print tips in bulk!`}>
            <Text>Quantity</Text>
          </Tooltip>
        </Row>
        <Col>
          <Row justify="flex-end">
            <Controller
              name={quantityFieldName}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  {...register(quantityFieldName, {
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
                  disabled={watchedTipType === "NON_CUSTODIAL_NWC"}
                />
              )}
            />
          </Row>
        </Col>
      </Row>
      {watchedTipType === "NON_CUSTODIAL_NWC" && (
        <>
          <Spacer y={0.5} />
          <Row>
            <Text size="small" css={{ color: "$accents7" }}>
              Currently non-custodial only supports single tips
            </Text>
          </Row>
        </>
      )}
      <Spacer />
    </>
  );
}
