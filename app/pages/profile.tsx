import {
  CheckIcon,
  ClipboardIcon,
  EyeIcon,
  LinkIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Col,
  Collapse,
  Input,
  Link,
  Loading,
  Progress,
  Row,
  Spacer,
  Switch,
  Text,
} from "@nextui-org/react";

import { User } from "@prisma/client";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { Divider } from "components/Divider";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { BecomeATipper } from "components/tippee/BecomeATipper";
import { WithdrawSuggestion } from "components/tippee/WithdrawSuggestion";
import { UserCard } from "components/UserCard";
import copy from "copy-to-clipboard";
import { useReceivedTips } from "hooks/useTips";
import { useUser } from "hooks/useUser";
import { MAX_USER_NAME_LENGTH } from "lib/constants";
import { getStaticProps } from "lib/i18n/i18next";
import { getNativeLanguageName } from "lib/i18n/iso6391";
import { DEFAULT_LOCALE, locales } from "lib/i18n/locales";
import { PageRoutes } from "lib/PageRoutes";
import { hasTipExpired } from "lib/utils";
import type { NextPage } from "next";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { KeyedMutator } from "swr";
import { DeleteLinkedAccountRequest } from "types/DeleteLinkedAccountRequest";
import { UpdateUserRequest } from "types/UpdateUserRequest";

export const connectedAccountsElementId = "connected-accounts";

type ProfileFormData = {
  name: string;
  locale: string;
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

const formFieldIds = {
  name: "name",
  avatarURL: "avatarURL",
  lightningAddress: "lightningAddress",
  email: connectedAccountsElementId,
};

const localeSelectOptions: SelectOption[] = locales.map((locale) => ({
  value: locale,
  label: getNativeLanguageName(locale),
}));

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
  const [connectedAccountsExpanded, setConnectedAccountsExpanded] =
    React.useState(false);
  const [highlightConnectedAccounts, setHighlightConnectedAccounts] =
    React.useState(false);

  const openConnectedAccounts = React.useCallback(() => {
    setConnectedAccountsExpanded(true);
    setTimeout(() => {
      document
        .getElementById(window.location.hash.substring(1))
        ?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        setHighlightConnectedAccounts(true);
        setTimeout(() => {
          setHighlightConnectedAccounts(false);
        }, 1000);
      }, 500);
    }, 1000);
  }, []);

  React.useEffect(() => {
    if (window.location.hash) {
      openConnectedAccounts();
    }
  }, [openConnectedAccounts]);

  return (
    <>
      <Row>
        <UserCard userId={user.id} showViewButton showAchievements />
      </Row>
      <Spacer />
      {user.userType === "tipper" && (
        <CompleteYourProfile openConnectedAccounts={openConnectedAccounts} />
      )}

      <UpdateProfileForm
        mutateUser={mutateUser}
        session={session}
        user={user}
      />

      {user.userType === "tippee" && <TippeeProfile />}

      <Spacer />
      <Collapse
        bordered
        title={<Text b>🔗 Connected accounts & more</Text>}
        css={{
          width: "100%",
          background: highlightConnectedAccounts ? "$primary" : "$white",
          transition: "background 0.5s",
        }}
        expanded={connectedAccountsExpanded}
      >
        <div id={connectedAccountsElementId} />
        <Row justify="space-between">
          <Col span={8}>
            <Text b>{"📧 Email"}</Text>
            {user.email && <Text>{user.email}</Text>}
          </Col>
          <Col span={4} css={{ d: "flex", justifyContent: "flex-end" }}>
            {user.email ? (
              <>
                <UnlinkButton
                  accountType="email"
                  mutateUser={mutateUser}
                  user={user}
                />
              </>
            ) : (
              <LinkButton route={PageRoutes.emailSignin} />
            )}
          </Col>
        </Row>
        <Divider />
        {user.phoneNumber && (
          <>
            <Row justify="space-between">
              <Col span={8}>
                <Text b>{"📱 Phone"}</Text>
                <Text>{user.phoneNumber}</Text>
              </Col>
              <Col span={4} css={{ d: "flex", justifyContent: "flex-end" }}>
                {user.email ? (
                  <>
                    <UnlinkButton
                      accountType="phoneNumber"
                      mutateUser={mutateUser}
                      user={user}
                    />
                  </>
                ) : (
                  <LinkButton route={PageRoutes.emailSignin} />
                )}
              </Col>
            </Row>
            <Divider />
          </>
        )}
        <Row justify="space-between">
          <Col span={8}>
            <Text b>{"⚡ Wallet "}</Text>
            {user.lnurlPublicKey && (
              <Text>
                {user.lnurlPublicKey.slice(0, 10)}...
                {user.lnurlPublicKey.slice(user.lnurlPublicKey.length - 10)}
              </Text>
            )}
          </Col>
          <Col span={4} css={{ d: "flex", justifyContent: "flex-end" }}>
            {user.lnurlPublicKey ? (
              <UnlinkButton
                accountType="lnurlPublicKey"
                mutateUser={mutateUser}
                user={user}
              />
            ) : (
              <LinkButton route={PageRoutes.lnurlAuthSignin} />
            )}
          </Col>
        </Row>
        <Divider />
        <Row>
          <Text b>Lightsats User ID</Text>
        </Row>
        <Row align="center">
          <Text>
            @{user.id.slice(0, 10)}...{user.id.slice(user.id.length - 10)}
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
  const hasWithdrawableTip = tips?.some(
    (tip) => tip.status === "CLAIMED" && !hasTipExpired(tip)
  );

  return (
    <>
      <Spacer />
      {hasWithdrawableTip && (
        <>
          <WithdrawSuggestion />
          <Spacer />
        </>
      )}
      {!hasWithdrawableTip && <BecomeATipper />}
    </>
  );
}

function UpdateProfileForm({ mutateUser, user }: ProfileInternalProps) {
  const [isSubmitting, setSubmitting] = React.useState(false);

  const { control, handleSubmit, setFocus, watch, setValue } =
    useForm<ProfileFormData>({
      defaultValues: {
        name: user.name ?? undefined,
        locale: user.locale ?? DEFAULT_LOCALE,
        twitterUsername: user.twitterUsername ?? undefined,
        avatarURL: user.avatarURL ?? undefined,
        lightningAddress: user.lightningAddress ?? undefined,
        isAnonymous: user.isAnonymous,
      },
    });

  React.useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  const watchedLocale = watch("locale");

  const setDropdownSelectedLocale = React.useCallback(
    (locale: string) => {
      setValue("locale", locale);
    },
    [setValue]
  );

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
          locale: data.locale,
        };
        const result = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(updateUserRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          toast.success("Profile updated");
          await mutateUser();
        } else {
          toast.error("Failed to update profile: " + result.statusText);
        }
        setSubmitting(false);
      })();
    },
    [isSubmitting, mutateUser, user.id]
  );

  return (
    <>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
            <Row justify="space-between" align="flex-end">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Your Name"
                    placeholder="John Galt"
                    id={formFieldIds.name}
                    fullWidth
                    maxLength={MAX_USER_NAME_LENGTH}
                    bordered
                  />
                )}
              />
              <Spacer />
              <CustomSelect
                options={localeSelectOptions}
                defaultValue={watchedLocale}
                onChange={setDropdownSelectedLocale}
                width="100px"
              />
            </Row>
            {user.userType === "tipper" && (
              <>
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
                      id={formFieldIds.avatarURL}
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
                      placeholder="you@example.com"
                      fullWidth
                      bordered
                      type="email"
                      id={formFieldIds.lightningAddress}
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
                        <Col>
                          <Text weight="medium">
                            Anonymise my info on scoreboard & public profile
                          </Text>
                          <Text size="small">
                            Note: Your info on created tips will not be
                            anonymized
                          </Text>
                        </Col>
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
              </>
            )}

            <Spacer />
            <Button
              type="submit"
              disabled={isSubmitting}
              css={{ width: "100%" }}
            >
              {isSubmitting ? (
                <Loading color="currentColor" size="sm" />
              ) : (
                <>Update profile</>
              )}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </>
  );
}

export default Profile;

type LinkButtonProps = { route: PageRoutes };

function LinkButton({ route }: LinkButtonProps) {
  return (
    <NextLink href={`${route}?link=true`}>
      <a>
        <Button size="sm" auto>
          Link&nbsp;
          <Icon width={16} height={16}>
            <LinkIcon />
          </Icon>
        </Button>
      </a>
    </NextLink>
  );
}

type UnlinkButtonProps = {
  user: User;
  accountType: DeleteLinkedAccountRequest["accountType"];
  mutateUser: () => void;
};

function UnlinkButton({ user, mutateUser, accountType }: UnlinkButtonProps) {
  const [isSubmitting, setSubmitting] = React.useState(false);
  const isLastLoginMethod =
    [user.phoneNumber, user.email, user.lnurlPublicKey].filter(
      (loginMethod) => !!loginMethod
    ).length === 1;
  const onClick = React.useCallback(async () => {
    if (isSubmitting) {
      throw new Error("Already submitting");
    }
    if (
      window.confirm(
        `Are you sure you wish to unlink this login method?${
          isLastLoginMethod
            ? " WARNING: This is your only login method. If you unlink all login methods your account will be anonymized and you will not be able to login once you have logged out of this session."
            : ""
        }`
      )
    ) {
      setSubmitting(true);
      const deleteLinkedAccountRequest: DeleteLinkedAccountRequest = {
        accountType,
      };
      const result = await fetch(`/api/users/${user.id}/linkedAccounts`, {
        method: "DELETE",
        body: JSON.stringify(deleteLinkedAccountRequest),
        headers: { "Content-Type": "application/json" },
      });
      if (result.ok) {
        await mutateUser();
      } else {
        toast.error("Failed to unlink login method: " + result.statusText);
      }
      setSubmitting(false);
    }
  }, [accountType, isLastLoginMethod, isSubmitting, mutateUser, user.id]);

  return (
    <Button
      size="sm"
      color="error"
      auto
      onClick={onClick}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <Loading color="currentColor" size="sm" />
      ) : (
        <>
          <Icon width={16} height={16}>
            <TrashIcon />
          </Icon>
          Unlink
        </>
      )}
    </Button>
  );
}

type CompleteProfileAction = {
  completed: boolean;
  title: string;
  description: string;
  fieldId: string;
  openConnectedAccounts?: boolean;
};

type CompleteYourProfileProps = {
  openConnectedAccounts(): void;
};

function CompleteYourProfile({
  openConnectedAccounts,
}: CompleteYourProfileProps) {
  const { data: user } = useUser();
  const actions: CompleteProfileAction[] = React.useMemo(() => {
    return [
      {
        completed: !!user?.name,
        title: "Name",
        description:
          "Enter your name so your recipient knows who sent the tip.",
        fieldId: formFieldIds.name,
      },
      {
        completed: !!user?.avatarURL,
        title: "Avatar",
        description: "Add an avatar URL to make your profile more authentic",
        fieldId: formFieldIds.avatarURL,
      },
      {
        completed: !!user?.lightningAddress,
        title: "Lightning Address",
        description: "Receive tips directly from your public profile",
        fieldId: formFieldIds.lightningAddress,
      },
      {
        completed: !!user?.email,
        title: "Email",
        description:
          "Receive notifications when your tips are claimed and withdrawn",
        fieldId: formFieldIds.email,
        openConnectedAccounts: true,
      },
      {
        completed: !!user?.lnurlPublicKey,
        title: "Wallet",
        description:
          "Link your lnurl-auth compatible wallet to easily login to Lightsats.",
        fieldId: formFieldIds.email,
        openConnectedAccounts: true,
      },
    ];
  }, [user]);
  if (!user) {
    return null;
  }
  const progress = Math.round(
    (actions.filter((item) => item.completed).length / actions.length) * 100
  );

  return (
    <>
      {progress < 100 && (
        <>
          <Collapse
            css={{ width: "100%", border: "none" }}
            title={
              <>
                <Row justify="space-between" align="center" css={{ pr: 10 }}>
                  <Text b size="small">
                    Complete your profile
                  </Text>
                  <Text b small>
                    {progress}%
                  </Text>
                </Row>
                <Progress
                  value={progress}
                  color="primary"
                  status="primary"
                  size="sm"
                />
              </>
            }
            shadow
          >
            {actions.map((action, i) => (
              <>
                <Link
                  href={`#${action.fieldId}`}
                  css={{ width: "100%", maxWidth: "none" }}
                >
                  <Row
                    align="center"
                    justify="space-between"
                    onClick={
                      action.openConnectedAccounts
                        ? openConnectedAccounts
                        : undefined
                    }
                  >
                    <Col>
                      <Text b small css={{ m: 0 }}>
                        {action.title}
                      </Text>
                      <Text size="small" css={{ m: 0, lineHeight: 1.2 }}>
                        {action.description}
                      </Text>
                    </Col>
                    <Spacer />
                    <Button
                      flat
                      auto
                      css={{
                        px: 8,
                        color: action.completed ? "$success" : "$warning",
                        background: action.completed
                          ? "$successLight"
                          : "$warningLight",
                      }}
                    >
                      <Icon>
                        {action.completed ? <CheckIcon /> : <XMarkIcon />}
                      </Icon>
                    </Button>
                  </Row>
                </Link>
                {i < actions.length - 1 && <Divider />}
              </>
            ))}
          </Collapse>
          <Spacer />
        </>
      )}
    </>
  );
}

export { getStaticProps };
