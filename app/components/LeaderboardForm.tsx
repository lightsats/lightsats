import {
  Button,
  Card,
  Input,
  Loading,
  Row,
  Spacer,
  Switch,
  Text,
} from "@nextui-org/react";
import { LeaderboardTheme } from "@prisma/client";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { format } from "date-fns";
import { useUserRoles } from "hooks/useUserRoles";
import React from "react";
import { Controller, useForm } from "react-hook-form";

export type LeaderboardFormData = {
  title: string;
  startDate: string;
  endDate: string | undefined;
  startTime: string | undefined;
  theme: LeaderboardTheme | undefined;
  isGlobal: boolean;
  isPublic: boolean;
};

export type LeaderboardFormSubmitData = LeaderboardFormData;

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

type LeaderboardFormProps = {
  onSubmit(formData: LeaderboardFormSubmitData): Promise<void>;
  defaultValues?: LeaderboardFormData;
  mode: "create" | "update";
};

const themeSelectOptions: SelectOption[] = Object.keys(LeaderboardTheme).map(
  (key) => ({
    value: key,
    label: key,
  })
);

export function LeaderboardForm({
  onSubmit: onSubmitProp,
  defaultValues = {
    title: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: undefined,
    startTime: undefined,
    isGlobal: false,
    isPublic: false,
    theme: undefined,
  },
  mode,
}: LeaderboardFormProps) {
  const [isSubmitting, setSubmitting] = React.useState(false);
  const { data: userRoles } = useUserRoles();

  const { control, handleSubmit, setFocus, watch, setValue } =
    useForm<LeaderboardFormData>({
      defaultValues,
    });

  React.useEffect(() => {
    setFocus("title");
  }, [setFocus]);

  const watchedTheme = watch("theme");
  const watchedIsGlobal = watch("isGlobal");

  const setTheme = React.useCallback(
    (theme: LeaderboardTheme | undefined) => setValue("theme", theme),
    [setValue]
  );

  const onSubmit = React.useCallback(
    (data: LeaderboardFormData) => {
      setSubmitting(true);
      (async () => {
        await onSubmitProp({
          ...data,
          startDate: data.startTime
            ? data.startDate + " " + data.startTime
            : data.startDate,
          isPublic: data.isGlobal ? true : data.isPublic,
        });
        setSubmitting(false);
      })();
    },
    [onSubmitProp]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          {userRoles?.some((role) => role.roleType === "SUPERADMIN") && (
            <>
              <Row>
                <Text>Global (All users participate by default)</Text>
              </Row>
              <Row>
                <Controller
                  name="isGlobal"
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
              <Spacer />
            </>
          )}
          {userRoles?.some((role) => role.roleType === "SUPERADMIN") &&
            !watchedIsGlobal && (
              <>
                <Row>
                  <Text>Public (leaderboard listed publically)</Text>
                </Row>
                <Row>
                  <Controller
                    name="isPublic"
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
                <Spacer />
              </>
            )}
          <Row>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Leaderboard Title"
                  placeholder="Legends of Lightning"
                  maxLength={255}
                  fullWidth
                  bordered
                />
              )}
            />
          </Row>
        </Card.Body>
      </Card>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
          <Row>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Start Date"
                  type="date"
                  fullWidth
                  bordered
                />
              )}
            />
            <Spacer />
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <Input {...field} label="Time" type="time" fullWidth bordered />
              )}
            />
          </Row>
          <Spacer />
          <Row>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="End Date"
                  type="date"
                  fullWidth
                  bordered
                />
              )}
            />
          </Row>
          <Spacer />
          <Row>
            <Text>Theme</Text>
          </Row>
          <Row>
            <CustomSelect
              options={themeSelectOptions}
              value={watchedTheme}
              onChange={setTheme}
              isClearable
            />
          </Row>
        </Card.Body>
      </Card>
      <Spacer y={2} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loading color="currentColor" size="sm" />
        ) : (
          <>{mode === "create" ? "Create leaderboard" : "Update leaderboard"}</>
        )}
      </Button>
    </form>
  );
}
