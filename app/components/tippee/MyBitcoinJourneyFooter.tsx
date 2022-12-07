import { Button, Container, Text } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import { NextLink } from "components/NextLink";
import { useTranslation } from "next-i18next";
import React from "react";
import ReactDOM from "react-dom";

type MyBitcoinJourneyFooterProps = {
  text: React.ReactNode;
  href: string;
  nextUp: string;
};

export function MyBitcoinJourneyFooter({
  text,
  href,
  nextUp,
}: MyBitcoinJourneyFooterProps) {
  const [visible, setVisible] = React.useState(false);
  const { t } = useTranslation("journey");
  React.useEffect(() => {
    setVisible(true);
  }, []);
  if (!visible) {
    return null;
  }
  return (
    <>
      {/* give some space for the fixed content */}
      <div style={{ height: "50px" }} />{" "}
      {ReactDOM.createPortal(
        <FlexBox
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            boxShadow: "0px -8px 8px #0001",
            zIndex: 10,
          }}
        >
          <FlexBox style={{ width: "100%", maxWidth: "600px" }}>
            <Container css={{ padding: "$10", pb: "$10" }}>
              <FlexBox
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <FlexBox style={{ flex: 1 }}>
                  <FlexBox style={{ flexDirection: "column" }}>
                    <Text b small transform="uppercase">
                      {t("footer.nextUp")}
                    </Text>
                    <Text>{nextUp}</Text>
                  </FlexBox>
                </FlexBox>
                <FlexBox style={{ flex: 0 }}>
                  <NextLink href={href} passHref>
                    <a>
                      <Button size="lg" auto>
                        {text}
                      </Button>
                    </a>
                  </NextLink>
                </FlexBox>
              </FlexBox>
            </Container>
          </FlexBox>
        </FlexBox>,
        document.body
      )}
    </>
  );
}
