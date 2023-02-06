import { Button, Input, Loading, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { FlexBox } from "components/FlexBox";
import { ApiRoutes } from "lib/ApiRoutes";
import { bip0039 } from "lib/bip0039";
import { DEFAULT_TIP_PASSPHRASE_LENGTH } from "lib/constants";
import { getClaimUrl, tryGetErrorMessage } from "lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { toast } from "react-hot-toast";

const RedeemTipPage: NextPage = () => {
  const [numWords, setNumWords] = React.useState(DEFAULT_TIP_PASSPHRASE_LENGTH);
  const [values, setValues] = React.useState<{ [index: string]: string }>({});
  const [isLoaded, setLoaded] = React.useState(false);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  React.useEffect(() => {
    setLoaded(true);
  }, []);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const passphrase = [...new Array(numWords)]
        .map((_, index) => values[index].toLowerCase().trim())
        .join(" ");
      if (passphrase.split(" ").some((word) => bip0039.indexOf(word) < 0)) {
        toast.error("One or more words are invalid.");
      } else {
        (async () => {
          setSubmitting(true);
          const result = await fetch(
            `${ApiRoutes.tippeeTips}?passphrase=${encodeURIComponent(
              passphrase
            )}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );
          try {
            if (!result.ok) {
              throw new Error(await tryGetErrorMessage(result));
            }
            const tips: Tip[] = await result.json();
            if (tips.length === 1) {
              router.push(getClaimUrl(tips[0]));
            } else {
              throw new Error("Tip not found");
            }
          } catch (error) {
            toast.error((error as Error).message);
            setSubmitting(false);
          }
        })();
      }
    },
    [numWords, router, values]
  );

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Redeem</title>
      </Head>
      <Text h1>Redeem Tip</Text>
      {isLoaded && (
        <>
          <Text>
            Enter your magic words below to claim your bitcoin 👇
            {/* &nbsp; <Input
              initialValue={numWords.toString()}
              onChange={(e) =>
                e.target.value &&
                setNumWords(
                  Math.min(
                    Math.max(
                      parseInt(e.target.value),
                      MIN_TIP_PASSPHRASE_LENGTH
                    ),
                    MAX_TIP_PASSPHRASE_LENGTH
                  )
                )
              }
              type="number"
              width="60px"
              bordered
            /> */}
          </Text>
          <Spacer />
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            onSubmit={handleSubmit}
          >
            <FlexBox style={{ gap: "10px" }}>
              {[...new Array(numWords)].map((_, index) => (
                <Input
                  key={index}
                  placeholder={bip0039[(index * 300) % bip0039.length]}
                  onChange={(e) =>
                    setValues({ ...values, [index]: e.target.value })
                  }
                  type="string"
                  css={{
                    background: "$accents2",
                  }}
                  pattern="[a-zA-Z ]+"
                  required
                />
              ))}
            </FlexBox>
            <Spacer />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loading size="sm" /> : <>Redeem</>}
            </Button>
          </form>
        </>
      )}
    </>
  );
};

export default RedeemTipPage;
