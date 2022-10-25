import {
  Button,
  Checkbox,
  Input,
  Loading,
  Spacer,
  Text,
  User as NextUIUser,
} from "@nextui-org/react";
import { User } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { appName, DEFAULT_NAME, MAX_USER_NAME_LENGTH } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR, { KeyedMutator } from "swr";
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

function ProfileInternal({
  mutateUser,
  session,
  user,
}: {
  mutateUser: KeyedMutator<User>;
  session: Session;
  user: User;
}) {
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

  const executeSignout = React.useCallback(() => {
    signOut({
      redirect: false,
    });
    router.push(Routes.home);
  }, [router]);

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
          await mutateUser();
          router.push(Routes.home);
        } else {
          alert("Failed to update profile: " + result.statusText);
        }
        setSubmitting(false);
      })();
    },
    [isSubmitting, mutateUser, router, user.id]
  );

  return (
    <>
      <NextUIUser
        src={user.avatarURL ?? undefined}
        name={user.name ?? DEFAULT_NAME}
      />
      <Spacer />
      <Text
        style={{
          maxWidth: "300px",
          wordBreak: "break-all",
          textAlign: "center",
        }}
      >
        Logged in as {session.user.email ?? session.user.lnurlPublicKey}
      </Text>
      <Spacer />
      <Button color="error" size="xs" onClick={executeSignout}>
        Sign out
      </Button>
      <Spacer />
      <Text style={{ textAlign: "center", maxWidth: "350px" }}>
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
              label="Name"
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
        <Controller
          name="isAnonymous"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              value={undefined}
              isSelected={field.value}
              label="Anonymous on scoreboard"
              size="sm"
            />
          )}
        />

        <Spacer />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loading type="points" color="currentColor" size="sm" />
          ) : (
            <>Update Profile</>
          )}
        </Button>
      </form>
        <Spacer />
        <Text
        size="small"
        style={{
          maxWidth: "300px",
          wordBreak: "break-all",
          textAlign: "center",
        }}
      >
        {appName} user ID: {session.user.id}
      </Text>
      <Spacer/>
      <BackButton />
    </>
  );
}

export default Profile;
