import { BellIcon } from "@heroicons/react/24/solid";
import { Button, Card, Col, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { useNotifications } from "hooks/useNotifications";
import type { NextPage } from "next";
import Head from "next/head";

const NotificationsPage: NextPage = () => {
  const notifications = useNotifications();
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Notifications</title>
      </Head>
      <h2>Notifications</h2>
      {notifications.length ? (
        <Grid.Container gap={1}>
          {notifications.map((notification) => (
            <Grid key={notification.title} xs={12}>
              <NextLink href={notification.href}>
                <a style={{ width: "100%" }}>
                  <Card css={{ width: "100%" }}>
                    <Card.Body>
                      <Row align="center">
                        <Button
                          color="error"
                          auto
                          flat
                          css={{ px: 18 }}
                          size="xl"
                        >
                          <Icon>
                            <BellIcon />
                          </Icon>
                        </Button>
                        <Spacer />
                        <Col>
                          <Row>
                            <Text b>{notification.title}</Text>
                          </Row>
                          <Row>
                            <Text>{notification.description}</Text>
                          </Row>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </a>
              </NextLink>
            </Grid>
          ))}
        </Grid.Container>
      ) : (
        <Text>
          {
            "It looks like you don't have any notifications yet. Check back soon!"
          }
        </Text>
      )}
    </>
  );
};

export default NotificationsPage;
