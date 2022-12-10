import {
  ArrowTopRightOnSquareIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Grid,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextImage } from "components/NextImage";
import { NextLink } from "components/NextLink";
import { UserAchievementsGrid } from "components/UserAchievements";
import copy from "copy-to-clipboard";
import { format } from "date-fns";
import { useLeaderboardPosition } from "hooks/useLeaderboardPosition";
import { usePublicUser } from "hooks/usePublicUser";
import { DEFAULT_NAME } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { getAppUrl, getUserAvatarUrl } from "lib/utils";
import React from "react";
import toast from "react-hot-toast";

type Props = {
  userId: string;
  forceAnonymous?: boolean;
  showViewButton?: boolean;
  showAchievements?: boolean;
};

export function UserCard({
  userId,
  forceAnonymous,
  showViewButton,
  showAchievements,
}: Props) {
  const { data: publicUser } = usePublicUser(userId, forceAnonymous);
  const publicProfileUrl = getAppUrl() + `${PageRoutes.users}/${userId}`;

  const shareProfile = React.useCallback(() => {
    (async () => {
      try {
        await navigator.share({
          url: publicProfileUrl,
          title: (publicUser?.name ?? DEFAULT_NAME) + " on Lightsats",
        });
      } catch (error) {
        copy(publicProfileUrl);
        toast.success("Copied link to clipboard");
      }
    })();
  }, [publicProfileUrl, publicUser?.name]);

  const placing = useLeaderboardPosition(
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
                  <ShareIcon />
                </Icon>
              </Button>
              {showViewButton && (
                <>
                  <Spacer x={0.5} />
                  <NextLink href={publicProfileUrl}>
                    <a target="_blank">
                      <Button auto flat css={{ px: 8 }}>
                        <Icon>
                          <ArrowTopRightOnSquareIcon />
                        </Icon>
                      </Button>
                    </a>
                  </NextLink>
                </>
              )}
            </Row>
            <Spacer y={0.5} />
            <Divider y={1} />
            <Grid.Container gap={2}>
              <Grid xs={6} sm={3}>
                <Col
                  css={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Text size="small">Sent 👆</Text>
                  <Text b>{publicUser.satsTipped} sats</Text>
                </Col>
              </Grid>
              <Grid xs={6} sm={3}>
                <Col
                  css={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Text size="small">Received 👇</Text>
                  <Text b>{publicUser.numTipsReceived} tips</Text>
                </Col>
              </Grid>
              <NextLink href={PageRoutes.leaderboard} passHref>
                <Grid xs={6} sm={3} as="a">
                  <Col
                    css={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Text size="small" color="$black">
                      Leaderboard 🏅
                    </Text>

                    <Text
                      b={placing !== undefined}
                      size={placing === undefined ? "small" : undefined}
                    >
                      {placing !== undefined ? (
                        <>#{placing}</>
                      ) : (
                        "No placing yet"
                      )}
                    </Text>
                  </Col>
                </Grid>
              </NextLink>
              <NextLink
                href={`${PageRoutes.users}/${userId}#achievements`}
                passHref
              >
                <Grid xs={6} sm={3} as="a">
                  <Col
                    css={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Text size="small" color="$black">
                      Achievements 🏆
                    </Text>
                    <Text
                      b={placing !== undefined}
                      size={placing === undefined ? "small" : undefined}
                    >
                      {publicUser.achievementTypes.length}
                    </Text>
                  </Col>
                </Grid>
              </NextLink>
            </Grid.Container>
          </>
        )}
        {showAchievements && (publicUser?.achievementTypes.length ?? 0 > 0) && (
          <>
            <Divider />
            <NextLink
              href={`${PageRoutes.users}/${userId}#achievements`}
              passHref
            >
              <a>
                <UserAchievementsGrid userId={userId} small />
              </a>
            </NextLink>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
