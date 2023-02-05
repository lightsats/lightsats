import { Text } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import { getRedeemUrl } from "lib/utils";
import React from "react";

type PassphraseProps = {
  passphrase: string;
  width: number;
  height: number;
  showInstructions?: boolean;
};

export function Passphrase({
  passphrase,
  width,
  height,
  showInstructions,
}: PassphraseProps) {
  const words = React.useMemo(() => passphrase.split(" "), [passphrase]);
  const sizeMultiplier = showInstructions ? 1 / 3 : 2 / 3;
  height *= Math.pow(words.length / 3, !showInstructions ? 1 : 0.75);

  return (
    <FlexBox
      style={{
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
        gap: width * 0.1 * sizeMultiplier,
      }}
    >
      {showInstructions && (
        <Text
          css={{
            fontSize: width * 0.08 + "px",
            textAlign: "center",
            mb: width * 0.05,
          }}
        >
          Enter these magic words at
          <br />
          <strong>{getRedeemUrl(true)}</strong>
          <br />
          to claim your bitcoin 👇
        </Text>
      )}
      {words.map((word, index) => (
        <Text
          b
          css={{
            fontSize: width * 0.3 * sizeMultiplier + "px",
            lineHeight: width * 0.45 * sizeMultiplier + "px",
            backgroundColor: "$accents2",
            width: width * 0.9,
            height: width * 0.5 * sizeMultiplier,
            textAlign: "center",
            borderRadius: width * 0.05,
          }}
          key={index}
        >
          {word}
        </Text>
      ))}
    </FlexBox>
  );
}
