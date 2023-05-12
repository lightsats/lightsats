/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/display-name */
import {
  Button,
  Card,
  Collapse,
  Loading,
  Row,
  Spacer,
  Switch,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { SelectOption } from "components/CustomSelect";
import { FlexBox } from "components/FlexBox";
import { NextUIUser } from "components/NextUIUser";
import { Passphrase } from "components/tipper/Passphrase";
import { PrintDesignPicker } from "components/tipper/PrintDesignPicker";
import { format } from "date-fns";
import { useDevPrintPreview } from "hooks/useDevPrintPreview";
import { useTip } from "hooks/useTip";
import { useUser } from "hooks/useUser";
import { DEFAULT_NAME } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { injectStandardPrintStyles } from "lib/printUtils";
import {
  getClaimUrl,
  getDefaultGiftCardTheme,
  getRedeemUrl,
  getUserAvatarUrl,
} from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import { GiftCardTheme, GiftCardThemes } from "types/GiftCardTheme";

const themeSelectOptions: SelectOption[] = Object.values(GiftCardThemes).map(
  (key) => ({
    value: key,
    label: key,
  })
);

const PrintTipCardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tip } = useTip(id as string);
  const insidePageRef = React.useRef(null);
  const outsidePageRef = React.useRef(null);
  const bothPagesRef = React.useRef(null);
  const [theme, setTheme] = React.useState(getDefaultGiftCardTheme());
  const [backgroundUrl, setBackgroundUrl] = React.useState("");
  const [duplex, setDuplex] = React.useState(true);

  const printInside = useReactToPrint({
    content: () => insidePageRef.current,
  });
  const printOutside = useReactToPrint({
    content: () => outsidePageRef.current,
  });
  const printDuplex = useReactToPrint({
    content: () => bothPagesRef.current,
  });

  useDevPrintPreview();

  React.useEffect(() => {
    injectStandardPrintStyles();
  }, []);

  if (!tip) {
    return <Loading />;
  }

  return (
    <>
      <h3>DIY Bitcoin Gift Card</h3>
      <PrintDesignPicker
        themeSelectOptions={themeSelectOptions}
        theme={theme}
        setTheme={setTheme}
        backgroundUrl={backgroundUrl}
        setBackgroundUrl={setBackgroundUrl}
      />
      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Image
          src={`/tips/printed-cards/${theme}/preview2.jpg`}
          objectFit="cover"
          width="100%"
          height="auto"
          alt="Card image background"
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
              📄 1 sheet of paper, A4 or letter size (use thicker paper for some
              sturdiness)
            </li>
            <li>✂️ Scissors (a box cutter is even better)</li>
          </ul>
        </Collapse>
      </Card>
      <Spacer />

      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          <Text h4>🪜 Step by step</Text>
          <Row align="center">
            <Text>Duplex Printer</Text>
            <Spacer />
            <Switch
              checked={duplex}
              onChange={(e) => setDuplex(e.target.checked)}
            />
          </Row>
          <Spacer />
          {duplex ? (
            <>
              <Text>1) Insert the sheet into your printer.</Text>
              <Spacer />
              <Text>
                2) Press the button below to print your card, using A4 or Letter
                size. Make sure to enable on two-sided printing or duplex mode,
                and switch the print edge to long side.
              </Text>
              <Spacer />
              <Row justify="center">
                <Button
                  onClick={() => {
                    document.title = "card.pdf";
                    printDuplex();
                  }}
                >
                  🖨️ Print both sides
                </Button>
              </Row>
            </>
          ) : (
            <>
              <Text>
                1) Insert the sheet into your printer and print the inside of
                your card, using A4 or Letter size.
              </Text>
              <Spacer />
              <Row justify="center">
                <Button
                  onClick={() => {
                    document.title = "inside.pdf";
                    printInside();
                  }}
                >
                  🖨️ Print inside page
                </Button>
              </Row>
              <Spacer y={2} />
              <Text>
                {`2) Flip your printed page over and re-insert it back into the
            printer. We're going to print the outside of the page now:`}
              </Text>
              <Spacer />
              <Row justify="center">
                <Button
                  onClick={() => {
                    document.title = "outside.pdf";
                    printOutside();
                  }}
                >
                  🖨️ Print outside page
                </Button>
              </Row>
            </>
          )}

          <Spacer y={2} />
          <Text>3) Cut out the card along the lines on the front.</Text>
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
        <div ref={bothPagesRef}>
          <PrintablePage ref={insidePageRef}>
            <InsidePage theme={theme} tip={tip} />
          </PrintablePage>
          <PrintablePage ref={outsidePageRef}>
            <OutsidePage theme={theme} backgroundUrl={backgroundUrl} />
          </PrintablePage>
        </div>
      </div>
    </>
  );
};

export default PrintTipCardPage;

export { getStaticProps, getStaticPaths };

const PrintablePage = React.forwardRef<HTMLDivElement, React.PropsWithChildren>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 3508,
          height: 2480,
          display: "flex",
          position: "relative",
        }}
      >
        {props.children}
      </div>
    );
  }
);

type InsidePageProps = {
  tip: Tip;
  theme: GiftCardTheme;
};

function PrintGuide() {
  return (
    <img
      alt=""
      width="100%"
      height="100%"
      src="/tips/printed-cards/guide.png"
      style={{ position: "absolute", zIndex: 1 }}
    />
  );
}

const InsidePage = ({ tip, theme }: InsidePageProps) => {
  const { data: user } = useUser();
  if (!user) {
    return null;
  }
  const defaultNote =
    theme === "christmas"
      ? "Wishing you a merry Christmas and a prosperous new year, filled with sats, joy, and laughter! 🎅"
      : "Here's to a successful year ahead, filled with bitcoin and endless possibilities! 🚀";
  return (
    <>
      <PrintGuide />
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "450px 600px",
        }}
      >
        <FlexBox
          style={{
            width: "100%",
            height: "100%",
            //background: "blue",
            flexDirection: "row",
          }}
        >
          <FlexBox
            style={{
              //background: "yellow",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              b={!tip.passphrase}
              css={{
                fontSize: "48px",
                textAlign: "center",
                width: "700px",
                lineHeight: "1.25em",
              }}
            >
              {tip.passphrase ? (
                <>
                  Enter these magic words at{" "}
                  <strong>{getRedeemUrl(true)}</strong> to claim your bitcoin 👇
                </>
              ) : (
                <>Scan this code to claim your bitcoin 👇</>
              )}
            </Text>
            <div
              style={{
                filter: "drop-shadow(0px 0px 16px rgba(0, 0, 0, 0.25))",
                padding: "50px",
                marginTop: "50px",
                background: "white",
                borderRadius: "32px",
              }}
            >
              {tip.passphrase ? (
                <Passphrase
                  passphrase={tip.passphrase}
                  width={250}
                  height={250}
                />
              ) : (
                <QRCode
                  width={500}
                  height={500}
                  value={getClaimUrl(tip, true)}
                />
              )}
            </div>

            <Text
              css={{
                fontSize: "36px",
                mt: "40px",
                width: "500px",
                textAlign: "center",
                color: "$gray600",
                lineHeight: "1.25em",
              }}
            >
              Make sure to claim your gift before it expires on{" "}
              {format(new Date(tip.expiry), "d MMMM yyyy")}.
            </Text>
          </FlexBox>
          <FlexBox
            style={
              {
                //background: "cyan",
              }
            }
          >
            <FlexBox
              style={{
                padding: 150,
                paddingTop: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text h1 css={{ fontSize: "96px" }}>
                Hi, {tip.tippeeName ?? DEFAULT_NAME}! 👋
              </Text>
              <Text b css={{ fontSize: "56px", marginTop: "100px" }}>
                You were gifted
              </Text>
              <Text
                css={{
                  fontSize: "56px",
                  fontWeight: "$bold",
                }}
              >
                {tip.amount} sats
              </Text>
              <Card
                css={{
                  background: "$gray900",
                  mt: "100px",
                  p: "30px",
                  borderRadius: "32px",
                }}
              >
                <Card.Body>
                  <Row justify="center" css={{ mb: "40px" }}>
                    <NextUIUser
                      css={{ transform: "scale(2,2)" }}
                      name={
                        <Text b color="white">
                          {user.name ?? DEFAULT_NAME}
                        </Text>
                      }
                      src={getUserAvatarUrl(user)}
                    />
                  </Row>

                  <Card css={{ background: "$black", borderRadius: 0 }}>
                    <Card.Body css={{ p: "30px" }}>
                      <Text
                        color="white"
                        css={{
                          fontSize: "46px",
                          lineHeight: "1.25em",
                          textAlign: "center",
                        }}
                      >
                        {tip.note
                          ? tip.note.length > defaultNote.length
                            ? tip.note.slice(0, defaultNote.length - 3) + "..."
                            : tip.note
                          : defaultNote}
                      </Text>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
            </FlexBox>
          </FlexBox>
        </FlexBox>
      </div>
    </>
  );
};

type OutsidePageProps = {
  theme: GiftCardTheme;
  backgroundUrl: string;
};

const OutsidePage = ({ theme, backgroundUrl }: OutsidePageProps) => {
  return (
    <>
      <PrintGuide />
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "340px 481.67px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundImage: `url(/tips/printed-cards/${theme}/outside.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {backgroundUrl && (
            <div
              style={{
                backgroundImage: `url(${backgroundUrl}`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};
