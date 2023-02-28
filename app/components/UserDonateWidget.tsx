import { Row, Spacer } from "@nextui-org/react";
import { usePublicUser } from "hooks/usePublicUser";
import { getUserAvatarUrl } from "lib/utils";
import Script from "next/script";

type UserDonateWidgetProps = {
  userId: string;
};
export function UserDonateWidget({ userId }: UserDonateWidgetProps) {
  const { data: publicUser } = usePublicUser(userId, true);

  return publicUser?.lightningAddress ? (
    <>
      <Script src="https://embed.twentyuno.net/js/app.js" />
      <Spacer />
      <Row>
        <lightning-widget
          name=""
          style={{ width: "100%" }}
          accent="#2E74ED"
          to={publicUser.lightningAddress}
          image={getUserAvatarUrl(publicUser)}
        />
      </Row>
    </>
  ) : null;
}
