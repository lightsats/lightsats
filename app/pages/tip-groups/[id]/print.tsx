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
  Switch,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { NextUIUser } from "components/NextUIUser";
import { BulkPrintDesignPicker } from "components/tipper/BulkPrintDesignPicker";
import { Passphrase } from "components/tipper/Passphrase";
import { UserCard } from "components/UserCard";
import { UserDonateWidget } from "components/UserDonateWidget";
import { useDevPrintPreview } from "hooks/useDevPrintPreview";
import { useUser } from "hooks/useUser";
import { ApiRoutes } from "lib/ApiRoutes";
import { DEFAULT_NAME } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { injectA3PrintStyles, injectStandardPrintStyles } from "lib/printUtils";
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
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import useSWR from "swr";
import { BulkGiftCardTheme } from "types/BulkGiftCardTheme";
import { PublicTip } from "types/PublicTip";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export type BulkPrintableTip =
  | Tip
  | PublicTip
  | { id: string; passphrase: string };

type BulkPrintVariant = "3x3" | "8x3";

const PrintTipCardsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const isEmptyPrint = id === "empty";
  const { data: _tipGroup } = useSWR<TipGroupWithTips>(
    id && !isEmptyPrint ? `${ApiRoutes.tipGroups}/${id}` : undefined,
    defaultFetcher
  );
  const { data: user } = useUser();
  const printRef = React.useRef(null);

  useDevPrintPreview();

  const [theme, setTheme] = React.useState(getDefaultBulkGiftCardTheme());
  const [customNumPages, setCustomNumPages] = React.useState(1);
  const [showSenderAvatar, setShowSenderAvatar] = React.useState(true);
  const [variant, setVariant] = React.useState<BulkPrintVariant>(
    (process.env.NEXT_PUBLIC_BULK_PRINT_VARIANT as BulkPrintVariant) || "3x3"
  );
  const [backgroundUrl, setBackgroundUrl] = React.useState(
    process.env.NEXT_PUBLIC_BULK_PRINT_IMAGE_URL || ""
  );

  const rows = variant === "8x3" ? 8 : 3;
  const cardsPerPage = rows * 3;

  React.useEffect(() => {
    if (variant === "3x3") {
      injectStandardPrintStyles();
    } else {
      injectA3PrintStyles();
    }
  }, [variant]);

  const print = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      if (!backgroundUrl) {
        toast.success(
          "Scroll to the bottom of the page to support the artist who designed this card!",
          {
            duration: 10000,
          }
        );
      }
    },
  });

  let tipGroup: { tips: BulkPrintableTip[] } | undefined = _tipGroup;
  if (isEmptyPrint) {
    tipGroup = {
      tips: [...new Array(customNumPages * cardsPerPage)].map((_, index) => ({
        id: index.toString(),
        passphrase: " ".repeat(2), // generates 3 empty words
      })),
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
            Print cards in advance for tips created using the 🆒{" "}
            <strong>Generate passphrase</strong> option. Write down the 3 magic
            words from the tip passphrase on the card before you hand it out.
          </Text>
          <Spacer />
        </>
      )}
      <BulkPrintDesignPicker
        tip={tipGroup.tips[0]}
        selectedTheme={theme}
        setTheme={setTheme}
        backgroundUrl={backgroundUrl}
        setBackgroundUrl={setBackgroundUrl}
        showSenderAvatar={showSenderAvatar}
      />
      <Spacer />
      <Card>
        <Card.Body>
          <Row justify="space-between" align="center">
            <Text>Display sender avatar and name on cards</Text>
            <Spacer x={0.5} />
            <Switch
              checked={showSenderAvatar}
              onChange={(e) => setShowSenderAvatar(e.target.checked)}
            />
          </Row>
          <Spacer />
          <Row justify="space-between" align="center">
            <Text>{'13" * 19"'} Print (8x3 cards per page)</Text>
            <Spacer x={0.5} />
            <Switch
              checked={variant === "8x3"}
              onChange={(e) => setVariant(e.target.checked ? "8x3" : "3x3")}
            />
          </Row>
          {isEmptyPrint && (
            <>
              <Spacer />
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
            </>
          )}
        </Card.Body>
      </Card>
      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <BulkTipGiftCardContentsPreview
          backgroundUrl={backgroundUrl}
          theme={theme}
          tip={firstTip}
          showSenderAvatar={showSenderAvatar}
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
            2) Press the button below to print your card. Choose{" "}
            {'"Save as PDF"'} as the destination, set margins to {'"None"'} and
            turn on background images.
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
          {theme.userId && !backgroundUrl && (
            <>
              <Spacer />
              <Text>5) Consider supporting the artist! </Text>
            </>
          )}
        </Card.Body>
      </Card>
      {theme.userId && !backgroundUrl && (
        <>
          <Spacer y={2} />
          <Row>
            <Text h4>Support the Artist</Text>
          </Row>
          <UserCard userId={theme.userId} />
          <UserDonateWidget userId={theme.userId} />
        </>
      )}
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
              <PrintablePage key={index} variant={variant}>
                {variant === "3x3" && (
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    src="/tip-groups/printed-cards/guide.png"
                    style={{ position: "absolute", zIndex: 1 }}
                  />
                )}
                {variant === "8x3" && (
                  <div
                    // FIXME: why is this needed? otherwise it prints 2 pages instead of one...
                    style={{
                      position: "absolute",
                      zIndex: 1,
                      width: "100%",
                      height: "100%",
                      border: "1px solid red",
                      boxSizing: "content-box",
                    }}
                  />
                )}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: variant === "3x3" ? "8.05% 7%" : "135px 236px",

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
                            width:
                              variant === "3x3" ? "calc(100% / 3)" : "1012px",
                            height:
                              variant === "3x3" ? "calc(100% / 3)" : "607px",
                            display: "inline-block",
                          }}
                        >
                          <BulkTipGiftCardContents
                            theme={theme}
                            tip={tip}
                            backgroundUrl={backgroundUrl}
                            showSenderAvatar={showSenderAvatar}
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

const PrintablePage = ({
  children,
  variant,
}: React.PropsWithChildren<{ variant: BulkPrintVariant }>) => {
  return (
    <div
      style={{
        width: variant === "3x3" ? 3508 : 3508,
        height: variant === "3x3" ? 2480 : 5127,
        display: "flex",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
};

type BulkTipGiftCardContentsProps = {
  tip: BulkPrintableTip;
  theme: BulkGiftCardTheme;
  backgroundUrl?: string;
  width?: string | number;
  height?: string | number;
  showSenderAvatar?: boolean;
};

export function BulkTipGiftCardContents({
  tip,
  backgroundUrl,
  theme,
  width = "100%",
  height = "100%",
  showSenderAvatar = true,
}: BulkTipGiftCardContentsProps) {
  const { data: user } = useUser();
  if (!user) {
    return null;
  }
  return (
    <div
      style={{
        backgroundImage: `url(${
          backgroundUrl ||
          `/tip-groups/printed-cards/${theme.filename}/background.png`
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
            textShadow: "0px 0px 8px #000",
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
            opacity: showSenderAvatar ? undefined : 0,
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
          {"passphrase" in tip && tip.passphrase ? (
            <Passphrase
              passphrase={tip.passphrase}
              width={256}
              height={256}
              showInstructions
            />
          ) : (
            <QRCode value={getClaimUrl(tip as Tip, true)} />
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
