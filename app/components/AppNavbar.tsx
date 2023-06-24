import {
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon,
  BellIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  HomeIcon,
  InformationCircleIcon,
  LightBulbIcon,
  UserCircleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Link,
  Navbar,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { LanguagePicker } from "components/LanguagePicker";
import { NextImage } from "components/NextImage";
import { NextLink } from "components/NextLink";
import { useIsPWA } from "hooks/useIsPWA";
import { useNotifications } from "hooks/useNotifications";
import { useUser } from "hooks/useUser";
import { useUserRoles } from "hooks/useUserRoles";
import { PageRoutes } from "lib/PageRoutes";
import { getUserAvatarUrl } from "lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

const navbarCollapseToggleId = "app-navbar-collapse-toggle";

type CollapseItem = {
  name: string;
  href: string;
  reload?: boolean;
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

const reloadPage = () => window.location.reload();

export function AppNavbar() {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user } = useUser();
  const router = useRouter();
  const hideNavbarLinks =
    router.pathname.endsWith("/claim") || router.pathname.endsWith("/qr"); // || user?.inJourney;
  const { data: notifications } = useNotifications();
  const numNotifications =
    router.pathname === PageRoutes.notifications ||
    router.pathname.startsWith("/journey") ||
    router.pathname === PageRoutes.withdraw
      ? 0
      : notifications?.filter((notification) => !notification.read).length ?? 0;
  const isPWA = useIsPWA();
  const { data: userRoles } = useUserRoles();

  const collapseItems: CollapseItem[] = React.useMemo(
    () => [
      {
        name: "Home",
        href: !user ? PageRoutes.home : PageRoutes.dashboard,
        icon: <HomeIcon />,
      },
      {
        name: "Leaderboard",
        href: PageRoutes.leaderboard,
        icon: <ChartBarIcon />,
      },
      {
        name: "About",
        href: PageRoutes.about,
        icon: <InformationCircleIcon />,
      },
      {
        name: "Bitcoin Guide",
        href: PageRoutes.guide,
        icon: <LightBulbIcon />,
      },
      ...(isPWA
        ? [
            {
              name: "Refresh Application",
              href: PageRoutes.home,
              reload: true,
              icon: <ArrowPathIcon />,
            },
          ]
        : []),
      ...(userRoles?.some((role) => role.roleType === "SUPERADMIN")
        ? [
            {
              name: "Admin Dashboard",
              href: PageRoutes.admin,
              icon: <UserCircleIcon />,
            },
          ]
        : []),
    ],
    [user, isPWA, userRoles]
  );

  const isLoading =
    sessionStatus === "loading" ||
    (session && !user) ||
    router.pathname.startsWith(PageRoutes.verifySignin);

  const userAvatar = (
    <Avatar
      bordered
      as="button"
      color="primary"
      size="md"
      src={getUserAvatarUrl(user)}
    />
  );

  if (router.query["token"]) {
    // JWT auth from index page
    return null;
  }

  return (
    <Navbar
      variant="sticky"
      css={{
        backgroundColor: "$white",
        $$navbarBackgroundColor: "$white",
        visibility: isLoading ? "hidden" : undefined,
      }}
    >
      <Navbar.Content activeColor="primary">
        {router.pathname !== PageRoutes.dashboard &&
          router.pathname !== PageRoutes.home &&
          isPWA && (
            <Button auto light onClick={() => router.back()} css={{ px: 0 }}>
              <Icon>
                <ChevronLeftIcon />
              </Icon>
            </Button>
          )}
        {!hideNavbarLinks && (
          <Navbar.Toggle
            aria-label="toggle navigation"
            id={navbarCollapseToggleId}
          />
        )}
        <Navbar.Brand>
          <NextLink href={!user ? PageRoutes.home : PageRoutes.dashboard}>
            <a
              onClick={
                hideNavbarLinks
                  ? (e) => {
                      e.preventDefault();
                    }
                  : closeNavbar
              }
            >
              <NextImage
                alt="logo"
                src="/images/logo.svg"
                width={150}
                height={150}
              />
            </a>
          </NextLink>
        </Navbar.Brand>
        {!user && !hideNavbarLinks && (
          <>
            <Navbar.Link href={PageRoutes.about} hideIn="xs">
              About
            </Navbar.Link>
          </>
        )}
        {user?.userType === "tipper" && !hideNavbarLinks && (
          <>
            <Navbar.Link
              hideIn="xs"
              href={PageRoutes.guide}
              isActive={router.route.startsWith(PageRoutes.guide)}
            >
              <Icon>
                <BookOpenIcon />
              </Icon>
              &nbsp;Guide
            </Navbar.Link>
            <Navbar.Link
              hideIn="xs"
              href={PageRoutes.leaderboard}
              isActive={router.route === PageRoutes.leaderboard}
            >
              <Icon>
                <ChartBarIcon></ChartBarIcon>
              </Icon>
              &nbsp;Leaderboard
            </Navbar.Link>
          </>
        )}
      </Navbar.Content>

      {user && !hideNavbarLinks && (
        <>
          <Navbar.Content
            css={{
              jc: "flex-end",
            }}
          >
            <Dropdown placement="bottom-right">
              <Navbar.Item>
                <Dropdown.Trigger>
                  {numNotifications > 0 ? (
                    <div>
                      <Badge
                        color="error"
                        content={
                          <Icon width={16} height={16}>
                            <BellIcon />
                          </Icon>
                        }
                        css={{ p: 4 }}
                      >
                        {userAvatar}
                      </Badge>
                    </div>
                  ) : (
                    userAvatar
                  )}
                </Dropdown.Trigger>
              </Navbar.Item>
              <Dropdown.Menu
                aria-label="User menu actions"
                disabledKeys={["language"]}
                onAction={(key: React.Key) => {
                  if (key === PageRoutes.logout) {
                    (async () => {
                      await signOut({
                        callbackUrl: PageRoutes.home,
                      });
                    })();
                  } else {
                    router.push(key as string);
                  }
                }}
              >
                <Dropdown.Item
                  key={PageRoutes.notifications}
                  icon={
                    <Badge
                      color={numNotifications > 0 ? "error" : "primary"}
                      css={{ p: 4 }}
                    >
                      <Icon width={16} height={16}>
                        <BellIcon />
                      </Icon>
                    </Badge>
                  }
                >
                  <Row justify="space-between">
                    <Text color={numNotifications > 0 ? "error" : "primary"}>
                      Notifications
                    </Text>
                    {numNotifications > 0 && (
                      <Badge color="error">{numNotifications}</Badge>
                    )}
                  </Row>
                </Dropdown.Item>
                <Dropdown.Item
                  key={PageRoutes.profile}
                  icon={
                    <Badge color="primary" css={{ p: 4 }}>
                      <Icon width={16} height={16}>
                        <UserIcon />
                      </Icon>
                    </Badge>
                  }
                >
                  <Text color="primary">Profile</Text>
                </Dropdown.Item>
                <Dropdown.Item
                  key={PageRoutes.logout}
                  withDivider
                  icon={
                    <Badge color="default" css={{ p: 4 }}>
                      <Icon width={16} height={16}>
                        <ArrowLeftOnRectangleIcon />
                      </Icon>
                    </Badge>
                  }
                >
                  <Text color="default">Log out</Text>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Content>
        </>
      )}
      {!user && (
        <Navbar.Content>
          {!hideNavbarLinks && !router.pathname.startsWith(PageRoutes.signin) && (
            <Navbar.Item hideIn="xs">
              <NextLink href={PageRoutes.signin} passHref>
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
              <Link onClick={item.reload ? reloadPage : closeNavbar}>
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
