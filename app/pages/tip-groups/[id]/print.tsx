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
import { Tip } from "@prisma/client";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { NextUIUser } from "components/NextUIUser";
import { MobilePrintWarning } from "components/tipper/MobilePrintWarning";
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
  const { data: tipGroup } = useSWR<TipGroupWithTips>(
    `${ApiRoutes.tipGroups}/${id}`,
    defaultFetcher
  );
  const { data: user } = useUser();
  const printRef = React.useRef(null);

  const print = useReactToPrint({
    content: () => printRef.current,
  });

  useDevPrintPreview();

  const [theme, setTheme] = React.useState(getDefaultBulkGiftCardTheme());
  const [backgroundUrl, setBackgroundUrl] = React.useState("");

  if (!tipGroup || !user) {
    return <Loading />;
  }

  const cardsPerPage = 9;
  const numPages = Math.ceil(tipGroup.tips.length / cardsPerPage);
  const pages = [...new Array(numPages)].map((_, index) => index);
  const firstTip = tipGroup.tips[0];

  return (
    <>
      <h3>DIY Bitcoin Gift Cards</h3>
      <MobilePrintWarning />
      <Row>
        <Text>Theme</Text>
      </Row>
      <Row>
        <CustomSelect
          options={themeSelectOptions}
          value={theme}
          onChange={(value) => {
            if (value) {
              setTheme(value as BulkGiftCardTheme);
            }
          }}
        />
      </Row>
      <Spacer />
      <Input
        fullWidth
        label="Custom Background Image URL"
        value={backgroundUrl}
        placeholder={
          "https://images.pexels.com/photos/14546306/pexels-photo-14546306.jpeg"
        }
        onChange={(e) => setBackgroundUrl(e.target.value)}
      />

      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <BulkTipGiftCardContentsPreview
          backgroundUrl={backgroundUrl}
          theme={theme}
          tip={firstTip}
        />

        <Collapse
          shadow
          title={<Text b>What you will need 👇</Text>}
          css={{ width: "100%", background: "$white", border: "none" }}
        >
          <ul>
            <li>🖥️ A computer</li>
            <li>🖨️ A printer</li>
            <li>
              📄 {numPages} sheets of paper, A4 or letter size (use thicker
              paper for some sturdiness)
            </li>
            <li>✂️ Scissors (a box cutter is even better)</li>
          </ul>
        </Collapse>
      </Card>
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
          {pages.map((index) => (
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
                        <BulkTipGiftCardContents theme={theme} tip={tip} />
                      </div>
                    ))}
                </div>
              </div>
            </PrintablePage>
          ))}
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
        width,
        height,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
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
            pb: "14px",
            pl: "49px",
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
              {user.name ?? DEFAULT_NAME}
            </Text>
          }
          src={getUserAvatarUrl(user)}
        />
        <div
          style={{
            filter: "drop-shadow(0px 0px 16px rgba(0, 0, 0, 0.25))",
            padding: "20px",
            background: "white",
            borderRadius: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <QRCode value={getClaimUrl(tip, true)} />
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
