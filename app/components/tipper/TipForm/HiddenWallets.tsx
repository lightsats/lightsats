import { Col, Text } from "@nextui-org/react";
import { SelectOption } from "components/CustomSelect";
import { wallets } from "lib/items/wallets";

export function HiddenWallets({
  recommendedWalletSelectOptions,
}: {
  recommendedWalletSelectOptions: SelectOption[];
}) {
  return recommendedWalletSelectOptions.length < wallets.length ? (
    <Col>
      <Text size="x-small">
        {wallets.length - recommendedWalletSelectOptions.length} wallets hidden:
      </Text>
      {wallets
        .filter(
          (wallet) =>
            !recommendedWalletSelectOptions.some(
              (recommendedWallet) => recommendedWallet.value === wallet.id
            )
        )
        .map((wallet) => (
          <Text key={wallet.id} size="x-small">
            {wallet.name} (
            {[
              ...(wallet.minBalance ? [`${wallet.minBalance} min sats`] : []),
              ...(wallet.features.indexOf("lnurl-auth") < 0
                ? [`lnurl-auth not supported`]
                : []),
            ].join(", ")}
            )
          </Text>
        ))}
    </Col>
  ) : null;
}
