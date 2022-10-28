import {
  ChartBarIcon,
  HomeIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Avatar, Button, Link, Navbar, Spacer, Text } from "@nextui-org/react";
import { User } from "@prisma/client";
import { Icon } from "components/Icon";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
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
  const isClaimUrl = router.pathname.endsWith("/claim");

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
            {
              name: "New Tip",
              href: Routes.newTip,
              icon: <PlusIcon />,
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
      {!isClaimUrl ? (
        <Navbar.Toggle
          aria-label="toggle navigation"
          id={navbarCollapseToggleId}
        />
      ) : (
        <Spacer x={1} />
      )}
      <Navbar.Content>
        <Navbar.Brand>
          <NextLink href={Routes.home}>
            <a onClick={closeNavbar}>
              <Text h1>Lightsats</Text>
            </a>
          </NextLink>
        </Navbar.Brand>
      </Navbar.Content>
      <Navbar.Content>
        {session ? (
          <NextLink href={Routes.profile}>
            <a>
              <Avatar
                bordered
                as="button"
                color="secondary"
                size="md"
                src={getUserAvatarUrl(user)}
              />
            </a>
          </NextLink>
        ) : (
          <Spacer x={1} />
        )}
      </Navbar.Content>

      <Navbar.Collapse>
        {collapseItems.map((item) => (
          <Navbar.CollapseItem key={item.name}>
            <NextLink href={item.href} passHref>
              <Link onClick={closeNavbar}>
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
