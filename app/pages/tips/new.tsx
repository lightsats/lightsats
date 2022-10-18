import {
  Button,
  Dropdown,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { SatsPrice } from "components/SatsPrice";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getFiatAmount, getSatsAmount } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { CreateTipRequest } from "types/CreateTipRequest";
import { ExchangeRates } from "types/ExchangeRates";

const NewTip: NextPage = () => {
  // TODO: use a proper form
  const router = useRouter();
  const [amount, setAmount] = React.useState(1);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [inputMethod, setInputMethod] = React.useState<"fiat" | "sats">("fiat");

  const [currency, setCurrency] = React.useState("USD");

  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  const currentExchangeRate = exchangeRates?.[currency];

  const toggleInputMethod = React.useCallback(() => {
    if (currentExchangeRate) {
      setInputMethod(inputMethod === "fiat" ? "sats" : "fiat");
      setAmount(
        inputMethod === "fiat"
          ? getSatsAmount(amount, currentExchangeRate)
          : Math.round(getFiatAmount(amount, currentExchangeRate) * 100) / 100
      );
    }
  }, [amount, currentExchangeRate, inputMethod]);

  const exchangeRateKeys = React.useMemo(
    () => (exchangeRates ? Object.keys(exchangeRates) : undefined),
    [exchangeRates]
  );

  const setDropdownSelectedCurrency = React.useCallback(
    (keys: unknown) => setCurrency(Array.from(keys as Iterable<string>)[0]),
    []
  );

  const selectedCurrencies = React.useMemo(
    () => new Set([currency]),
    [currency]
  );

  const submitForm = React.useCallback(() => {
    if (isSubmitting) {
      throw new Error("Already submitting");
    }
    if (amount <= 0) {
      throw new Error("No amount provided");
    }
    setSubmitting(true);

    (async () => {
      try {
        const createTipRequest: CreateTipRequest = {
          amount,
          currency,
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
  }, [amount, currency, isSubmitting, router]);

  return (
    <>
      <Row justify="center" align="center">
        <Link onClick={toggleInputMethod}>{inputMethod}</Link>
        <Spacer x={0.5} />
        <Input
          width="100px"
          type="number"
          inputMode="decimal"
          value={amount.toString()}
          onChange={(event) => setAmount(parseFloat(event.target.value || "0"))}
        />
        <Spacer x={0.5} />
        {exchangeRateKeys && (
          <Dropdown>
            <Dropdown.Button flat>
              {inputMethod === "sats" ? (
                <FiatPrice
                  currency={currency}
                  exchangeRate={exchangeRates?.[currency]}
                  sats={amount}
                />
              ) : (
                currency
              )}
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Dynamic Actions"
              selectionMode="single"
              selectedKeys={selectedCurrencies}
              onSelectionChange={setDropdownSelectedCurrency}
            >
              {exchangeRateKeys.map((key) => (
                <Dropdown.Item key={key}>{key}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </Row>
      {inputMethod === "fiat" && (
        <>
          <Spacer />
          <SatsPrice exchangeRate={exchangeRates?.[currency]} fiat={amount} />
        </>
      )}
      <Spacer />
      <Button onClick={submitForm} disabled={isSubmitting || amount <= 0}>
        {isSubmitting ? (
          <Loading type="points" color="currentColor" size="sm" />
        ) : (
          <>Confirm</>
        )}
      </Button>
      <Spacer />
      <BackButton />
    </>
  );
};

export default NewTip;
