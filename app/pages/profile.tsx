import {
  Button,
  Input,
  Loading,
  Spacer,
  Text,
  User as NextUIUser,
} from "@nextui-org/react";
import { User } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { MAX_USER_NAME_LENGTH } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR, { KeyedMutator } from "swr";
import { UpdateUserRequest } from "types/UpdateUserRequest";

type ProfileFormData = {
  name: string;
  twitterUsername: string;
  avatarURL: string;
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
      <NextUIUser src={user.avatarURL ?? undefined} name={user.name} />
      <Spacer />
      <Text>Logged in as {session.user.email}</Text>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loading type="points" color="currentColor" size="sm" />
          ) : (
            <>Update Profile</>
          )}
        </Button>
        <Spacer />
      </form>
      <BackButton />
    </>
  );
}

export default Profile;
