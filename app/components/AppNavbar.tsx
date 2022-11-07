import {
  ChartBarIcon,
  HomeIcon,
  InformationCircleIcon,
  LightBulbIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Dropdown,
  Image,
  Link,
  Navbar,
  Spacer,
} from "@nextui-org/react";
import { User } from "@prisma/client";
import { Icon } from "components/Icon";
import { LanguagePicker } from "components/LanguagePicker";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

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
  const { data: session } = useSession();
  const { data: user } = useSWR<User>(
    session ? `/api/users/${session.user.id}` : null,
    defaultFetcher
  );
  const router = useRouter();
  const hideNavbar = router.pathname.endsWith("/claim") || user?.inJourney;

  const collapseItems: CollapseItem[] = React.useMemo(
    () => [
      {
        name: "Home",
        href: Routes.home,
        icon: <HomeIcon />,
      },
      ...(user?.userType === "tipper"
        ? [
            {
              name: "New Tip",
              href: Routes.newTip,
              icon: <PlusIcon />,
            },
          ]
        : []),
      ...(user
        ? [
            {
              name: "Profile",
              href: Routes.profile,
              icon: <UserIcon />,
            },
          ]
        : []),
      {
        name: "Scoreboard",
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
    [user]
  );

  return (
    <Navbar variant="sticky">
      <Navbar.Content>
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
        <LanguagePicker />
        {!user && !hideNavbar && (
          <>
            <Navbar.Link href={Routes.features}>Features</Navbar.Link>
            <Navbar.Link href={Routes.about}>About</Navbar.Link>
          </>
        )}
        {user?.userType === "tipper" && !hideNavbar && (
          <Navbar.Item hideIn="xs">
            <NextLink href={Routes.newTip}>
              <a>
                <Button auto size="sm">
                  Create new tip
                </Button>
              </a>
            </NextLink>
          </Navbar.Item>
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
                    color="secondary"
                    size="md"
                    src={getUserAvatarUrl(user)}
                  />
                </Dropdown.Trigger>
              </Navbar.Item>
              <Dropdown.Menu
                aria-label="User menu actions"
                color="default"
                onAction={(actionKey) => console.log({ actionKey })}
              >
                <Dropdown.Item key="profile">
                  <NextLink href={Routes.profile} passHref>
                    <a>Profile</a>
                  </NextLink>
                </Dropdown.Item>
                <Dropdown.Item key="logout" withDivider color="error">
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Content>
        </>
      )}
      {!user && (
        <Navbar.Content>
          <Navbar.Link href={Routes.emailSignin}>Login</Navbar.Link>
          <Navbar.Item hideIn="xs">
            <NextLink href={Routes.signup}>
              <a>
                <Button auto flat>
                  Sign Up
                </Button>
              </a>
            </NextLink>
          </Navbar.Item>
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
