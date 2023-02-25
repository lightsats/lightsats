/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/display-name */
import {
  Button,
  Card,
  Collapse,
  Input,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { OnboardingFlow, Tip, TipGroupStatus, TipStatus } from "@prisma/client";
import { SelectOption } from "components/CustomSelect";
import { NextUIUser } from "components/NextUIUser";
import { Passphrase } from "components/tipper/Passphrase";
import { PrintDesignPicker } from "components/tipper/PrintDesignPicker";
import { useDevPrintPreview } from "hooks/useDevPrintPreview";
import { useUser } from "hooks/useUser";
import { ApiRoutes } from "lib/ApiRoutes";
import { DEFAULT_NAME } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { defaultFetcher } from "lib/swr";
import {
  getClaimUrl,
  getDefaultBulkGiftCardTheme,
  getUserAvatarUrl,
  truncate,
} from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import useSWR from "swr";
import { BulkGiftCardTheme, BulkGiftCardThemes } from "types/BulkGiftCardTheme";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const themeSelectOptions: SelectOption[] = Object.values(
  BulkGiftCardThemes
).map((key) => ({
  value: key,
  label: key,
}));

const PrintTipCardsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const isEmptyPrint = id === "empty";
  let { data: tipGroup } = useSWR<TipGroupWithTips>(
    id && !isEmptyPrint ? `${ApiRoutes.tipGroups}/${id}` : undefined,
    defaultFetcher
  );
  const { data: user } = useUser();
  const printRef = React.useRef(null);

  const print = useReactToPrint({
    content: () => printRef.current,
  });

  useDevPrintPreview();

  const cardsPerPage = 9;
  const [theme, setTheme] = React.useState(getDefaultBulkGiftCardTheme());
  const [customNumPages, setCustomNumPages] = React.useState(1);
  const [backgroundUrl, setBackgroundUrl] = React.useState("");
  if (isEmptyPrint) {
    tipGroup = {
      tips: [...new Array(customNumPages * cardsPerPage)].map((_, index) => ({
        amount: 0,
        anonymousTipper: false,
        claimed: null,
        claimedFromPrintedCard: false,
        copiedClaimUrl: null,
        created: new Date(),
        currency: null,
        expiry: new Date(),
        fee: 0,
        groupId: null,
        groupTipIndex: null,
        id: "",
        invoice: null,
        invoiceId: null,
        passphrase: " ".repeat(2), // generates 3 empty words
        lastWithdrawal: null,
        note: null,
        numSmsTokens: 0,
        onboardingFlow: OnboardingFlow.DEFAULT,
        preparationInvoice: null,
        preparationInvoiceId: null,
        recommendedWalletId: null,
        status: TipStatus.UNSEEN,
        tippeeId: null,
        tippeeLocale: null,
        tippeeName: null,
        tipperId: "",
        updated: new Date(),
        version: 1,
        withdrawalId: null,
      })),
      name: "",
      created: new Date(),
      id: "",
      status: TipGroupStatus.FUNDED,
      quantity: customNumPages * cardsPerPage,
      invoice: null,
      invoiceId: null,
      tipperId: "",
      updated: new Date(),
    };
  }

  if (!tipGroup || !user) {
    return <Loading />;
  }

  const numPages = isEmptyPrint
    ? customNumPages
    : Math.ceil(tipGroup.tips.length / cardsPerPage);
  const pages = [...new Array(numPages)].map((_, index) => index);
  const firstTip = tipGroup.tips[0];

  return (
    <>
      <Text h3>DIY Bitcoin Gift Cards</Text>
      {isEmptyPrint && (
        <>
          <Text>
            Print cards in advance for tips that using the 🆒{" "}
            <strong>Generate passphrase</strong> option. Write down the 3 magic
            words from the tip passphrase on the card before you hand it out.
          </Text>
          <Spacer />
        </>
      )}
      <PrintDesignPicker
        themeSelectOptions={themeSelectOptions}
        theme={theme}
        setTheme={setTheme}
        backgroundUrl={backgroundUrl}
        setBackgroundUrl={setBackgroundUrl}
      />
      {isEmptyPrint && (
        <>
          <Spacer />
          <Card>
            <Card.Body>
              <Row justify="space-between" align="center">
                <Text>Number of pages (9 cards per page)</Text>
                <Input
                  initialValue={numPages.toString()}
                  onChange={(e) =>
                    e.target.value &&
                    setCustomNumPages(Math.max(parseInt(e.target.value), 1))
                  }
                  type="number"
                  width="100px"
                  bordered
                />
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <BulkTipGiftCardContentsPreview
          backgroundUrl={backgroundUrl}
          theme={theme}
          tip={firstTip}
        />
      </Card>
      <Spacer />
      <Collapse
        shadow
        title={<Text b>What you will need</Text>}
        css={{ width: "100%", background: "$white", border: "none" }}
      >
        <ul>
          <li>🖥️ A computer</li>
          <li>🖨️ A printer</li>
          <li>
            📄 {numPages} sheets of paper, A4 or letter size (use thicker paper
            for some sturdiness)
          </li>
          <li>✂️ Scissors (a box cutter is even better)</li>
        </ul>
      </Collapse>
      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          <Text h4>🪜 Step by step</Text>
          <Text>1) Insert {numPages} sheets into your printer.</Text>
          <Spacer />
          <Text>
            2) Press the button below to print your card, using A4 or Letter
            size.
          </Text>
          <Spacer />
          <Row justify="center">
            <Button
              onClick={() => {
                document.title = "cards.pdf";
                print();
              }}
            >
              🖨️ Print cards
            </Button>
          </Row>
          <Spacer y={2} />
          <Text>3) Cut out the cards along the lines.</Text>
          <Spacer />
          <Text>
            4) Enjoy your beautiful cards, you are ready to gift bitcoin with
            style! 🥳
          </Text>
        </Card.Body>
      </Card>
      <Spacer />
      <div
        style={{
          display:
            process.env.NEXT_PUBLIC_TEST_PRINT === "true" ? "block" : "none",
        }}
      >
        <div ref={printRef}>
          {pages.map((index) => {
            if (!tipGroup) {
              throw new Error("tipGroup not set");
            }
            return (
              <PrintablePage key={index}>
                <img
                  alt=""
                  width="100%"
                  height="100%"
                  src="/tip-groups/printed-cards/guide.png"
                  style={{ position: "absolute", zIndex: 1 }}
                />
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: "8.05% 7%",
                    //background: "red",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      //background: "green",
                    }}
                  >
                    {tipGroup.tips
                      .slice(index * cardsPerPage, (index + 1) * cardsPerPage)
                      .map((tip) => (
                        <div
                          key={tip.id}
                          style={{
                            width: "calc(100% / 3)",
                            height: "calc(100% / 3)",
                            display: "inline-block",
                          }}
                        >
                          <BulkTipGiftCardContents
                            theme={theme}
                            tip={tip}
                            backgroundUrl={backgroundUrl}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </PrintablePage>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PrintTipCardsPage;

export { getStaticProps, getStaticPaths };

const PrintablePage = ({ children }: React.PropsWithChildren) => {
  return (
    <div
      style={{
        width: 3508,
        height: 2480,
        display: "flex",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
};

type BulkTipGiftCardContentsProps = {
  tip: Tip;
  theme: BulkGiftCardTheme;
  backgroundUrl?: string;
  width?: string | number;
  height?: string | number;
};

export function BulkTipGiftCardContents({
  tip,
  backgroundUrl,
  theme,
  width = "100%",
  height = "100%",
}: BulkTipGiftCardContentsProps) {
  const { data: user } = useUser();
  if (!user) {
    return null;
  }
  return (
    <div
      style={{
        backgroundImage: `url(${
          backgroundUrl || `/tip-groups/printed-cards/${theme}/background.png`
        })`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width,
        height,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "50px",
      }}
    >
      <Row justify="space-between" align="flex-start">
        <Text
          color="white"
          css={{
            fontSize: "60px",
            fontWeight: "bold",
            letterSpacing: "$wider",
            lineHeight: "50px",
          }}
        >
          Bitcoin Giftcard
        </Text>
        <img
          alt="logo"
          src="/images/logo-white-cropped.svg"
          width={170}
          style={{}}
        />
      </Row>
      <div style={{ flex: 1 }} />
      <Row justify="space-between" align="flex-end">
        <NextUIUser
          bordered
          size="lg"
          css={{
            transform: "scale(2,2)",
            transformOrigin: "center left",
            pb: "14px",
            pl: "0px",
            ".nextui-user-avatar": {
              padding: "4px",
            },
            ".nextui-avatar-bg": {
              background: "rgba(255, 255, 255, 0.25)",
              padding: "$10",
            },
            ".nextui-avatar-img": {
              border: "none",
            },
          }}
          name={
            <Text b color="white" css={{ fontSize: "20px" }}>
              {truncate(user.name ?? DEFAULT_NAME, 21)}
            </Text>
          }
          src={getUserAvatarUrl(user)}
        />
        <div
          style={{
            filter: "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.25))",
            padding: "20px",
            background: "white",
            borderRadius: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {tip.passphrase ? (
            <Passphrase
              passphrase={tip.passphrase}
              width={256}
              height={256}
              showInstructions
            />
          ) : (
            <QRCode value={getClaimUrl(tip, true)} />
          )}
        </div>
      </Row>
    </div>
  );
}

export function BulkTipGiftCardContentsPreview(
  props: BulkTipGiftCardContentsProps
) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    setWidth(ref.current?.clientWidth || 0);
  }, [ref]);
  const idealWidth = 273 * 4;
  const idealHeight = 182 * 4;
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: width * (idealHeight / idealWidth) + "px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: idealWidth + "px",
          height: idealHeight + "px",
          transform: `scale(${width / idealWidth})`,
        }}
      >
        <BulkTipGiftCardContents
          {...props}
          width={idealWidth + "px"}
          height={idealHeight + "px"}
        />
      </div>
    </div>
  );
}
