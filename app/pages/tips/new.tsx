import {
  Button,
  Dropdown,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
  Textarea,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { SatsPrice } from "components/SatsPrice";
import { MIN_TIP_SATS } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getFiatAmount, getSatsAmount } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import { CreateTipRequest } from "types/CreateTipRequest";
import { ExchangeRates } from "types/ExchangeRates";

type NewTipFormData = {
  amount: number;
  currency: string;
  note: string;
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const NewTip: NextPage = () => {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [inputMethod, setInputMethod] = React.useState<"fiat" | "sats">("fiat");

  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  const { control, handleSubmit, watch, setValue, setFocus, register } =
    useForm<NewTipFormData>({
      defaultValues: {
        amount: 1,
        currency: "USD",
      },
    });

  React.useEffect(() => {
    setFocus("amount");
  }, [setFocus]);

  const watchedAmount = watch("amount");
  const watchedCurrency = watch("currency");

  const currentExchangeRate = exchangeRates?.[watchedCurrency];

  const toggleInputMethod = React.useCallback(() => {
    if (currentExchangeRate) {
      setInputMethod(inputMethod === "fiat" ? "sats" : "fiat");
      setValue(
        "amount",
        inputMethod === "fiat"
          ? getSatsAmount(watchedAmount, currentExchangeRate)
          : Math.round(
              getFiatAmount(watchedAmount, currentExchangeRate) * 100
            ) / 100
      );
    }
  }, [watchedAmount, currentExchangeRate, inputMethod, setValue]);

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

  const onSubmit = React.useCallback(
    (data: NewTipFormData) => {
      if (!currentExchangeRate) {
        throw new Error("Exchange rates not loaded");
      }
      if (isSubmitting) {
        throw new Error("Already submitting");
      }
      const satsAmount =
        inputMethod === "fiat"
          ? getSatsAmount(data.amount, currentExchangeRate)
          : data.amount;
      if (satsAmount < MIN_TIP_SATS) {
        throw new Error("Tip amount is too small");
      }
      setSubmitting(true);

      (async () => {
        try {
          const createTipRequest: CreateTipRequest = {
            amount: satsAmount,
            currency: data.currency,
            note: data.note?.length ? data.note : undefined,
          };
          const result = await fetch("/api/tipper/tips", {
            method: "POST",
            body: JSON.stringify(createTipRequest),
            headers: { "Content-Type": "application/json" },
          });
          if (result.ok) {
            const tip = (await result.json()) as Tip;
            // TODO: save the tip in SWR's cache so it is immediately available
            router.push(`${Routes.tips}/${tip.id}`);
          } else {
            alert("Failed to create tip: " + result.statusText);
          }
        } catch (error) {
          console.error(error);
          alert("Tip creation failed. Please try again.");
        }
        setSubmitting(false);
      })();
    },
    [currentExchangeRate, inputMethod, isSubmitting, router]
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
        <Row justify="center" align="center">
          <Link onClick={toggleInputMethod}>{inputMethod}</Link>
          <Spacer x={0.5} />
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                {...register("amount", {
                  valueAsNumber: true,
                })}
                width="100px"
                type="number"
                inputMode="decimal"
              />
            )}
          />

          <Spacer x={0.5} />
          <Dropdown>
            <Dropdown.Button flat>
              {inputMethod === "sats" ? (
                <FiatPrice
                  currency={watchedCurrency}
                  exchangeRate={exchangeRates?.[watchedCurrency]}
                  sats={watchedAmount}
                />
              ) : (
                watchedCurrency
              )}
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Dynamic Actions"
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
        {inputMethod === "fiat" && (
          <>
            <Spacer />
            <SatsPrice
              exchangeRate={exchangeRates?.[watchedCurrency]}
              fiat={watchedAmount}
            />
          </>
        )}
        <Spacer />
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Optional note (max 255 characters)"
              maxLength={255}
              fullWidth
            />
          )}
        />
        <Spacer />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loading type="points" color="currentColor" size="sm" />
          ) : (
            <>Confirm</>
          )}
        </Button>
        <Spacer />
      </form>
      <BackButton />
    </>
  );
};

export default NewTip;
