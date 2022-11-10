import {
  Badge,
  Loading,
  Row,
  Spacer,
  Text,
  User as NextUIUser,
} from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { TwitterButton } from "components/TwitterButton";
import { formatDistance } from "date-fns";
import { DEFAULT_NAME } from "lib/constants";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import { useRouter } from "next/router";
import useSWR from "swr";
import { PublicUser } from "types/PublicUser";

export default function UserPublicProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: publicUser } = useSWR<PublicUser>(
    id ? `/api/users/${id}?publicProfile=true` : undefined,
    defaultFetcher
  );

  if (!publicUser) {
    return (
      <>
        <Loading type="points" color="currentColor" size="sm" />
      </>
    );
  }

  return (
    <>
      <Row align="center">
        <NextUIUser
          src={getAvatarUrl(
            publicUser.avatarURL ?? undefined,
            publicUser.fallbackAvatarId
          )}
          name={publicUser.name ?? DEFAULT_NAME}
        />
        {publicUser.twitterUsername && (
          <>
            <TwitterButton username={publicUser.twitterUsername} />
            <Spacer x={0.5} />
          </>
        )}
        <Badge color={publicUser.userType === "tippee" ? "success" : "primary"}>
          {publicUser.userType.toUpperCase()}
        </Badge>
      </Row>
      <Spacer />
      <Row>
        <Text small>
          Joined Lightsats{" "}
          {formatDistance(Date.now(), new Date(publicUser.created))} ago
        </Text>
      </Row>
      <Spacer />
      <Row>
        <Badge color={"default"}>
          {publicUser.numTipsReceived} tips received
        </Badge>
        <Spacer />
        <Badge color={"default"}>{publicUser.numTipsSent} tips sent</Badge>
        <Spacer />
        <Badge color={"default"}>{publicUser.satsDonated} sats donated</Badge>
      </Row>

      <Spacer y={8} />
      <BackButton />
    </>
  );
}
