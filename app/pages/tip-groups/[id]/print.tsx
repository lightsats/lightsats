/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/display-name */
import {
  Button,
  Card,
  Collapse,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { NextUIUser } from "components/NextUIUser";
import { useUser } from "hooks/useUser";
import { ApiRoutes } from "lib/ApiRoutes";
import { DEFAULT_NAME } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { defaultFetcher } from "lib/swr";
import { getClaimUrl, getUserAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import useSWR from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

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

  if (!tipGroup || !user) {
    return <Loading />;
  }

  const cardsPerPage = 9;
  const numPages = Math.ceil(tipGroup.tips.length / cardsPerPage);
  const pages = [...new Array(numPages)].map((_, index) => index);

  return (
    <>
      <h3>DIY Bitcoin Gift Cards</h3>

      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Image
          src={`/tip-groups/printed-cards/generic/preview.png`}
          objectFit="cover"
          width="100%"
          height={340}
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
                src="/tip-groups/printed-cards/generic/guide.png"
                style={{ position: "absolute", zIndex: 1 }}
              />
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "2% 0.5%",
                  //background: "red",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: "100%",
                    height: "100%",
                    //justifyContent: "center",
                    //alignItems: "center",
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
                          padding: "0.5%",
                          //background: "white",
                        }}
                      >
                        <div
                          style={{
                            //background: "yellow",
                            background:
                              'url("/tip-groups/printed-cards/generic/card-background.png")',
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            padding: "6.5% 9%",
                          }}
                        >
                          <Row justify="space-between" align="flex-start">
                            <Text
                              color="white"
                              css={{
                                fontSize: "60px",
                                fontWeight: "bold",
                                letterSpacing: "$wider",
                              }}
                            >
                              Bitcoin Giftcard
                            </Text>
                            <img
                              alt="logo"
                              src="/images/logo-white.svg"
                              width={200}
                              height={200}
                              style={{
                                marginTop: "-65px",
                                marginRight: "-30px",
                              }}
                            />
                          </Row>
                          <div style={{ flex: 1 }} />
                          <Row justify="space-between" align="flex-end">
                            <NextUIUser
                              bordered
                              size="lg"
                              css={{
                                transform: "scale(2,2)",
                                pb: "26px",
                                pl: "41px",
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
                                <Text
                                  b
                                  color="white"
                                  css={{ fontSize: "20px" }}
                                >
                                  {user.name ?? DEFAULT_NAME}
                                </Text>
                              }
                              src={getUserAvatarUrl(user)}
                            />
                            <div
                              style={{
                                filter:
                                  "drop-shadow(0px 0px 16px rgba(0, 0, 0, 0.25))",
                                padding: "20px",
                                background: "white",
                                borderRadius: "32px",
                              }}
                            >
                              <QRCode value={getClaimUrl(tip, true)} />
                            </div>
                          </Row>
                        </div>
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
