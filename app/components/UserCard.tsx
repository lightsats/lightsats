import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Image,
  Link,
  Row,
  Text,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { getAvatarUrl } from "lib/utils";
import { PublicUser } from "types/PublicUser";

type Props = {
  user: PublicUser;
};

export function UserCard(props: Props) {
  return (
    <Card>
      <Card.Body>
        <Row align="center">
          <Col span={2}>
            <Avatar src={getAvatarUrl(props.user.avatarURL ?? undefined)} />
          </Col>
          <Col span={10}>
            <Text b>{props.user.name ?? DEFAULT_NAME}</Text>
            <br />
            {props.user.twitterUsername && (
              <Text size="smaller">
                <Link
                  href={`https://twitter.com/${props.user.twitterUsername}`}
                  target="_blank"
                >
                  <Text>@{props.user.twitterUsername}</Text>
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
            <NextLink href={`${Routes.users}/${props.user.id}`} passHref>
              <a>
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
            <Text b>{props.user.satsDonated} sats</Text>
          </Col>
          <Col>
            <Text size="small">Received 👇</Text>
            <Text b>{props.user.numTipsReceived}</Text>
          </Col>
          <Col>
            <Text size="small">Leaderboard 🏆</Text>
            <Text b>#123</Text>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
