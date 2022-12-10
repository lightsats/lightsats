import { Button, Card, Input, Loading, Row, Spacer } from "@nextui-org/react";
import { format } from "date-fns";
import React from "react";
import { Controller, useForm } from "react-hook-form";

export type LeaderboardFormData = {
  title: string;
  startDate: string;
  endDate: string;
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
  defaultValues?: Partial<LeaderboardFormData>;
  mode: "create" | "update";
};

export function LeaderboardForm({
  onSubmit: onSubmitProp,
  defaultValues = {
    title: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
  },
  mode,
}: LeaderboardFormProps) {
  const [isSubmitting, setSubmitting] = React.useState(false);

  const { control, handleSubmit, setFocus } = useForm<LeaderboardFormData>({
    defaultValues,
  });

  React.useEffect(() => {
    setFocus("title");
  }, [setFocus]);

  const onSubmit = React.useCallback(
    (data: LeaderboardFormData) => {
      setSubmitting(true);
      (async () => {
        await onSubmitProp({ ...data });
        setSubmitting(false);
      })();
    },
    [onSubmitProp]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body>
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
                  maxLength={255}
                  fullWidth
                  bordered
                />
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
                  maxLength={255}
                  fullWidth
                  bordered
                />
              )}
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
