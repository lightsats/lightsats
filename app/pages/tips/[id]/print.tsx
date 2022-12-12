/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/display-name */
import { Button, Card, Loading, Row, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { FlexBox } from "components/FlexBox";
import { LightsatsQRCode } from "components/LightsatsQRCode";
import { NextUIUser } from "components/NextUIUser";
import { format } from "date-fns";
import { useTip } from "hooks/useTip";
import { useUser } from "hooks/useUser";
import { DEFAULT_NAME } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { getClaimUrl, getUserAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { useReactToPrint } from "react-to-print";

const PrintTipCardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tip } = useTip(id as string);
  const insidePageRef = React.useRef(null);
  const outsidePageRef = React.useRef(null);

  const printInside = useReactToPrint({
    content: () => insidePageRef.current,
  });
  const printOutside = useReactToPrint({
    content: () => outsidePageRef.current,
  });

  if (!tip) {
    return <Loading />;
  }

  return (
    <>
      <Button size="sm" bordered onClick={printInside}>
        Print inside page
      </Button>
      <Text>
        Flip your printed page over and re-insert it back into the printer.
      </Text>
      <Button size="sm" bordered onClick={printOutside}>
        Print outside page
      </Button>

      <div
        style={{
          display:
            process.env.NEXT_PUBLIC_TEST_PRINT === "true" ? "block" : "none",
        }}
      >
        <PrintablePage ref={insidePageRef}>
          <InsidePage tip={tip} />
        </PrintablePage>
        <PrintablePage ref={outsidePageRef}>
          <OutsidePage />
        </PrintablePage>
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
};

const InsidePage = ({ tip }: InsidePageProps) => {
  const { data: user } = useUser();
  if (!user) {
    return null;
  }
  const defaultNote =
    "Wishing you a merry Christmas and a prosperous new year, filled with sats, joy, and laughter! 🎅";
  return (
    <>
      {process.env.NEXT_PUBLIC_TEST_PRINT === "true" && (
        <img
          alt=""
          width="100%"
          height="100%"
          src="/tips/printed-cards/christmas/inside-guide.png"
          style={{ position: "absolute", zIndex: -1 }}
        />
      )}
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
              padding: "0px 200px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              b
              css={{ fontSize: "56px", textAlign: "center", width: "700px" }}
            >
              Scan this code to claim your bitcoin 👇
            </Text>
            <div
              style={{
                width: "600px",
                height: "600px",
                filter: "drop-shadow(0px 0px 16px rgba(0, 0, 0, 0.25))",
                padding: "50px",
                marginTop: "100px",
                background: "white",
                borderRadius: "32px",
              }}
            >
              <LightsatsQRCode value={getClaimUrl(tip)} />
            </div>

            <Text
              css={{
                fontSize: "32px",
                mt: "100px",
                width: "500px",
                textAlign: "center",
                color: "$gray600",
              }}
            >
              Make sure to claim your gift before it expires on{" "}
              {format(new Date(tip.expiry), "d MMMM yyyy")}.
            </Text>
          </FlexBox>
          <FlexBox
            style={{
              //background: "cyan",
              padding: "0px 100px",
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
                fontWeight: "$extrabold",
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
                <Row justify="center" css={{ mb: "30px" }}>
                  <NextUIUser
                    css={{ zoom: 3 }}
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
                      css={{ fontSize: "56px", textAlign: "center" }}
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
      </div>
    </>
  );
};
const OutsidePage = () => {
  return (
    <>
      <img
        alt=""
        width="100%"
        height="100%"
        src="/tips/printed-cards/christmas/outside.png"
      />
    </>
  );
};
