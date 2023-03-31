import { Card, Grid, Input, Link, Spacer, Text } from "@nextui-org/react";
import { MobilePrintWarning } from "components/tipper/MobilePrintWarning";
import { useIsMobile } from "hooks/useIsMobile";
import { usePublicUser } from "hooks/usePublicUser";
import { bulkGiftCardThemes } from "lib/bulkGiftCardThemes";
import { DEFAULT_NAME } from "lib/constants";
import { getPublicProfileUrl } from "lib/utils";
import {
  BulkPrintableTip,
  BulkTipGiftCardContentsPreview,
} from "pages/tip-groups/[id]/print";
import React from "react";
import { BulkGiftCardTheme } from "types/BulkGiftCardTheme";

type BulkPrintDesignPickerProps = {
  tip: BulkPrintableTip;
  selectedTheme: BulkGiftCardTheme;
  setTheme(theme: BulkGiftCardTheme): void;
  backgroundUrl: string;
  setBackgroundUrl(backgroundUrl: string): void;
};

export function BulkPrintDesignPicker({
  tip,
  selectedTheme,
  setTheme,
  backgroundUrl,
  setBackgroundUrl,
}: BulkPrintDesignPickerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    setWidth(ref.current?.clientWidth || 0);
  }, [ref]);

  const cardWidth = width ? width / (isMobile ? 1 : 2) - 30 : undefined;

  return (
    <Card>
      <Card.Header css={{ pb: 0 }}>
        <Text h5>🎨 Choose your design</Text>
      </Card.Header>
      <Card.Body css={{ pt: 0 }} ref={ref}>
        <MobilePrintWarning />
        {cardWidth && (
          <Grid.Container gap={1} key={cardWidth}>
            {bulkGiftCardThemes.map((theme) => (
              <Grid key={theme.filename}>
                <div
                  style={{
                    width: cardWidth,
                    height: cardWidth * (133 / 200),
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => setTheme(theme)}
                >
                  {theme === selectedTheme && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 10,
                        borderRadius: "8px",
                        border: "4px solid #ffccaa",
                      }}
                    ></div>
                  )}
                  <BulkTipGiftCardContentsPreview tip={tip} theme={theme} />
                </div>
                <BulkTipDesignCredits theme={theme} />
              </Grid>
            ))}
          </Grid.Container>
        )}
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
      </Card.Body>
    </Card>
  );
}

type BulkTipDesignCreditsProps = {
  theme: BulkGiftCardTheme;
};
function BulkTipDesignCredits({ theme }: BulkTipDesignCreditsProps) {
  const { data: user } = usePublicUser(theme.userId);
  const publicProfileUrl = getPublicProfileUrl(theme.userId);
  return (
    <div style={{ marginBottom: "5px" }}>
      <Text
        size="small"
        css={{
          display: "inline",
          px: 4,
          py: 2,
          br: "8px",
        }}
      >
        {theme.filename} by{" "}
        <Link
          target="_blank"
          css={{ display: "inline" }}
          href={publicProfileUrl}
        >
          {user?.name || DEFAULT_NAME}
        </Link>
      </Text>
    </div>
  );
}
