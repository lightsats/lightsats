import { ClipboardIcon, EyeIcon, LinkIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Collapse,
  Input,
  Loading,
  Row,
  Spacer,
  Switch,
  Text,
} from "@nextui-org/react";

import { User } from "@prisma/client";
import { Alert } from "components/Alert";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { BecomeATipper } from "components/tippee/BecomeATipper";
import { UserCard } from "components/UserCard";
import copy from "copy-to-clipboard";
import { useReceivedTips } from "hooks/useTips";
import { useUser } from "hooks/useUser";
import { MAX_USER_NAME_LENGTH } from "lib/constants";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { KeyedMutator } from "swr";
import { UpdateUserRequest } from "types/UpdateUserRequest";

type ProfileFormData = {
  name: string;
  twitterUsername: string;
  avatarURL: string;
  lightningAddress: string;
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
  const { data: user, mutate: mutateUser } = useUser();

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
    toast.success("User ID Copied to clipboard");
  }, [user.id]);

  return (
    <>
      <Row>
        <UserCard userId={user.id} />
      </Row>
      <Spacer />

      {user.userType === "tipper" ? (
        <TipperProfile mutateUser={mutateUser} session={session} user={user} />
      ) : (
        <TippeeProfile />
      )}

      <Spacer />
      <Collapse
        bordered
        title={<Text b>🔗 Connected accounts & more</Text>}
        css={{ width: "100%" }}
      >
        <Row justify="space-between" align="center">
          <Text>{"📧 Email: "}</Text>
          {user.email ? (
            <Text b>{user.email}</Text>
          ) : (
            <NextLink href={`${Routes.emailSignin}?link=true`}>
              <a>
                <Button size="sm" auto>
                  Link&nbsp;
                  <Icon width={16} height={16}>
                    <LinkIcon />
                  </Icon>
                </Button>
              </a>
            </NextLink>
          )}
        </Row>
        {user.phoneNumber && (
          <Row justify="space-between" align="center">
            <Text>{"📱 Phone: "}</Text>
            <Text b>{user.phoneNumber}</Text>
          </Row>
        )}
        {user.lnurlPublicKey && (
          <Row justify="space-between" align="center">
            <Text>{"⚡ Wallet: "}</Text>
            <Text b>{user.lnurlPublicKey}</Text>
          </Row>
        )}
        <Spacer />
        <Row>
          <Text b>Lightsats User ID</Text>
        </Row>
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
      </Collapse>
    </>
  );
}

function TippeeProfile() {
  const { data: tips } = useReceivedTips();
  const hasWithdrawnTip = tips?.some((tip) => tip.status === "WITHDRAWN");

  return (
    <>
      {!hasWithdrawnTip && (
        <>
          <Alert>
            {
              "You've got some tips. Make sure to withdraw them before they expire."
            }
            &nbsp;&nbsp;
            <NextLink href={Routes.journeyClaimed} passHref>
              <a>
                <Button auto color="success">
                  Withdraw
                </Button>
              </a>
            </NextLink>
          </Alert>
          <Spacer />
        </>
      )}
      <BecomeATipper />
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
      lightningAddress: user.lightningAddress ?? undefined,
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
          lightningAddress: data.lightningAddress,
          isAnonymous: data.isAnonymous,
        };
        const result = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(updateUserRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          toast.success("Profile updated");
          await mutateUser();
          router.push(Routes.dashboard);
        } else {
          toast.error("Failed to update profile: " + result.statusText);
        }
        setSubmitting(false);
      })();
    },
    [isSubmitting, mutateUser, router, user.id]
  );

  return (
    <>
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
              bordered
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
              contentLeft="@"
              fullWidth
              bordered
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
              bordered
              type="url"
            />
          )}
        />
        <Spacer />
        <Controller
          name="lightningAddress"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Lightning Address"
              placeholder="reneaaron@getalby.com"
              fullWidth
              bordered
              type="email"
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
                <Text weight="medium">
                  Anonymise my info on scoreboard & public profile
                </Text>
                <Spacer />
                <Controller
                  name="isAnonymous"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
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
            <Loading color="currentColor" size="sm" />
          ) : (
            <>Update profile</>
          )}
        </Button>
      </form>
    </>
  );
}

export default Profile;
