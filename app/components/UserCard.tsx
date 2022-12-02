import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextImage } from "components/NextImage";
import copy from "copy-to-clipboard";
import { format } from "date-fns";
import { usePublicUser } from "hooks/usePublicUser";
import { useScoreboardPosition } from "hooks/useScoreboardPosition";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { getAppUrl, getUserAvatarUrl } from "lib/utils";
import React from "react";
import toast from "react-hot-toast";

type Props = {
  userId: string;
  forceAnonymous?: boolean;
};

export function UserCard({ userId, forceAnonymous }: Props) {
  const { data: publicUser } = usePublicUser(userId, forceAnonymous);

  const shareProfile = React.useCallback(() => {
    const url = getAppUrl() + `${Routes.users}/${userId}`;
    (async () => {
      try {
        await navigator.share({
          url,
          title: (publicUser?.name ?? DEFAULT_NAME) + " on Lightsats",
        });
      } catch (error) {
        copy(url);
        toast.success("Copied link to clipboard");
      }
    })();
  }, [userId, publicUser?.name]);

  const placing = useScoreboardPosition(
    publicUser?.userType === "tipper" ? userId : undefined
  );

  return (
    <Card css={{ dropShadow: "$sm" }}>
      <Card.Body>
        {!publicUser && <Loading color="currentColor" size="lg" />}
        {publicUser && (
          <>
            <Row align="center">
              <Avatar
                size="xl"
                zoomed
                bordered
                color="primary"
                src={getUserAvatarUrl(publicUser)}
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
                        <NextImage
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
                <Text
                  b={placing !== undefined}
                  size={placing === undefined ? "small" : undefined}
                >
                  {placing !== undefined ? <>#{placing}</> : "No placing yet"}
                </Text>
              </Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
