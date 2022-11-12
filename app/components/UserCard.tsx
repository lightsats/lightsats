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
  Spacer,
  Text,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { format } from "date-fns";
import { useScoreboardPosition } from "hooks/useScoreboardPosition";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import React from "react";
import useSWR from "swr";
import { PublicUser } from "types/PublicUser";

type Props = {
  userId: string;
  forceAnonymous?: boolean;
};

export function UserCard({ userId, forceAnonymous }: Props) {
  const { data: publicUser } = useSWR<PublicUser>(
    userId
      ? `/api/users/${userId}?publicProfile=true&forceAnonymous=${forceAnonymous}`
      : undefined,
    defaultFetcher
  );

  const shareProfile = React.useCallback(() => {
    navigator.share({
      url: `${Routes.users}/${userId}`,
      title: (publicUser?.name ?? DEFAULT_NAME) + " on Lightsats",
    });
  }, [userId, publicUser?.name]);

  const placing = useScoreboardPosition(userId);

  return (
    <Card>
      <Card.Body>
        {!publicUser ||
          (!placing && (
            <Loading type="spinner" color="currentColor" size="lg" />
          ))}
        {publicUser && (
          <>
            <Row align="center">
              <Avatar
                size="xl"
                zoomed
                bordered
                color="primary"
                src={getAvatarUrl(publicUser?.avatarURL ?? undefined)}
              />
              <Spacer x={0.75} />
              <Col span={10}>
                <Row>
                  <Text b>{publicUser.name ?? DEFAULT_NAME}</Text>
                </Row>
                <Row css={{ mt: -5, mb: 5 }}>
                  {publicUser.twitterUsername && (
                    <Text>
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
                </Row>
                <Row>
                  <Text small>
                    Joined {format(new Date(publicUser.created), "MMMM yyyy")}
                  </Text>
                </Row>
              </Col>
              <Button auto flat css={{ px: 8 }} onClick={shareProfile}>
                <Icon>
                  <ArrowUpTrayIcon />
                </Icon>
              </Button>
            </Row>
            <Divider y={2} />
            <Row>
              <Col>
                <Text size="small">Sent 👆</Text>
                <Text b>{publicUser.satsTipped} sats</Text>
              </Col>
              <Col>
                <Text size="small">Received 👇</Text>
                <Text b>{publicUser.numTipsReceived} tips</Text>
              </Col>
              <Col>
                <Text size="small">Leaderboard 🏆</Text>
                <Text b>
                  #{placing !== undefined && placing > 0 && placing}
                </Text>
              </Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
