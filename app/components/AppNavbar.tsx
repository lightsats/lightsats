import {
  BookOpenIcon,
  ChartBarIcon,
  HomeIcon,
  InformationCircleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Dropdown,
  Image,
  Link,
  Navbar,
  Spacer,
  Text,
} from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import { Icon } from "components/Icon";
import { LanguagePicker } from "components/LanguagePicker";
import { NextLink } from "components/NextLink";
import { useUser } from "hooks/useUser";
import { Routes } from "lib/Routes";
import { getUserAvatarUrl } from "lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

const navbarCollapseToggleId = "app-navbar-collapse-toggle";

type CollapseItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

// FIXME: this is a hacky way to close the NextUI collapse. https://github.com/nextui-org/nextui/issues/752
// TODO: check the navbar after route change and end early, rather than a fixed 500ms delay
const closeNavbar = () => {
  setTimeout(() => {
    const toggle = document.getElementById(navbarCollapseToggleId);
    if (toggle?.getAttribute("aria-pressed") === "true") {
      toggle?.click();
    }
  }, 500);
};

export function AppNavbar() {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user } = useUser();
  const router = useRouter();
  const hideNavbar = router.pathname.endsWith("/claim"); // || user?.inJourney;

  const collapseItems: CollapseItem[] = React.useMemo(
    () => [
      {
        name: "Home",
        href: Routes.home,
        icon: <HomeIcon />,
      },
      {
        name: "Leaderboard",
        href: Routes.scoreboard,
        icon: <ChartBarIcon />,
      },
      {
        name: "About",
        href: Routes.about,
        icon: <InformationCircleIcon />,
      },
      {
        name: "Bitcoin Guide",
        href: Routes.guide,
        icon: <LightBulbIcon />,
      },
    ],
    []
  );

  if (sessionStatus === "loading" || (session && !user)) {
    return null;
  }

  return (
    <Navbar
      variant="sticky"
      css={{ backgroundColor: "$white", $$navbarBackgroundColor: "$white" }}
    >
      <Navbar.Content activeColor="primary">
        {!hideNavbar && (
          <Navbar.Toggle
            aria-label="toggle navigation"
            id={navbarCollapseToggleId}
          />
        )}
        <Navbar.Brand>
          <NextLink href={Routes.home}>
            <a
              onClick={
                hideNavbar
                  ? (e) => {
                      e.preventDefault();
                    }
                  : closeNavbar
              }
            >
              <Image alt="logo" src="/images/logo.svg" width={150} />
            </a>
          </NextLink>
        </Navbar.Brand>
        {!user && !hideNavbar && (
          <>
            <Navbar.Link href={Routes.about} hideIn="xs">
              About
            </Navbar.Link>
          </>
        )}
        {user?.userType === "tipper" && !hideNavbar && (
          <>
            <Navbar.Link
              hideIn="xs"
              href={Routes.guide}
              isActive={router.route.startsWith(Routes.guide)}
            >
              <Icon>
                <BookOpenIcon />
              </Icon>
              &nbsp;Guide
            </Navbar.Link>
            <Navbar.Link
              hideIn="xs"
              href={Routes.scoreboard}
              isActive={router.route === Routes.scoreboard}
            >
              <Icon>
                <ChartBarIcon></ChartBarIcon>
              </Icon>
              &nbsp;Leaderboard
            </Navbar.Link>
          </>
        )}
      </Navbar.Content>

      {user && !hideNavbar && (
        <>
          <Navbar.Content
            css={{
              jc: "flex-end",
            }}
          >
            <Dropdown placement="bottom-right">
              <Navbar.Item>
                <Dropdown.Trigger>
                  <Avatar
                    bordered
                    as="button"
                    color="primary"
                    size="md"
                    src={getUserAvatarUrl(user)}
                  />
                </Dropdown.Trigger>
              </Navbar.Item>
              <Dropdown.Menu
                aria-label="User menu actions"
                disabledKeys={["language"]}
              >
                <Dropdown.Item key="language">
                  <FlexBox
                    style={{
                      flexDirection: "row",

                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    Language&nbsp;
                    <LanguagePicker />
                  </FlexBox>
                </Dropdown.Item>
                <Dropdown.Item key="profile">
                  <NextLink href={Routes.profile} passHref>
                    <a>
                      <Text color="primary">Profile</Text>
                    </a>
                  </NextLink>
                </Dropdown.Item>
                <Dropdown.Item key="logout" withDivider>
                  <NextLink href={Routes.logout} passHref>
                    <a>
                      <Text color="error">Log out</Text>
                    </a>
                  </NextLink>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Content>
        </>
      )}
      {!user && (
        <Navbar.Content>
          {!hideNavbar && (
            <Navbar.Item hideIn="xs">
              <NextLink href={Routes.login} passHref>
                <a>
                  <Button auto>Get started</Button>
                </a>
              </NextLink>
            </Navbar.Item>
          )}
          <LanguagePicker />
        </Navbar.Content>
      )}
      <Navbar.Collapse>
        {collapseItems.map((item, index) => (
          <Navbar.CollapseItem
            activeColor="secondary"
            key={item.name}
            css={{
              color: index === collapseItems.length - 1 ? "$error" : "",
            }}
            isActive={index === 2}
          >
            <Link
              color="inherit"
              css={{
                minWidth: "100%",
              }}
              href="#"
            >
              {item.name}
            </Link>
          </Navbar.CollapseItem>
        ))}
      </Navbar.Collapse>
      <Navbar.Collapse>
        {collapseItems.map((item) => (
          <Navbar.CollapseItem key={item.name}>
            <NextLink href={item.href} passHref>
              <Link onClick={closeNavbar}>
                <Button flat auto css={{ px: 8 }}>
                  <Icon>{item.icon}</Icon>
                </Button>
                <Spacer />
                {item.name}
              </Link>
            </NextLink>
          </Navbar.CollapseItem>
        ))}
      </Navbar.Collapse>
    </Navbar>
  );
}
