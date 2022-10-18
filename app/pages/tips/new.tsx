import {
  Button,
  Dropdown,
  Input,
  Loading,
  Row,
  Spacer,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { FiatPrice } from "../../components/FiatPrice";
import { Routes } from "../../lib/Routes";
import { defaultFetcher } from "../../lib/swr";
import { CreateTipRequest } from "../../types/CreateTipRequest";
import { ExchangeRates } from "../../types/ExchangeRates";

const NewTip: NextPage = () => {
  // TODO: use a proper form
  const router = useRouter();
  const [amount, setAmount] = React.useState(1000);
  const [isSubmitting, setSubmitting] = React.useState(false);

  const [currency, setCurrency] = React.useState("USD");

  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

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
      <Row justify="center" align="flex-end">
        <Input
          label="Sats"
          type="number"
          value={amount.toString()}
          onChange={(event) => setAmount(parseInt(event.target.value || "0"))}
        />
        <Spacer x={0.5} />
        {exchangeRateKeys && (
          <Dropdown>
            <Dropdown.Button flat>
              <FiatPrice
                currency={currency}
                exchangeRate={exchangeRates?.[currency]}
                sats={amount}
              />
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Dynamic Actions"
              selectionMode="single"
              selectedKeys={selectedCurrencies}
              onSelectionChange={setDropdownSelectedCurrency}
            >
              {exchangeRateKeys.map((key) => (
                <Dropdown.Item key={key}>
                  <FiatPrice
                    currency={key}
                    exchangeRate={exchangeRates?.[key]}
                    sats={amount}
                  />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </Row>
      <Spacer />
      <Button onClick={submitForm} disabled={isSubmitting}>
        {isSubmitting ? (
          <Loading type="points" color="currentColor" size="sm" />
        ) : (
          <>Confirm</>
        )}
      </Button>
    </>
  );
};

export default NewTip;
