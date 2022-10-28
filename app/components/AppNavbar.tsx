import { ChartBarIcon, HomeIcon, UserIcon } from "@heroicons/react/24/solid";
import { Avatar, Button, Link, Navbar, Spacer, Text } from "@nextui-org/react";
import { User } from "@prisma/client";
import { Icon } from "components/Icon";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import React from "react";
import useSWR from "swr";

const navbarCollapseToggleId = "app-navbar-collapse-toggle";

type CollapseItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

// FIXME: this is a hacky way to close the NextUI collapse. https://github.com/nextui-org/nextui/issues/752
const toggleNavbar = () => {
  const toggle = document.getElementById(navbarCollapseToggleId);
  if (toggle?.getAttribute("aria-pressed") === "true") {
    toggle?.click();
  }
};

export function AppNavbar() {
  const { data: session } = useSession();
  const { data: user } = useSWR<User>(
    session ? `/api/users/${session.user.id}` : null,
    defaultFetcher
  );

  const collapseItems: CollapseItem[] = React.useMemo(
    () => [
      {
        name: "Home",
        href: Routes.home,
        icon: <HomeIcon />,
      },
      ...(session
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
    ],
    [session]
  );

  return (
    <Navbar variant="static">
      <Navbar.Toggle
        aria-label="toggle navigation"
        id={navbarCollapseToggleId}
      />
      <Navbar.Content>
        <Navbar.Brand>
          <NextLink href={Routes.home}>
            <a onClick={toggleNavbar}>
              <Text h1>Lightsats</Text>
            </a>
          </NextLink>
        </Navbar.Brand>
      </Navbar.Content>
      <Navbar.Content>
        {session ? (
          <NextLink href={Routes.profile}>
            <Avatar
              bordered
              as="button"
              color="secondary"
              size="md"
              src={getUserAvatarUrl(user)}
            />
          </NextLink>
        ) : (
          <Spacer x={1} />
        )}
      </Navbar.Content>

      <Navbar.Collapse>
        {collapseItems.map((item) => (
          <Navbar.CollapseItem key={item.name}>
            <NextLink href={item.href} passHref>
              <Link onClick={toggleNavbar}>
                <Button flat icon={<Icon>{item.icon}</Icon>} auto />
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
