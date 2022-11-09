import {
  ArrowUpTrayIcon,
  ClipboardIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
  Switch,
  Text,
} from "@nextui-org/react";
import { Tip, User } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { Divider } from "components/Divider";
import { FlexBox } from "components/FlexBox";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { notifyError, notifySuccess } from "components/Toasts";
import copy from "copy-to-clipboard";
import { DEFAULT_NAME, MAX_USER_NAME_LENGTH } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR, { KeyedMutator } from "swr";
import { TransitionUserRequest } from "types/TransitionUserRequest";
import { UpdateUserRequest } from "types/UpdateUserRequest";

type ProfileFormData = {
  name: string;
  twitterUsername: string;
  avatarURL: string;
  isAnonymous: boolean;
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

const Profile: NextPage = () => {
  const { data: session } = useSession();
  const { data: user, mutate: mutateUser } = useSWR<User>(
    session ? `/api/users/${session.user.id}` : null,
    defaultFetcher
  );

  if (!session || !user) {
    return null;
  }
  return (
    <ProfileInternal mutateUser={mutateUser} session={session} user={user} />
  );
};

type ProfileInternalProps = {
  mutateUser: KeyedMutator<User>;
  session: Session;
  user: User;
};

function ProfileInternal({ mutateUser, session, user }: ProfileInternalProps) {
  const copyUserId = React.useCallback(() => {
    copy(user.id);
    notifySuccess("User ID Copied to clipboard");
  }, [user.id]);

  const copyPublicProfile = React.useCallback(() => {
    const url = `${window.location.origin}${Routes.users}/${user.id}`;
    copy(url);
    notifySuccess("Public profile URL copied to clipboard");
  }, [user.id]);

  return (
    <>
      <Row>
        <Avatar src={getUserAvatarUrl(user)} />
        <Spacer x={0.5} />
        <Col>
          <Text b>{user.name ?? DEFAULT_NAME}</Text>
          <Row align="center">
            <Text>
              @{user.id.slice(0, 6)}...{user.id.slice(user.id.length - 6)}{" "}
            </Text>
            <Spacer x={0.25} />
            <Button
              auto
              light
              color="primary"
              size="sm"
              css={{ p: 0 }}
              onClick={copyUserId}
            >
              <Icon width={16} height={16}>
                <ClipboardIcon />
              </Icon>
            </Button>
          </Row>
        </Col>
        <FlexBox style={{ alignSelf: "center" }}>
          <NextLink href={`${Routes.users}/${user.id}`} passHref>
            <a>
              <Button auto flat css={{ px: 8 }} onClick={copyPublicProfile}>
                <Icon>
                  <ArrowUpTrayIcon />
                </Icon>
              </Button>
            </a>
          </NextLink>
        </FlexBox>
      </Row>
      <Divider />

      {user.userType === "tipper" ? (
        <TipperProfile mutateUser={mutateUser} session={session} user={user} />
      ) : (
        <TippeeProfile mutateUser={mutateUser} session={session} user={user} />
      )}

      <Spacer />
      <Row>
        <Text b>Connected accounts</Text>
      </Row>
      <Row>
        <Text>
          {user.email && "Email: " + user.email}
          {user.phoneNumber && "Phone: " + user.phoneNumber}
          {user.lnurlPublicKey && "Wallet: " + user.lnurlPublicKey}
        </Text>
      </Row>
      <Spacer />
      <BackButton />
    </>
  );
}

function TippeeProfile({ mutateUser, session, user }: ProfileInternalProps) {
  const { data: tips } = useSWR<Tip[]>(
    session ? `/api/tippee/tips` : null,
    defaultFetcher
  );
  const hasWithdrawnTip = tips?.some((tip) => tip.status === "WITHDRAWN");
  const [isSubmitting, setSubmitting] = React.useState(false);

  const becomeTipper = React.useCallback(() => {
    if (isSubmitting) {
      throw new Error("Already submitting");
    }
    setSubmitting(true);

    (async () => {
      const transitionRequest: TransitionUserRequest = {
        to: "tipper",
      };
      const result = await fetch(`/api/users/${user.id}/transition`, {
        method: "POST",
        body: JSON.stringify(transitionRequest),
        headers: { "Content-Type": "application/json" },
      });
      if (result.ok) {
        await mutateUser();
      } else {
        notifyError("Failed to update profile: " + result.statusText);
      }
      setSubmitting(false);
    })();
  }, [isSubmitting, mutateUser, user.id]);

  return (
    <>
      {!hasWithdrawnTip && (
        <>
          <Text>
            {"It looks like you haven't completed your withdrawal yet."}
          </Text>
          <NextLink href={Routes.journeyClaimed} passHref>
            <Link css={{ display: "inline" }}>Complete withdrawal</Link>
          </NextLink>
        </>
      )}
      <Text>Orange pill your friends!</Text>
      <Button
        color="primary"
        size="lg"
        onClick={becomeTipper}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loading type="points" color="currentColor" size="sm" />
        ) : (
          <>Become a Tipper</>
        )}
      </Button>
    </>
  );
}

function TipperProfile({ mutateUser, user }: ProfileInternalProps) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = React.useState(false);

  const { control, handleSubmit, setFocus } = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name ?? undefined,
      twitterUsername: user.twitterUsername ?? undefined,
      avatarURL: user.avatarURL ?? undefined,
      isAnonymous: user.isAnonymous,
    },
  });

  React.useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  const onSubmit = React.useCallback(
    (data: ProfileFormData) => {
      if (isSubmitting) {
        throw new Error("Already submitting");
      }
      setSubmitting(true);

      (async () => {
        const updateUserRequest: UpdateUserRequest = {
          name: data.name,
          twitterUsername: data.twitterUsername,
          avatarURL: data.avatarURL,
          isAnonymous: data.isAnonymous,
        };
        const result = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(updateUserRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          notifySuccess("Profile updated");
          await mutateUser();
          router.push(Routes.home);
        } else {
          notifyError("Failed to update profile: " + result.statusText);
        }
        setSubmitting(false);
      })();
    },
    [isSubmitting, mutateUser, router, user.id]
  );

  return (
    <>
      <Text size="small">
        Fill out the fields below to increase the authenticity of your tips and
        provide a way for tippees to contact you.
      </Text>
      <Spacer />
      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Your Name"
              placeholder="John Galt"
              fullWidth
              maxLength={MAX_USER_NAME_LENGTH}
            />
          )}
        />
        <Spacer />
        <Controller
          name="twitterUsername"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Twitter Username"
              placeholder="jack"
              fullWidth
              contentLeft="@"
              css={{
                fontWeight: "bold",
                ".nextui-input-content--left": {
                  pr: 0,
                },
              }}
            />
          )}
        />
        <Spacer />
        <Controller
          name="avatarURL"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Avatar URL"
              placeholder="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
              fullWidth
              type="url"
            />
          )}
        />
        <Spacer />
        <Row>
          <Card variant="bordered">
            <Card.Body css={{ backgroundColor: "$accents0" }}>
              <Row align="center" justify="center">
                <Icon>
                  <EyeIcon />
                </Icon>
                <Spacer x={0.5} />
                <Text weight="medium">Anonymise my info on scoreboards</Text>
                <Spacer />
                <Controller
                  name="isAnonymous"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      color="success"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </Row>
            </Card.Body>
          </Card>
        </Row>

        <Spacer />
        <Button type="submit" disabled={isSubmitting} css={{ width: "100%" }}>
          {isSubmitting ? (
            <Loading type="points" color="currentColor" size="sm" />
          ) : (
            <>Update Profile</>
          )}
        </Button>
      </form>
    </>
  );
}

export default Profile;
