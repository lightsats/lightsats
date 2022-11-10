import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Image,
  Link,
  Loading,
  Row,
  Text,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import useSWR from "swr";
import { PublicUser } from "types/PublicUser";
import { Scoreboard } from "types/Scoreboard";

type Props = {
  userId: string;
};

export function UserCard({ userId }: Props) {
  const { data: publicUser } = useSWR<PublicUser>(
    userId ? `/api/users/${userId}?publicProfile=true` : undefined,
    defaultFetcher
  );

  const { data: scoreboard } = useSWR<Scoreboard>(
    `/api/scoreboard`,
    defaultFetcher
  );

  const placing = scoreboard
    ? scoreboard.entries.findIndex((entry) => entry.isMe) + 1
    : undefined;

  return (
    <Card>
      <Card.Body>
        {!publicUser ||
          (!placing && (
            <Loading type="spinner" color="currentColor" size="lg" />
          ))}
        {publicUser && placing && (
          <>
            <Row align="center">
              <Col span={2}>
                <Avatar
                  src={getAvatarUrl(publicUser?.avatarURL ?? undefined)}
                />
              </Col>
              <Col span={10}>
                <Text b>{publicUser.name ?? DEFAULT_NAME}</Text>
                <br />
                {publicUser.twitterUsername && (
                  <Text size="smaller">
                    <Link
                      href={`https://twitter.com/${publicUser.twitterUsername}`}
                      target="_blank"
                    >
                      <Text>@{publicUser.twitterUsername}</Text>
                      &nbsp;
                      <Image
                        alt="twitter"
                        src="/icons/twitter.svg"
                        width={16}
                        height={16}
                      />
                    </Link>
                  </Text>
                )}
              </Col>
              <Col span={1}>
                <NextLink href={`${Routes.users}/${publicUser.id}`} passHref>
                  <a target="_blank">
                    <Button auto flat css={{ px: 8 }}>
                      <Icon>
                        <ArrowUpTrayIcon />
                      </Icon>
                    </Button>
                  </a>
                </NextLink>
              </Col>
            </Row>
            <Divider y={2} />
            <Row>
              <Col>
                <Text size="small">Sent 👆</Text>
                <Text b>{publicUser.satsDonated} sats</Text>
              </Col>
              <Col>
                <Text size="small">Received 👇</Text>
                <Text b>{publicUser.numTipsReceived} tips</Text>
              </Col>
              <Col>
                <Text size="small">Leaderboard 🏆</Text>
                <Text b>#{placing}</Text>
              </Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
