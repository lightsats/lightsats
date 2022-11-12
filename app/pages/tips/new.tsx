import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Container,
  Dropdown,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { Icon } from "components/Icon";
import { SatsPrice } from "components/SatsPrice";
import { add } from "date-fns";
import {
  appName,
  FEE_PERCENT,
  MINIMUM_FEE_SATS,
  MIN_TIP_SATS,
} from "lib/constants";
import { getNativeLanguageName } from "lib/i18n/iso6391";
import { DEFAULT_LOCALE, locales } from "lib/i18n/locales";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { calculateFee, getFiatAmount, getSatsAmount } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";
import { CreateTipRequest } from "types/CreateTipRequest";
import { ExchangeRates } from "types/ExchangeRates";

export const ExpiryUnitValues = ["minutes", "hours", "days"] as const;
export type ExpiryUnit = typeof ExpiryUnitValues[number];

type NewTipFormData = {
  amount: number;
  amountString: string;
  currency: string;
  note: string;
  expiresIn: number;
  expiryUnit: ExpiryUnit;
  tippeeName: string;
  tippeeLocale: string;
};

type InputMethod = "fiat" | "sats";

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const NewTip: NextPage = () => {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [inputMethod, setInputMethod] = React.useState<InputMethod>("fiat");
  const altInputMethod: InputMethod = inputMethod === "fiat" ? "sats" : "fiat";

  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  const { control, handleSubmit, watch, setValue, setFocus, register } =
    useForm<NewTipFormData>({
      defaultValues: {
        amountString: "1",
        currency: "USD",
        expiresIn: 3,
        expiryUnit: "days",
        tippeeLocale: DEFAULT_LOCALE,
      },
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

  const exchangeRateKeys = React.useMemo(
    () => (exchangeRates ? Object.keys(exchangeRates) : undefined),
    [exchangeRates]
  );

  const setDropdownSelectedCurrency = React.useCallback(
    (keys: unknown) =>
      setValue("currency", Array.from(keys as Iterable<string>)[0]),
    [setValue]
  );

  const selectedCurrencies = React.useMemo(
    () => new Set([watchedCurrency]),
    [watchedCurrency]
  );

  const setDropdownSelectedExpiryUnit = React.useCallback(
    (keys: unknown) =>
      setValue("expiryUnit", Array.from(keys as Iterable<ExpiryUnit>)[0]),
    [setValue]
  );

  const selectedExpiryUnits = React.useMemo(
    () => new Set([watchedExpiryUnit]),
    [watchedExpiryUnit]
  );

  const setDropdownTippeeLocale = React.useCallback(
    (keys: unknown) => {
      setValue("tippeeLocale", Array.from(keys as Iterable<string>)[0]);
    },
    [setValue]
  );

  const selectedTippeeLocales = React.useMemo(
    () => new Set([watchedTippeeLocale]),
    [watchedTippeeLocale]
  );

  const onSubmit = React.useCallback(
    (data: NewTipFormData) => {
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
      if (isNaN(satsAmount)) {
        throw new Error("Invalid tip amount");
      }
      if (satsAmount < MIN_TIP_SATS) {
        throw new Error("Tip amount is too small");
      }
      if (Math.round(satsAmount) !== satsAmount) {
        throw new Error("sat amount must be a whole value");
      }
      setSubmitting(true);

      (async () => {
        try {
          const createTipRequest: CreateTipRequest = {
            amount: satsAmount,
            currency: data.currency,
            note: data.note?.length ? data.note : undefined,
            expiry: add(new Date(), {
              [data.expiryUnit]: data.expiresIn,
            }),
            tippeeName: data.tippeeName?.length ? data.tippeeName : undefined,
            tippeeLocale: data.tippeeLocale,
          };
          const result = await fetch("/api/tipper/tips", {
            method: "POST",
            body: JSON.stringify(createTipRequest),
            headers: { "Content-Type": "application/json" },
          });
          if (result.ok) {
            toast.success("Tip created");
            const tip = (await result.json()) as Tip;
            // TODO: save the tip in SWR's cache so it is immediately available
            router.push(`${Routes.tips}/${tip.id}`);
          } else {
            toast.error("Failed to create tip: " + result.statusText);
          }
        } catch (error) {
          console.error(error);
          toast.error("Tip creation failed. Please try again.");
        }
        setSubmitting(false);
      })();
    },
    [watchedExchangeRate, inputMethod, isSubmitting, router]
  );

  return (
    <>
      <Text>
        {"Let's"} start by creating your tip. The goal is to onboard the
        recipient to Bitcoin, so aim to fill out all the fields in order to
        increase the authenticity of your tip and improve your {"recipient's"}{" "}
        initial impression.
      </Text>
      <Spacer />
      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
        <Container gap={0} style={{ width: "100%" }}>
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
                  {"They probably don't know about Bitcoin or satoshis yet!"}
                </Text>
              </>
            }
          >
            <Text>Recipient Language & Currency</Text>
          </Tooltip>
          <Spacer y={0.25} />
          <Row justify="space-between" align="flex-end">
            <Dropdown>
              <Dropdown.Button flat>
                {getNativeLanguageName(watchedTippeeLocale)}
              </Dropdown.Button>
              <Dropdown.Menu
                aria-label="Select Language"
                selectionMode="single"
                selectedKeys={selectedTippeeLocales}
                onSelectionChange={setDropdownTippeeLocale}
              >
                {locales.map((locale) => (
                  <Dropdown.Item key={locale}>
                    {locale.toUpperCase()}&nbsp;|&nbsp;
                    {getNativeLanguageName(locale)}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Spacer x={0.5} />
            <Dropdown>
              <Dropdown.Button flat>{watchedCurrency}</Dropdown.Button>

              <Dropdown.Menu
                aria-label="Select Currency"
                selectionMode="single"
                selectedKeys={selectedCurrencies}
                onSelectionChange={setDropdownSelectedCurrency}
              >
                {exchangeRateKeys
                  ? exchangeRateKeys.map((key) => (
                      <Dropdown.Item key={key}>{key}</Dropdown.Item>
                    ))
                  : []}
              </Dropdown.Menu>
            </Dropdown>
          </Row>
          <Spacer />
          <Row justify="flex-start" align="center">
            <Tooltip content={`How much would you like to tip the recipient?`}>
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
          <Row>
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
                  step="0.01"
                  type="number"
                  inputMode="decimal"
                  aria-label="amount"
                  fullWidth
                  bordered
                />
              )}
            />
          </Row>
        </Container>
        <Spacer />
        <Row justify="center" align="center">
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
        </Row>
        {watchedExchangeRate ? (
          <Row justify="center" align="center">
            <Tooltip
              content={`The ${FEE_PERCENT}% (minimum ${MINIMUM_FEE_SATS} sats) fee covers outbound routing and ${appName} infrastructure costs`}
            >
              <Link>
                <Text size="small">
                  {"+"}
                  {!isNaN(watchedAmountFee) ? watchedAmountFee : 0}
                  {" sats / "}
                  <FiatPrice
                    sats={!isNaN(watchedAmountFee) ? watchedAmountFee : 0}
                    currency={watchedCurrency}
                    exchangeRate={watchedExchangeRate}
                  />
                  {" fee"}
                </Text>
              </Link>
            </Tooltip>
          </Row>
        ) : (
          <Loading type="spinner" color="currentColor" size="sm" />
        )}
        <Spacer />
        <Controller
          name="tippeeName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Recipient name (optional)"
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
              label="Note to recipient (optional)"
              placeholder="Thank you for your amazing service!"
              maxLength={255}
              fullWidth
              bordered
            />
          )}
        />
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
                width="100px"
                type="number"
                inputMode="decimal"
                bordered
                color="primary"
              />
            )}
          />

          <Spacer />
          <Dropdown>
            <Dropdown.Button flat>{watchedExpiryUnit}</Dropdown.Button>
            <Dropdown.Menu
              aria-label="Select Expiry Unit"
              selectionMode="single"
              selectedKeys={selectedExpiryUnits}
              onSelectionChange={setDropdownSelectedExpiryUnit}
            >
              {ExpiryUnitValues.map((value) => (
                <Dropdown.Item key={value}>{value}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Row>
        <Spacer y={2} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loading type="points" color="currentColor" size="sm" />
          ) : (
            <>Create Tip</>
          )}
        </Button>
        <Spacer />
      </form>
      <BackButton />
    </>
  );
};

export default NewTip;
